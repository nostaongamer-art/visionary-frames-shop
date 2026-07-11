import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    // Bypass / Fallback de teste local
    if (email === "admin@glasses.com" && password === "admin") {
      // Mock da sessão local (salvo no localStorage para simular login)
      localStorage.setItem("admin_auth_bypass", "true");
      toast.success("Login efetuado com sucesso (modo de teste)!");
      setLoading(false);
      navigate({ to: "/admin" });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Erro de autenticação: ${error.message}`);
      } else {
        toast.success("Login efetuado com sucesso!");
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error(`Erro: ${err.message || "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0D] flex items-center justify-center px-4 select-none">
      <div className="w-full max-w-md bg-[#101217] border border-[#282C32]/40 rounded-lg p-8 shadow-2xl">
        <div className="text-center mb-8">
          <span className="font-display text-4xl font-extrabold tracking-tight">
            <span className="text-[#FF8A00]">Gl</span>
            <span className="text-white">asses</span>
          </span>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-white/50 uppercase">
            Área Administrativa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* E-mail */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70">E-mail</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@glasses.com"
                className="w-full h-11 pl-10 pr-4 bg-[#15181D] border border-[#282C32]/55 rounded-[4px] text-sm text-white placeholder-white/30 outline-none focus:border-[#FF8A00] transition-colors"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70">Senha</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full h-11 pl-10 pr-10 bg-[#15181D] border border-[#282C32]/55 rounded-[4px] text-sm text-white placeholder-white/30 outline-none focus:border-[#FF8A00] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#FF8A00] hover:bg-[#E97800] text-white font-bold text-sm rounded-[4px] flex items-center justify-center gap-2 mt-2 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-[#282C32]/35 pt-4 text-center">
          <p className="text-[10px] text-white/40 leading-relaxed">
            Utilize as credenciais do Supabase ou o acesso rápido de teste:<br />
            <span className="font-mono text-[#FF8A00]">admin@glasses.com</span> / <span className="font-mono text-[#FF8A00]">admin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
