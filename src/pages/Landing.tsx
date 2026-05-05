import { Link, Navigate } from "react-router-dom";
import { ArrowRight, BellRing, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        background: "#fafaf8",
        color: "#1a1a1a",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        .vf-serif { font-family: 'Playfair Display', Georgia, serif; }
        .vf-sans { font-family: 'DM Sans', sans-serif; }

        .vf-hero-word {
          display: inline-block;
          position: relative;
        }
        .vf-hero-word::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 100%;
          height: 3px;
          background: #2563eb;
        }

        .vf-step-num {
          font-family: 'Playfair Display', serif;
          font-size: 80px;
          font-weight: 900;
          line-height: 1;
          color: #e8e8e4;
          position: absolute;
          top: -20px;
          left: -10px;
          z-index: 0;
          user-select: none;
        }

        .vf-tag {
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #2563eb;
          border-top: 2px solid #2563eb;
          padding-top: 6px;
          margin-bottom: 20px;
        }

        .vf-nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #444;
          text-decoration: none;
          transition: color 0.2s;
        }
        .vf-nav-link:hover { color: #111; }

        .vf-btn-primary {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          background: #1a1a1a;
          color: #fff;
          border: none;
          padding: 14px 28px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .vf-btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .vf-btn-ghost {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          background: transparent;
          color: #444;
          border: 1px solid #d0d0c8;
          padding: 13px 24px;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .vf-btn-ghost:hover { border-color: #888; color: #111; }

        .vf-divider {
          width: 40px;
          height: 2px;
          background: #1a1a1a;
          margin: 20px 0;
        }

        .vf-float-card {
          position: absolute;
          background: #fff;
          border: 1px solid #e0e0d8;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          min-width: 210px;
        }

        .vf-feature-card {
          border-top: 1px solid #ddd;
          padding: 28px 0;
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 20px;
          align-items: start;
        }

        .vf-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .vf-problem-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 48px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .vf-problem-item {
          padding: 32px;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .vf-problem-item:last-child { border-right: none; }

        .vf-howto-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 80px;
          align-items: start;
        }

        .vf-howto-sticky {
          position: sticky;
          top: 80px;
        }

        .vf-features-grid {
          columns: 2;
          gap: 0;
        }

        .vf-step-card {
          padding: 40px 32px 36px;
          background: #fff;
          border: 1px solid #e8e8e0;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .vf-step-card:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.07); }

        .vf-faq-item {
          border-bottom: 1px solid #e0e0d8;
          padding: 24px 0;
        }

        .vf-free-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #166534;
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          padding: 4px 12px;
          border-radius: 2px;
          margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .vf-hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .vf-float-card { display: none; }
          .vf-hero-bg-deco { display: none; }
          .vf-hero-img { height: 260px !important; }
          .vf-problem-grid { grid-template-columns: 1fr; }
          .vf-problem-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .vf-problem-item:last-child { border-bottom: none; }
          .vf-howto-grid { grid-template-columns: 1fr; gap: 32px; }
          .vf-howto-sticky { position: static; }
          .vf-features-grid { columns: 1; }
          .vf-step-card { padding: 32px 24px 28px; }
          .vf-hero-actions { flex-direction: column; align-items: stretch; }
          .vf-btn-primary, .vf-btn-ghost { justify-content: center; text-align: center; }
          .vf-footer { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid #e0e0d8",
        background: "rgba(250,250,248,0.95)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/images/android-chrome-192x192.png" alt="UniDatas" style={{ height: 28, width: 28, borderRadius: 6 }} />
            <span className="vf-serif" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: "#111" }}>UniDatas</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link to="/auth" className="vf-nav-link">Entrar</Link>
            <Link to="/auth?mode=signup" className="vf-btn-primary" style={{ padding: "9px 18px", fontSize: 13 }}>
              Criar conta gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 20px 56px" }}>
        <div className="vf-hero-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span className="vf-tag" style={{ margin: 0 }}>Controle de documentos</span>
              <span className="vf-tag" style={{ margin: 0, color: "#16a34a", borderColor: "#16a34a" }}>Gratuito</span>
            </div>
            <div style={{ marginBottom: 20 }} />

            <h1 className="vf-serif" style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#111",
              margin: 0,
            }}>
              Documentos vencidos
              <br />
              custam caro.{" "}
              <span className="vf-hero-word" style={{ color: "#2563eb" }}>Literalmente.</span>
            </h1>

            <div className="vf-divider" />

            <p className="vf-sans" style={{ fontSize: 16, color: "#555", lineHeight: 1.75, marginTop: 0, maxWidth: 440 }}>
              Cadastre seus funcionários e documentos uma vez.
              O UniDatas te avisa por email antes de qualquer prazo vencer — sem planilha, sem surpresa.
            </p>

            <div className="vf-hero-actions" style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
              <Link to="/auth?mode=signup" className="vf-btn-primary">
                Criar conta <ArrowRight size={15} />
              </Link>
              <Link to="/auth" className="vf-btn-ghost">
                Já tenho conta
              </Link>
            </div>

            <p className="vf-sans" style={{ fontSize: 12, color: "#aaa", marginTop: 16 }}>
              Sem cartão de crédito. Acesso completo desde o primeiro dia.
            </p>
          </div>

          {/* Imagem */}
          <div style={{ position: "relative" }}>
            <div className="vf-hero-bg-deco" style={{
              position: "absolute",
              top: -16, right: -16, bottom: -16, left: 16,
              background: "#e8e8e0",
              zIndex: 0,
            }} />
            <img
              src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=700&h=500&fit=crop&q=80"
              alt="Equipe de RH"
              className="vf-hero-img"
              style={{ width: "100%", height: 420, objectFit: "cover", display: "block", position: "relative", zIndex: 1 }}
              loading="lazy"
            />

            <div className="vf-float-card" style={{ bottom: 32, left: -40, zIndex: 2 }}>
              <div style={{ width: 36, height: 36, background: "#fff3e0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BellRing size={16} color="#e65100" />
              </div>
              <div>
                <p className="vf-sans" style={{ fontSize: 12, fontWeight: 600, color: "#111", margin: 0 }}>NR-10 vence em 3 dias</p>
                <p className="vf-sans" style={{ fontSize: 11, color: "#888", margin: 0 }}>Joãozinho — Empresa ABC</p>
              </div>
            </div>

            <div className="vf-float-card" style={{ top: 32, right: -40, zIndex: 2 }}>
              <div style={{ width: 36, height: 36, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck size={16} color="#2e7d32" />
              </div>
              <div>
                <p className="vf-sans" style={{ fontSize: 12, fontWeight: 600, color: "#111", margin: 0 }}>Tudo em dia</p>
                <p className="vf-sans" style={{ fontSize: 11, color: "#888", margin: 0 }}>12 documentos ativos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ borderTop: "1px solid #e0e0d8", borderBottom: "1px solid #e0e0d8", padding: "18px 20px", textAlign: "center" }}>
        <p className="vf-sans" style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          Usado por empresas que não querem depender de planilha
        </p>
      </div>

      {/* ── PROBLEMA ── */}
      <section style={{ background: "#111", padding: "80px 0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>
          <span className="vf-tag" style={{ color: "#6b8cff", borderColor: "#6b8cff" }}>O problema real</span>
          <h2 className="vf-serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", color: "#fff", fontWeight: 900, marginTop: 0, maxWidth: 560 }}>
            Você conhece esse pesadelo?
          </h2>

          <div className="vf-problem-grid">
            {[
              {
                n: "01",
                title: "A multa que poderia ter evitado",
                text: "O ASO venceu numa planilha que ninguém abriu. O fiscal chegou primeiro.",
              },
              {
                n: "02",
                title: "Só descobriu tarde demais",
                text: "O NR venceu meses atrás. Ninguém percebeu até o acidente.",
              },
              {
                n: "03",
                title: "Verificação manual toda semana",
                text: "Dezenas de documentos, dezenas de datas, e tudo na memória de alguém.",
              },
            ].map((item) => (
              <div key={item.n} className="vf-problem-item">
                <span className="vf-sans" style={{ fontSize: 11, color: "#666", letterSpacing: "0.1em" }}>{item.n}</span>
                <h3 className="vf-serif" style={{ fontSize: 17, color: "#fff", fontWeight: 700, margin: "12px 0 10px", lineHeight: 1.3 }}>{item.title}</h3>
                <p className="vf-sans" style={{ fontSize: 14, color: "#888", lineHeight: 1.65, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "80px 20px" }}>
        <div className="vf-howto-grid">
          <div className="vf-howto-sticky">
            <span className="vf-tag">Como funciona</span>
            <h2 className="vf-serif" style={{ fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)", fontWeight: 900, lineHeight: 1.2, color: "#111", margin: 0 }}>
              Três passos.<br />Pronto.
            </h2>
            <div className="vf-divider" />
            <p className="vf-sans" style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>
              Sem treinamento, sem onboarding de 2 horas, sem suporte técnico.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              {
                n: "01",
                title: "Cadastre os funcionários",
                desc: "Nome, CPF, cargo, empresa. Leva menos de um minuto por pessoa.",
                detail: "Pode importar em massa se quiser — mas mesmo um a um vai rápido.",
              },
              {
                n: "02",
                title: "Insira as datas dos documentos",
                desc: "ASO, NR-10, NR-33, AVCB, habilitações. Data de emissão e vencimento.",
                detail: "Só isso. Sem campo obrigatório desnecessário.",
              },
              {
                n: "03",
                title: "Receba o alerta no email",
                desc: "Antes de vencer, você recebe um email automático. Simples.",
                detail: "Sem app para instalar, sem push notification, sem mais uma senha para lembrar.",
              },
            ].map((item) => (
              <div key={item.n} className="vf-step-card">
                <span className="vf-step-num">{item.n}</span>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h3 className="vf-serif" style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: "0 0 10px" }}>{item.title}</h3>
                  <p className="vf-sans" style={{ fontSize: 15, color: "#333", margin: "0 0 6px", lineHeight: 1.6 }}>{item.desc}</p>
                  <p className="vf-sans" style={{ fontSize: 13, color: "#999", margin: 0, lineHeight: 1.6 }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: "#f4f4f0", padding: "80px 0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>
          <span className="vf-tag">O que tem dentro</span>
          <h2 className="vf-serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 900, color: "#111", marginTop: 0, marginBottom: 48, maxWidth: 400 }}>
            Nada de feature inútil.
          </h2>

          <div className="vf-features-grid">
            {[
              { label: "Alertas automáticos", desc: "Email antes de vencer. Você escolhe com quantos dias de antecedência." },
              { label: "Painel de vencimentos", desc: "Vencidos, urgentes e a vencer — tudo numa tela só, sem precisar filtrar." },
              { label: "Por empresa ou por funcionário", desc: "Você organiza do jeito que faz sentido pro seu processo." },
              { label: "Rápido de verdade", desc: "Cadastre um funcionário do zero em menos de 1 minuto." },
              { label: "Seus dados são seus", desc: "Nada é compartilhado. Hospedagem segura, backup diário." },
              { label: "Roda no celular", desc: "Sem app para instalar. Qualquer navegador, qualquer dispositivo." },
            ].map((f) => (
              <div key={f.label} className="vf-feature-card" style={{ breakInside: "avoid" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a1a1a", marginTop: 2, flexShrink: 0 }} />
                <div>
                  <h3 className="vf-serif" style={{ fontSize: 16, fontWeight: 700, color: "#111", margin: "0 0 6px" }}>{f.label}</h3>
                  <p className="vf-sans" style={{ fontSize: 14, color: "#666", margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "80px 20px" }}>
        <span className="vf-tag">Dúvidas</span>
        <h2 className="vf-serif" style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", fontWeight: 900, color: "#111", marginTop: 0, marginBottom: 40 }}>
          Perguntas diretas.<br />Respostas diretas.
        </h2>

        {[
          { q: "Quanto custa?", a: "Nada. O UniDatas é gratuito." },
          { q: "Como recebo os alertas?", a: "Por email, automaticamente. Você configura quantos dias antes quer ser avisado." },
          { q: "Precisa instalar alguma coisa?", a: "Não. Roda direto no navegador. Celular, tablet, computador — tanto faz." },
          { q: "Quantos funcionários posso cadastrar?", a: "Ilimitados. Sem limite, sem cobrança por usuário adicional." },
          { q: "Meus dados ficam seguros?", a: "Sim. Hospedagem segura, backup diário. Seus dados não são compartilhados com ninguém." },
        ].map((item) => (
          <div key={item.q} className="vf-faq-item">
            <h3 className="vf-sans" style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: "0 0 8px" }}>{item.q}</h3>
            <p className="vf-sans" style={{ fontSize: 14, color: "#666", margin: 0, lineHeight: 1.7 }}>{item.a}</p>
          </div>
        ))}
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: "#111", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <h2 className="vf-serif" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "#fff", fontWeight: 900, marginTop: 0, marginBottom: 16 }}>
            Comece agora.<br />É gratuito.
          </h2>
          <p className="vf-sans" style={{ fontSize: 15, color: "#888", marginBottom: 36, lineHeight: 1.7 }}>
            Sem burocracia, sem cartão. Crie sua conta e comece a cadastrar em menos de 2 minutos.
          </p>
          <Link to="/auth?mode=signup" className="vf-btn-primary" style={{ background: "#fff", color: "#111", fontSize: 15, padding: "16px 36px" }}>
            Criar conta gratis <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="vf-footer" style={{ borderTop: "1px solid #222", background: "#0a0a0a", padding: "28px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/images/android-chrome-192x192.png" alt="UniDatas" style={{ height: 22, width: 22, borderRadius: 4, opacity: 0.7 }} />
          <span className="vf-sans" style={{ fontSize: 13, color: "#555" }}>UniDatas</span>
        </div>
        <p className="vf-sans" style={{ fontSize: 12, color: "#444", margin: 0 }}>
          © 2025 UniDatas. Feito para quem não tem tempo a perder.
        </p>
      </footer>
    </div>
  );
}