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
    const { orderId, items, customer, paymentMethod, shippingCost } = await request.json();

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

    // 2. Build items payload
    const mpItems = items.map((item: any) => ({
      title: item.name,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.priceVal) || 0,
      currency_id: "BRL"
    }));

    if (shippingCost && Number(shippingCost) > 0) {
      mpItems.push({
        title: "Frete de Envio",
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: "BRL"
      });
    }

    // 3. Build payer payload
    const [name, ...surnameParts] = (customer.fullName || "").split(" ");
    const surname = surnameParts.join(" ") || "Silva";
    const cleanCpf = customer.cpf ? customer.cpf.replace(/\D/g, "") : "";

    const payer: any = {
      name: name || "Cliente",
      surname,
      email: customer.email || "cliente@email.com",
      phone: {
        number: customer.phone ? customer.phone.replace(/\D/g, "") : ""
      }
    };

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
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: mpItems,
        payer,
        back_urls,
        auto_return: "approved",
        external_reference: orderId,
        payment_methods,
        notification_url: settings.webhookUrl || `${origin}/api/webhook/mercado-pago`
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
              const updatedOrders = content.orders.map((ord: any) => {
                if (ord.id === orderId) {
                  updated = true;
                  return {
                    ...ord,
                    tags: {
                      ...ord.tags,
                      paymentStatus: paymentStatus
                    }
                  };
                }
                return ord;
              });

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

