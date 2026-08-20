import { supabase } from "@/integrations/supabase/client";

export interface MelhorEnvioSettings {
  enabled: boolean;
  mode: "production" | "sandbox";
  tokenSandbox: string;
  tokenProduction: string;
  originCep: string;
  freeShippingEnabled?: boolean;
  disabledCarriers?: string[];
}

export const INITIAL_MELHOR_ENVIO_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOGM0MDEyZTA0ZTNkMDcxNWJlNjM0ODk4NmY2NWMzNzg3YjM1YjMzM2IxMjNkNDgwZmM3ZDNkYzcxZGZlMjUwZTQwYTdhMGZjZTA1Yjk0YjIiLCJpYXQiOjE3ODY3NTA2ODguNjc3MTMyLCJuYmYiOjE3ODY3NTA2ODguNjc3MTMzLCJleHAiOjE4MTgyODY2ODguNjY1MDY0LCJzdWIiOiJjNWZjMGVlNi02MmJjLTQxY2EtOWY5Ny05MDdmYWM0ZTg2OTgiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.WV-4i4k-hZ-LBITUqhg1fBt2Yq6w7uEyD7olxgzNgyfftQG0__VxqcVzAAR9HGoQLxwXEjy5ZlIZZ7m89hLaAbyWG13Uscbg0XQz1i5Ptxut7xTwqZDqyIvz2f7Z5cg0-s9cmD6hqtcJFBUtM0nmEr4NNsf39IgNY0EuasbmNrnOZ8YRqbQWMNHzx2exnNxPf3Sixspr62AFjhw1W3aTcZ4VeXB4Dc2AJspCxgnaXLOsaew3xJmcOEiswXW1l63EkZ5v_Rh4kyOvTZ_HnFx5F9FE3rYp0aPB_i0tQFJnJvPVUVsRGkObAEP8PJvr028TAWAm4AqEw3VIgXUdQqUyE17PYBC1UEiTznVjOR9M1KVsMhKJGPkq9vVCWqixejGzre8hndOKqo4ENVuj3kXmuHfFGrDkRehXjOSqCRvST0Yu6z2W6tCeQev8eLquJQALuIZWw852xEiK_pmvi0FKx6Qplg8froO9czO74VDmveVgghIVzzHVLMlLrKRpiotE8-QixjoqBiULRNndNPScUVtW1j9Vy5E6izAN1RqmbmcPTfi6Sg8hTlbKSdR-ywOHN_4fZQ8gUWYfdLari8FwmpFgbQcL84SELcEFMkQQiLpU0o_y9IegAI_8cQ4bZG6SloVWB_kXPmlvNDnF9nVmaHwQb_fzs-aaOdazDgk_8iY";

export const DEFAULT_MELHOR_ENVIO_SETTINGS: MelhorEnvioSettings = {
  enabled: true,
  mode: "production",
  tokenSandbox: "",
  tokenProduction: INITIAL_MELHOR_ENVIO_TOKEN,
  originCep: "21941395",
  freeShippingEnabled: true,
  disabledCarriers: [],
};

export async function fetchShippingSettings(): Promise<MelhorEnvioSettings> {
  let localFallback = { ...DEFAULT_MELHOR_ENVIO_SETTINGS };

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("glasses_shipping_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          localFallback = {
            ...DEFAULT_MELHOR_ENVIO_SETTINGS,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.error("Failed to read shipping settings from localStorage:", e);
    }
  }

  try {
    const { data, error } = await supabase
      .from("home_page_content")
      .select("content")
      .eq("id", "shipping_settings")
      .single();

    if (error || !data || !data.content || typeof data.content !== "object") {
      saveShippingSettings(localFallback).catch((err) =>
        console.error("Auto-upsert of shipping settings failed:", err)
      );
      return localFallback;
    }

    const saved = data.content as any;
    const merged: MelhorEnvioSettings = {
      enabled: saved.enabled !== undefined ? !!saved.enabled : DEFAULT_MELHOR_ENVIO_SETTINGS.enabled,
      mode: (saved.mode === "production" || saved.mode === "sandbox") ? saved.mode : DEFAULT_MELHOR_ENVIO_SETTINGS.mode,
      tokenSandbox: saved.tokenSandbox || "",
      tokenProduction: saved.tokenProduction || DEFAULT_MELHOR_ENVIO_SETTINGS.tokenProduction,
      originCep: saved.originCep || DEFAULT_MELHOR_ENVIO_SETTINGS.originCep,
      freeShippingEnabled: saved.freeShippingEnabled !== undefined ? !!saved.freeShippingEnabled : DEFAULT_MELHOR_ENVIO_SETTINGS.freeShippingEnabled,
      disabledCarriers: Array.isArray(saved.disabledCarriers) ? saved.disabledCarriers : DEFAULT_MELHOR_ENVIO_SETTINGS.disabledCarriers,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("glasses_shipping_settings", JSON.stringify(merged));
    }

    return merged;
  } catch (err) {
    console.error("Failed to fetch shipping settings from Supabase:", err);
    return localFallback;
  }
}

export interface SaveShippingResult {
  success: boolean;
  error?: string;
  isLocalOnly?: boolean;
}

export async function saveShippingSettings(settings: MelhorEnvioSettings): Promise<SaveShippingResult> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("glasses_shipping_settings", JSON.stringify(settings));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to write shipping settings to localStorage:", e);
    }
  }

  try {
    const { error } = await supabase.from("home_page_content").upsert({
      id: "shipping_settings",
      content: settings as any,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error upserting shipping settings to Supabase:", error);
      return { success: true, isLocalOnly: true, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to save shipping settings to Supabase:", error);
    return { success: true, isLocalOnly: true, error: err.message || "Erro desconhecido" };
  }
}
