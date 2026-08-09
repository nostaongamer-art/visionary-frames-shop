import { supabase } from "@/integrations/supabase/client";

export interface MercadoPagoSettings {
  enabled: boolean;
  mode: "production" | "sandbox";
  publicKeySandbox: string;
  accessTokenSandbox: string;
  publicKeyProduction: string;
  accessTokenProduction: string;
  webhookUrl: string;
  webhookSecret: string;
}

export const DEFAULT_MERCADO_PAGO_SETTINGS: MercadoPagoSettings = {
  enabled: false,
  mode: "sandbox",
  publicKeySandbox: "",
  accessTokenSandbox: "",
  publicKeyProduction: "",
  accessTokenProduction: "",
  webhookUrl: "/api/webhook/mercado-pago",
  webhookSecret: "",
};

export async function fetchPaymentSettings(): Promise<MercadoPagoSettings> {
  let localFallback = { ...DEFAULT_MERCADO_PAGO_SETTINGS };

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("glasses_payment_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          localFallback = {
            ...DEFAULT_MERCADO_PAGO_SETTINGS,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.error("Failed to read payment settings from localStorage:", e);
    }
  }

  try {
    const { data, error } = await supabase
      .from("home_page_content")
      .select("content")
      .eq("id", "payment_settings")
      .single();

    if (error || !data || !data.content || typeof data.content !== "object") {
      // Auto-upsert standard default values to Supabase to initialize
      savePaymentSettings(localFallback).catch((err) =>
        console.error("Auto-upsert of payment settings failed:", err)
      );
      return localFallback;
    }

    const saved = data.content as any;
    const merged: MercadoPagoSettings = {
      enabled: saved.enabled !== undefined ? !!saved.enabled : DEFAULT_MERCADO_PAGO_SETTINGS.enabled,
      mode: (saved.mode === "production" || saved.mode === "sandbox") ? saved.mode : DEFAULT_MERCADO_PAGO_SETTINGS.mode,
      publicKeySandbox: saved.publicKeySandbox || "",
      accessTokenSandbox: saved.accessTokenSandbox || "",
      publicKeyProduction: saved.publicKeyProduction || "",
      accessTokenProduction: saved.accessTokenProduction || "",
      webhookUrl: saved.webhookUrl || DEFAULT_MERCADO_PAGO_SETTINGS.webhookUrl,
      webhookSecret: saved.webhookSecret || "",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("glasses_payment_settings", JSON.stringify(merged));
    }

    return merged;
  } catch (err) {
    console.error("Failed to fetch payment settings from Supabase:", err);
    return localFallback;
  }
}

export interface SaveResult {
  success: boolean;
  error?: string;
  isLocalOnly?: boolean;
}

export async function savePaymentSettings(settings: MercadoPagoSettings): Promise<SaveResult> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("glasses_payment_settings", JSON.stringify(settings));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to write payment settings to localStorage during save:", e);
    }
  }

  try {
    const { error } = await supabase.from("home_page_content").upsert({
      id: "payment_settings",
      content: settings as any,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error upserting payment settings to Supabase:", error);
      return { success: true, isLocalOnly: true, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to save payment settings to Supabase:", err);
    return { success: true, isLocalOnly: true, error: err.message || "Erro desconhecido" };
  }
}
