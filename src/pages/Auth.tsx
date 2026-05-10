import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
  fullName: z.string().trim().max(100).optional(),
});

export default function AuthPage() {
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => setMode(initialMode), [initialMode]);

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName || parsed.data.email },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Bem-vindo.");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(msg.includes("Invalid login") ? "E-mail ou senha incorretos" : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Digite seu e-mail primeiro");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      toast.success("E-mail de recuperação enviado!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar e-mail");
    } finally {
      setLoading(false);
    }
  };

  // ── NOVO: Login com Google ──
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar com Google");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #F7F4EF;
        }

        @media (max-width: 768px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-left  { display: none; }
        }

        .auth-left {
          position: relative;
          background: #1C2B3A;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }

        .auth-left-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(197, 154, 108, 0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(92, 130, 160, 0.2) 0%, transparent 60%);
        }

        .auth-left-noise {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        .auth-left-lines {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            rgba(255,255,255,0.015) 40px,
            rgba(255,255,255,0.015) 41px
          );
        }

        .auth-brand {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .auth-brand img {
          width: 36px;
          height: 36px;
          border-radius: 10px;
        }

        .auth-brand-name {
          font-family: 'Lora', serif;
          font-size: 18px;
          font-weight: 600;
          color: #F7F4EF;
          letter-spacing: -0.3px;
        }

        .auth-left-content { position: relative; }

        .auth-left-quote {
          font-family: 'Lora', serif;
          font-size: 28px;
          font-weight: 400;
          font-style: italic;
          line-height: 1.45;
          color: #E8E2D9;
          margin-bottom: 24px;
          letter-spacing: -0.2px;
        }

        .auth-left-quote em { color: #C5986C; font-style: normal; }

        .auth-left-sub {
          font-size: 13px;
          color: rgba(232, 226, 217, 0.5);
          font-weight: 300;
          letter-spacing: 0.3px;
        }

        .auth-left-dots {
          position: absolute;
          bottom: 48px;
          right: 48px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
        }

        .auth-left-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
        }

        .auth-left-dot.lit { background: rgba(197,152,108,0.6); }

        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: #F7F4EF;
        }

        .auth-box {
          width: 100%;
          max-width: 380px;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-box-header { margin-bottom: 36px; }

        .auth-box-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #C5986C;
          margin-bottom: 10px;
        }

        .auth-box-title {
          font-family: 'Lora', serif;
          font-size: 30px;
          font-weight: 600;
          color: #1C2B3A;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .auth-box-subtitle {
          margin-top: 6px;
          font-size: 13.5px;
          color: #7A8695;
          font-weight: 300;
        }

        .auth-field { margin-bottom: 20px; }

        .auth-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.4px;
          color: #3D4E5C;
          margin-bottom: 7px;
        }

        .auth-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #DDD8D0;
          border-radius: 10px;
          background: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1C2B3A;
          transition: border-color 0.18s, box-shadow 0.18s;
          outline: none;
          box-sizing: border-box;
        }

        .auth-input::placeholder { color: #B0AAA0; }

        .auth-input:focus {
          border-color: #1C2B3A;
          box-shadow: 0 0 0 3px rgba(28, 43, 58, 0.08);
        }

        .auth-field-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .auth-forgot {
          font-size: 12px;
          color: #C5986C;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          transition: opacity 0.15s;
        }

        .auth-forgot:hover { opacity: 0.7; }
        .auth-forgot:disabled { opacity: 0.4; cursor: not-allowed; }

        .auth-btn {
          width: 100%;
          padding: 13px;
          background: #1C2B3A;
          color: #F7F4EF;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
          margin-top: 8px;
        }

        .auth-btn:hover:not(:disabled) {
          background: #253748;
          transform: translateY(-1px);
        }

        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Botão Google ── */
        .auth-btn-google {
          width: 100%;
          padding: 12px;
          background: #FFFFFF;
          color: #1C2B3A;
          border: 1.5px solid #DDD8D0;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, transform 0.12s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 12px;
        }

        .auth-btn-google:hover:not(:disabled) {
          background: #F0EDE8;
          border-color: #C5B8AC;
          transform: translateY(-1px);
        }

        .auth-btn-google:disabled { opacity: 0.55; cursor: not-allowed; }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .auth-divider-line {
          flex: 1;
          height: 1px;
          background: #DDD8D0;
        }

        .auth-divider-text {
          font-size: 11px;
          color: #A09890;
          font-weight: 400;
          white-space: nowrap;
        }

        .auth-toggle {
          margin-top: 28px;
          text-align: center;
          font-size: 13px;
          color: #7A8695;
        }

        .auth-toggle button {
          background: none;
          border: none;
          padding: 0;
          margin-left: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #1C2B3A;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }

        .auth-toggle button:hover { color: #C5986C; }

        .auth-ornament {
          position: absolute;
          top: 40px;
          right: 40px;
          width: 80px;
          height: 80px;
          border: 1px solid rgba(28, 43, 58, 0.08);
          border-radius: 50%;
          pointer-events: none;
        }

        .auth-ornament::after {
          content: '';
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(28, 43, 58, 0.05);
          border-radius: 50%;
        }
      `}</style>

      <div className="auth-root">
        {/* ── Esquerda ── */}
        <div className="auth-left">
          <div className="auth-left-bg" />
          <div className="auth-left-noise" />
          <div className="auth-left-lines" />

          <Link to="/" className="auth-brand">
            <img src="/images/android-chrome-192x192.png" alt="UniDatas" />
            <span className="auth-brand-name">UniDatas</span>
          </Link>

          <div className="auth-left-content">
            <p className="auth-left-quote">
              Documentos organizados,<br />
              <em>prazos sob controle.</em>
            </p>
            <p className="auth-left-sub">
              Gerencie vencimentos com clareza e tranquilidade.
            </p>
          </div>

          <div className="auth-left-dots">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={`auth-left-dot ${[2, 7, 13, 19].includes(i) ? "lit" : ""}`} />
            ))}
          </div>
        </div>

        {/* ── Direita ── */}
        <div className="auth-right">
          <div className="auth-ornament" />

          <div className="auth-box">
            <div className="auth-box-header">
              <p className="auth-box-eyebrow">
                {mode === "signup" ? "Novo por aqui?" : "Bem-vindo de volta"}
              </p>
              <h1 className="auth-box-title">
                {mode === "signup" ? "Criar sua conta" : "Acesse sua conta"}
              </h1>
              <p className="auth-box-subtitle">
                {mode === "signup"
                  ? "Comece em menos de 30 segundos."
                  : "Digite seus dados para continuar."}
              </p>
            </div>

            {/* ── Botão Google ── */}
            <button
              type="button"
              className="auth-btn-google"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </button>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">ou continue com e-mail</span>
              <div className="auth-divider-line" />
            </div>

            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="auth-field">
                  <label className="auth-label" htmlFor="fullName">Nome completo</label>
                  <input
                    id="fullName"
                    className="auth-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <div className="auth-field-row">
                  <label className="auth-label" htmlFor="password" style={{ marginBottom: 0 }}>
                    Senha
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      className="auth-forgot"
                      onClick={handleForgotPassword}
                      disabled={loading}
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "••••••••"}
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  style={{ marginTop: 7 }}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading
                  ? "Aguarde..."
                  : mode === "signup"
                  ? "Criar conta"
                  : "Entrar"}
              </button>
            </form>

            <div className="auth-toggle">
              {mode === "signup" ? "Já tem uma conta?" : "Ainda não tem conta?"}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              >
                {mode === "signup" ? "Entrar" : "Criar agora"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}