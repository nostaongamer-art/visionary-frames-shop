import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { supabase } from "./integrations/supabase/client";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// A client that navigates away / reloads mid-render kills the socket. Node surfaces
// this as `Error: aborted` (ECONNRESET) — it is not an application error.
function isClientAbort(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const e = current as { code?: unknown; message?: unknown; name?: unknown; cause?: unknown };
    if (
      e.code === "ECONNRESET" ||
      e.code === "ECONNABORTED" ||
      e.name === "AbortError" ||
      e.message === "aborted"
    ) {
      return true;
    }
    current = e.cause;
  }
  return false;
}

async function handleCreatePayment(request: Request): Promise<Response> {
  try {
    const { orderId, items, customer, paymentMethod, shippingCost, couponApplied } = await request.json();

    // 1. Fetch settings from Supabase
    const { data: dbData, error: dbError } = await supabase
      .from("home_page_content")
      .select("content")
      .eq("id", "payment_settings")
      .single();

    if (dbError || !dbData || !dbData.content) {
      return new Response(JSON.stringify({ success: false, isMpDisabled: true, error: "Configurações de pagamento não encontradas." }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    const settings = dbData.content as any;
    if (!settings.enabled) {
      return new Response(JSON.stringify({ success: false, isMpDisabled: true, error: "Pagamento via Mercado Pago está desativado." }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    const mode = settings.mode || "sandbox";
    const accessToken = mode === "production" ? settings.accessTokenProduction : settings.accessTokenSandbox;

    if (!accessToken) {
      return new Response(JSON.stringify({ success: false, isMpDisabled: true, error: `Token de acesso (${mode}) não configurado.` }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    // 2. Build items payload (Mercado Pago aceita no máximo 2 decimais)
    const round2 = (v: number) => Math.round((Number(v) || 0) * 100) / 100;
    const mpItems = items.map((item: any, idx: number) => {
      const pctMatch = item.discount ? item.discount.match(/(\d+)/) : null;
      const pct = pctMatch ? parseInt(pctMatch[1]) : 0;
      
      let discountedPrice = Number(item.priceVal) || 0;
      if (pct > 0) {
        discountedPrice = discountedPrice * (1 - pct / 100);
      }
      
      if (couponApplied) {
        discountedPrice = discountedPrice * 0.9; // Apply extra 10% coupon
      }

      return {
        id: String(item.id ?? idx + 1),
        title: String(item.name || "Produto").slice(0, 250),
        description: String(item.name || "Produto").slice(0, 250),
        category_id: "fashion",
        quantity: Number(item.quantity) || 1,
        unit_price: round2(discountedPrice),
        currency_id: "BRL"
      };
    });

    if (shippingCost && Number(shippingCost) > 0) {
      mpItems.push({
        id: "frete",
        title: "Frete de Envio",
        description: "Frete de Envio",
        category_id: "services",
        quantity: 1,
        unit_price: round2(shippingCost),
        currency_id: "BRL"
      });
    }


    // 3. Build payer payload
    const [name, ...surnameParts] = (customer.fullName || "").split(" ");
    const surname = surnameParts.join(" ") || "Silva";
    const cleanCpf = customer.cpf ? customer.cpf.replace(/\D/g, "") : "";
    const cleanPhone = customer.phone ? customer.phone.replace(/\D/g, "") : "";

    const payer: any = {
      name: name || "Cliente",
      surname,
      email: customer.email || "cliente@email.com",
    };

    // Mercado Pago rejects phone objects without area_code / with empty number
    if (cleanPhone.length >= 10) {
      payer.phone = {
        area_code: cleanPhone.slice(0, 2),
        number: cleanPhone.slice(2),
      };
    }

    if (cleanCpf && cleanCpf.length === 11) {
      payer.identification = {
        type: "CPF",
        number: cleanCpf
      };
    }

    // 4. Build return URLs
    const origin = request.headers.get("origin") || `https://${request.headers.get("host")}`;
    const back_urls = {
      success: `${origin}/checkout?action=thank-you&orderId=${orderId}`,
      failure: `${origin}/checkout?action=checkout&status=fail`,
      pending: `${origin}/checkout?action=thank-you&orderId=${orderId}`
    };

    // 5. Restrict payment methods based on checkout selection
    const payment_methods: any = {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 12
    };

    if (paymentMethod === "pix") {
      payment_methods.excluded_payment_types = [
        { id: "credit_card" },
        { id: "debit_card" },
        { id: "ticket" },
        { id: "atm" }
      ];
    } else if (paymentMethod === "boleto") {
      payment_methods.excluded_payment_types = [
        { id: "credit_card" },
        { id: "debit_card" },
        { id: "bank_transfer" },
        { id: "atm" }
      ];
    } else if (paymentMethod === "credit_card") {
      payment_methods.excluded_payment_types = [
        { id: "ticket" },
        { id: "bank_transfer" },
        { id: "atm" }
      ];
    }

    // 6. Create preference via Mercado Pago API
    // notification_url precisa ser absoluta e https; valores relativos são inválidos
    const rawWebhook = String(settings.webhookUrl || "");
    const notificationUrl = rawWebhook.startsWith("https://")
      ? rawWebhook
      : `${origin.replace(/^http:/, "https:")}/api/webhook/mercado-pago`;

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${orderId}-${Date.now()}`
      },
      body: JSON.stringify({
        items: mpItems,
        payer,
        back_urls,
        auto_return: "approved",
        external_reference: orderId,
        statement_descriptor: "GLASSES",
        payment_methods,
        notification_url: notificationUrl
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Mercado Pago preference creation failed:", data);
      return new Response(JSON.stringify({ success: false, error: data.message || "Erro na API do Mercado Pago." }), {
        status: response.status,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      initPoint: mode === "production" ? data.init_point : data.sandbox_init_point
    }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err: any) {
    console.error("Error creating Mercado Pago payment:", err);
    return new Response(JSON.stringify({ success: false, error: err.message || "Erro interno do servidor." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

async function decrementProductStockServer(productName: string, quantityToSubtract: number) {
  const catalogIds = ["colecoes", "feminino", "masculino", "premium", "promocoes", "solar"];
  for (const catId of catalogIds) {
    try {
      const { data } = await supabase
        .from("home_page_content")
        .select("content")
        .eq("id", catId)
        .single();
      
      const pageData = data?.content as any;
      if (pageData && Array.isArray(pageData.products)) {
        let updated = false;
        const updatedProducts = pageData.products.map((p: any) => {
          if (p.name && p.name.trim().toLowerCase() === productName.trim().toLowerCase()) {
            if (p.stock !== undefined && !isNaN(p.stock)) {
              updated = true;
              return { ...p, stock: Math.max(0, Number(p.stock) - quantityToSubtract) };
            }
          }
          return p;
        });

        if (updated) {
          await supabase.from("home_page_content").upsert({
            id: catId,
            content: { ...pageData, products: updatedProducts },
            updated_at: new Date().toISOString()
          });
          console.log(`[Server] Decremented stock for "${productName}" in section "${catId}" by ${quantityToSubtract}`);
        }
      }
    } catch (e) {
      console.error(`[Server] Error decrementing stock for ${productName}:`, e);
    }
  }
}

async function handleMercadoPagoWebhook(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    let paymentId = url.searchParams.get("id");
    let topic = url.searchParams.get("topic");

    if (!paymentId && request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json();
      if (body.type === "payment" && body.data?.id) {
        paymentId = body.data.id;
        topic = "payment";
      }
    }

    if (topic === "payment" && paymentId) {
      const { data: dbData } = await supabase
        .from("home_page_content")
        .select("content")
        .eq("id", "payment_settings")
        .single();
      
      const settings = dbData?.content as any;
      const mode = settings?.mode || "sandbox";
      const accessToken = mode === "production" ? settings?.accessTokenProduction : settings?.accessTokenSandbox;

      if (accessToken) {
        const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          const orderId = paymentData.external_reference;
          const status = paymentData.status;

          if (orderId && orderId.startsWith("PED-")) {
            let paymentStatus: "pago" | "pendente" | "reembolsado" = "pendente";
            if (status === "approved") {
              paymentStatus = "pago";
            } else if (status === "refunded" || status === "charged_back") {
              paymentStatus = "reembolsado";
            }

            const { data: orderData } = await supabase
              .from("home_page_content")
              .select("content")
              .eq("id", "orders_list")
              .single();
            
            const content = orderData?.content as any;
            if (content && Array.isArray(content.orders)) {
              let updated = false;
              const targetOrder = content.orders.find((o: any) => o.id === orderId);

              if (targetOrder) {
                let stockDecremented = targetOrder.tags?.stockDecremented || false;
                if (paymentStatus === "pago" && !stockDecremented) {
                  stockDecremented = true;
                  // Decrement stock for all items
                  if (Array.isArray(targetOrder.items)) {
                    for (const item of targetOrder.items) {
                      try {
                        await decrementProductStockServer(item.name, item.quantity);
                      } catch (e) {
                        console.error("Error decrementing stock on server webhook:", item.name, e);
                      }
                    }
                  }
                }

                const updatedOrders = [];
                for (const ord of content.orders) {
                  if (ord.id === orderId) {
                    updated = true;
                    updatedOrders.push({
                      ...ord,
                      tags: {
                        ...ord.tags,
                        paymentStatus: paymentStatus,
                        stockDecremented: stockDecremented
                      }
                    });
                  } else {
                    // Se for outro pedido pendente do mesmo cliente, deleta ele!
                    if (
                      ord.tags?.paymentStatus === "pendente" &&
                      ord.customerEmail?.trim().toLowerCase() === targetOrder.customerEmail?.trim().toLowerCase()
                    ) {
                      updated = true;
                      console.log(`[Server Webhook] Deleting duplicated pending order ${ord.id} for ${ord.customerEmail}`);
                      continue; // Pula (deleta)
                    }
                    updatedOrders.push(ord);
                  }
                }

                if (updated) {
                  await supabase.from("home_page_content").upsert({
                    id: "orders_list",
                    content: { orders: updatedOrders },
                    updated_at: new Date().toISOString()
                  });
                }
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  }
}

async function handleTrackingRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: "Código de rastreamento não informado." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const { data: shippingData } = await supabase
      .from("home_page_content")
      .select("content")
      .eq("id", "shipping_settings")
      .single();

    const content = shippingData?.content as any;
    const token =
      content?.tokenProduction ||
      content?.tokenSandbox ||
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOGM0MDEyZTA0ZTNkMDcxNWJlNjM0ODk4NmY2NWMzNzg3YjM1YjMzM2IxMjNkNDgwZmM3ZDNkYzcxZGZlMjUwZTQwYTdhMGZjZTA1Yjk0YjIiLCJpYXQiOjE3ODY3NTA2ODguNjc3MTMyLCJuYmYiOjE3ODY3NTA2ODguNjc3MTMzLCJleHAiOjE4MTgyODY2ODguNjY1MDY0LCJzdWIiOiJjNWZjMGVlNi02MmJjLTQxY2EtOWY5Ny05MDdmYWM0ZTg2OTgiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.WV-4i4k-hZ-LBITUqhg1fBt2Yq6w7uEyD7olxgzNgyfftQG0__VxqcVzAAR9HGoQLxwXEjy5ZlIZZ7m89hLaAbyWG13Uscbg0XQz1i5Ptxut7xTwqZDqyIvz2f7Z5cg0-s9cmD6hqtcJFBUtM0nmEr4NNsf39IgNY0EuasbmNrnOZ8YRqbQWMNHzx2exnNxPf3Sixspr62AFjhw1W3aTcZ4VeXB4Dc2AJspCxgnaXLOsaew3xJmcOEiswXW1l63EkZ5v_Rh4kyOvTZ_HnFx5F9FE3rYp0aPB_i0tQFJnJvPVUVsRGkObAEP8PJvr028TAWAm4AqEw3VIgXUdQqUyE17PYBC1UEiTznVjOR9M1KVsMhKJGPkq9vVCWqixejGzre8hndOKqo4ENVuj3kXmuHfFGrDkRehXjOSqCRvST0Yu6z2W6tCeQev8eLquJQALuIZWw852xEiK_pmvi0FKx6Qplg8froO9czO74VDmveVgghIVzzHVLMlLrKRpiotE8-QixjoqBiULRNndNPScUVtW1j9Vy5E6izAN1RqmbmcPTfi6Sg8hTlbKSdR-ywOHN_4fZQ8gUWYfdLari8FwmpFgbQcL84SELcEFMkQQiLpU0o_y9IegAI_8cQ4bZG6SloVWB_kXPmlvNDnF9nVmaHwQb_fzs-aaOdazDgk_8iY";

    const isSandbox = content?.mode === "sandbox";
    const baseUrl = isSandbox
      ? "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/tracking"
      : "https://melhorenvio.com.br/api/v2/me/shipment/tracking";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "GlassesStore/1.0",
      },
      body: JSON.stringify({ orders: [code] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ success: false, error: `Erro na API do Melhor Envio (${response.status}): ${errorText.substring(0, 100)}` }),
        { status: response.status, headers: { "content-type": "application/json" } }
      );
    }

    const data = await response.json();
    const result = data[code] || Object.values(data)[0] || data;

    return new Response(
      JSON.stringify({ success: true, tracking: result }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Tracking API failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Erro interno ao rastrear encomenda." }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

async function handleCalculateShipping(request: Request): Promise<Response> {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      const url = new URL(request.url);
      body = { cep: url.searchParams.get("cep") };
    }

    const destinationCep = (body.cep || "").replace(/\D/g, "");
    if (!destinationCep || destinationCep.length !== 8) {
      return new Response(
        JSON.stringify({ success: false, error: "CEP de destino inválido." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const { data: shippingData } = await supabase
      .from("home_page_content")
      .select("content")
      .eq("id", "shipping_settings")
      .single();

    const content = shippingData?.content as any;
    const token =
      content?.tokenProduction ||
      content?.tokenSandbox ||
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOGM0MDEyZTA0ZTNkMDcxNWJlNjM0ODk4NmY2NWMzNzg3YjM1YjMzM2IxMjNkNDgwZmM3ZDNkYzcxZGZlMjUwZTQwYTdhMGZjZTA1Yjk0YjIiLCJpYXQiOjE3ODY3NTA2ODguNjc3MTMyLCJuYmYiOjE3ODY3NTA2ODguNjc3MTMzLCJleHAiOjE4MTgyODY2ODguNjY1MDY0LCJzdWIiOiJjNWZjMGVlNi02MmJjLTQxY2EtOWY5Ny05MDdmYWM0ZTg2OTgiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.WV-4i4k-hZ-LBITUqhg1fBt2Yq6w7uEyD7olxgzNgyfftQG0__VxqcVzAAR9HGoQLxwXEjy5ZlIZZ7m89hLaAbyWG13Uscbg0XQz1i5Ptxut7xTwqZDqyIvz2f7Z5cg0-s9cmD6hqtcJFBUtM0nmEr4NNsf39IgNY0EuasbmNrnOZ8YRqbQWMNHzx2exnNxPf3Sixspr62AFjhw1W3aTcZ4VeXB4Dc2AJspCxgnaXLOsaew3xJmcOEiswXW1l63EkZ5v_Rh4kyOvTZ_HnFx5F9FE3rYp0aPB_i0tQFJnJvPVUVsRGkObAEP8PJvr028TAWAm4AqEw3VIgXUdQqUyE17PYBC1UEiTznVjOR9M1KVsMhKJGPkq9vVCWqixejGzre8hndOKqo4ENVuj3kXmuHfFGrDkRehXjOSqCRvST0Yu6z2W6tCeQev8eLquJQALuIZWw852xEiK_pmvi0FKx6Qplg8froO9czO74VDmveVgghIVzzHVLMlLrKRpiotE8-QixjoqBiULRNndNPScUVtW1j9Vy5E6izAN1RqmbmcPTfi6Sg8hTlbKSdR-ywOHN_4fZQ8gUWYfdLari8FwmpFgbQcL84SELcEFMkQQiLpU0o_y9IegAI_8cQ4bZG6SloVWB_kXPmlvNDnF9nVmaHwQb_fzs-aaOdazDgk_8iY";

    const originCep = (content?.originCep || "21941395").replace(/\D/g, "");
    const isSandbox = content?.mode === "sandbox";
    const baseUrl = isSandbox
      ? "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate"
      : "https://melhorenvio.com.br/api/v2/me/shipment/calculate";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "GlassesStore/1.0",
      },
      body: JSON.stringify({
        from: { postal_code: originCep },
        to: { postal_code: destinationCep },
        package: {
          weight: 0.3,
          width: 15,
          height: 7,
          length: 20,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ success: false, error: `Erro no cálculo de frete (${response.status}): ${errorText.substring(0, 100)}` }),
        { status: response.status, headers: { "content-type": "application/json" } }
      );
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [];

    const disabledCarriers = Array.isArray(content?.disabledCarriers) ? content.disabledCarriers : [];

    const getCarrierKey = (companyName: string, serviceName: string) => {
      const co = companyName.toLowerCase();
      const sv = serviceName.toLowerCase();
      if (co.includes("correios")) {
        if (sv.includes("pac")) return "correios-pac";
        if (sv.includes("sedex")) return "correios-sedex";
      }
      if (co.includes("jadlog")) {
        if (sv.includes("centralizado")) return "jadlog-centralizado";
        if (sv.includes("package")) return "jadlog-package";
        if (sv.includes(".com")) return "jadlog-com";
      }
      if (co.includes("buslog")) return "buslog";
      if (co.includes("loggi")) {
        if (sv.includes("express")) return "loggi-express";
        if (sv.includes("coleta")) return "loggi-coleta";
        if (sv.includes("ponto")) return "loggi-ponto";
      }
      if (co.includes("jet")) return "jet";
      if (co.includes("total express")) return "total-express";
      return "";
    };

    const options = items
      .filter((item: any) => !item.error && item.price)
      .map((item: any) => ({
        id: String(item.id),
        name: item.name,
        company: item.company?.name || "Correios",
        price: parseFloat(item.custom_price || item.price || "0"),
        deliveryTime: item.delivery_time || 5,
        deliveryRange: item.delivery_range ? `${item.delivery_range.min} a ${item.delivery_range.max} dias úteis` : `${item.delivery_time} dias úteis`,
      }))
      .filter((opt: any) => {
        const key = getCarrierKey(opt.company, opt.name);
        if (key && disabledCarriers.includes(key)) {
          return false;
        }
        return true;
      });

    return new Response(
      JSON.stringify({ success: true, options }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Shipping calculation failed:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || "Erro ao calcular frete." }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/create-payment" && request.method === "POST") {
        return await handleCreatePayment(request);
      }

      if (url.pathname.startsWith("/api/webhook/mercado-pago")) {
        return await handleMercadoPagoWebhook(request);
      }

      if (url.pathname === "/api/tracking" && (request.method === "GET" || request.method === "POST")) {
        return await handleTrackingRequest(request);
      }

      if (url.pathname === "/api/calculate-shipping" && (request.method === "GET" || request.method === "POST")) {
        return await handleCalculateShipping(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      if (response.status >= 500 && request.signal?.aborted) return response;
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      if (isClientAbort(error) || request.signal?.aborted) {
        return new Response(null, { status: 499 });
      }
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

