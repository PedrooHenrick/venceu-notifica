import { Link, Navigate } from "react-router-dom";
import { ArrowRight, BellRing, ShieldCheck, Check } from "lucide-react";
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
        .vf-sans  { font-family: 'DM Sans', sans-serif; }

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

        .vf-btn-blue {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 14px 28px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
          width: 100%;
        }
        .vf-btn-blue:hover {
          background: #1d4ed8;
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
          justify-content: center;
        }
        .vf-btn-ghost:hover { border-color: #888; color: #111; }

        .vf-divider {
          width: 40px;
          height: 2px;
          background: #1a1a1a;
          margin: 20px 0;
        }

        /* ── HERO ── */
        .vf-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
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

        /* ── STORIES ── */
        .vf-story-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          margin-top: 48px;
        }

        .vf-story-card {
          padding: 36px 32px;
          border-right: 1px solid rgba(255,255,255,0.08);
          position: relative;
        }
        .vf-story-card:last-child { border-right: none; }

        /* ── HOW TO ── */
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

        /* ── WHAT CHANGES ── */
        .vf-whatchanges-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }

        .vf-whatchanges-sticky {
          position: sticky;
          top: 80px;
        }

        /* ── STEP CARD ── */
        .vf-step-card {
          padding: 40px 32px 36px;
          background: #fff;
          border: 1px solid #e8e8e0;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .vf-step-card:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.07); }

        /* ── PRICING ── */
        .vf-pricing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 760px;
          margin: 48px auto 0;
        }

        .vf-plan-card {
          border: 1px solid #e0e0d8;
          background: #fff;
          padding: 36px 32px;
          position: relative;
          transition: box-shadow 0.2s;
        }
        .vf-plan-card:hover { box-shadow: 0 8px 40px rgba(0,0,0,0.07); }

        .vf-plan-card-featured {
          border: 2px solid #2563eb;
          background: #1a1a1a;
          padding: 36px 32px;
          position: relative;
          transition: box-shadow 0.2s;
        }
        .vf-plan-card-featured:hover { box-shadow: 0 8px 40px rgba(37,99,235,0.15); }

        .vf-plan-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #2563eb;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 14px;
          white-space: nowrap;
        }

        .vf-check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #444;
          line-height: 1.5;
        }

        .vf-check-item-dark {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #ccc;
          line-height: 1.5;
        }

        .vf-outcome-badge {
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 10px;
          margin-bottom: 16px;
        }

        /* ══════════════════════════════
           MOBILE OVERRIDES
        ══════════════════════════════ */
        @media (max-width: 768px) {

          /* HERO */
          .vf-hero-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .vf-hero-img-wrapper { order: -1; margin-bottom: 32px; }
          .vf-hero-img { height: 220px !important; width: 100% !important; }
          .vf-hero-bg-deco { display: none; }
          .vf-float-card { display: none; }
          .vf-hero-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .vf-btn-primary, .vf-btn-ghost {
            justify-content: center;
            text-align: center;
            width: 100%;
          }

          /* STORIES */
          .vf-story-grid {
            grid-template-columns: 1fr;
            margin-top: 32px;
          }
          .vf-story-card {
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            padding: 28px 0;
          }
          .vf-story-card:first-child { padding-top: 0; }
          .vf-story-card:last-child { border-bottom: none; padding-bottom: 0; }

          /* HOW TO */
          .vf-howto-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .vf-howto-sticky { position: static; }
          .vf-step-card { padding: 32px 24px 28px; }
          .vf-step-num { font-size: 60px; }

          /* WHAT CHANGES */
          .vf-whatchanges-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .vf-whatchanges-sticky { position: static; }

          /* PRICING */
          .vf-pricing-grid {
            grid-template-columns: 1fr;
            max-width: 100%;
          }
          .vf-plan-card, .vf-plan-card-featured {
            padding: 32px 24px;
          }
          .vf-plan-card-featured { margin-top: 20px; }
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/auth" className="vf-nav-link">Entrar</Link>
            <Link to="/auth?mode=signup" className="vf-btn-primary" style={{ padding: "9px 18px", fontSize: 13 }}>
              Testar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 20px 56px" }}>
        <div className="vf-hero-grid">

          {/* Texto */}
          <div>
            <h1 className="vf-serif" style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#111",
              margin: 0,
            }}>
              Nenhum documento
              <br />
              vence{" "}
              <span className="vf-hero-word" style={{ color: "#2563eb" }}>de surpresa.</span>
            </h1>

            <div className="vf-divider" />

            <p className="vf-sans" style={{ fontSize: 16, color: "#555", lineHeight: 1.75, marginTop: 0, maxWidth: 440 }}>
              UniDatas cuida das datas — ASO, NRs, habilitações — e te avisa antes de qualquer documento vencer.
              Você foca no que realmente importa.
            </p>

            <div className="vf-hero-actions" style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
              <Link to="/auth?mode=signup" className="vf-btn-primary">
                Começar agora, grátis <ArrowRight size={15} />
              </Link>
              <Link to="/auth" className="vf-btn-ghost">
                Já tenho conta
              </Link>
            </div>
          </div>

          {/* Imagem */}
          <div className="vf-hero-img-wrapper" style={{ position: "relative" }}>
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
                <p className="vf-sans" style={{ fontSize: 11, color: "#888", margin: 0 }}>Carlos Silva — Empresa ABC</p>
              </div>
            </div>

            <div className="vf-float-card" style={{ top: 32, right: -40, zIndex: 2 }}>
              <div style={{ width: 36, height: 36, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck size={16} color="#2e7d32" />
              </div>
              <div>
                <p className="vf-sans" style={{ fontSize: 12, fontWeight: 600, color: "#111", margin: 0 }}>Tudo em dia</p>
                <p className="vf-sans" style={{ fontSize: 11, color: "#888", margin: 0 }}>47 documentos ativos</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ borderTop: "1px solid #e0e0d8", borderBottom: "1px solid #e0e0d8", padding: "18px 20px", textAlign: "center" }}>
        <p className="vf-sans" style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          Usado por empresas que já cansaram de depender da memória de alguém
        </p>
      </div>

      {/* ── HISTÓRIAS REAIS ── */}
      <section style={{ background: "#111", padding: "64px 0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>
          <span className="vf-tag" style={{ color: "#6b8cff", borderColor: "#6b8cff" }}>O custo real da desatenção</span>
          <h2 className="vf-serif" style={{ fontSize: "clamp(1.6rem, 3vw, 2.6rem)", color: "#fff", fontWeight: 900, marginTop: 0, maxWidth: 560 }}>
            Isso acontece toda semana<br />em alguma empresa do Brasil.
          </h2>

          <div className="vf-story-grid">
            {[
              {
                outcome: "Multa de R$ 12.400",
                outcomeBg: "#450a0a",
                outcomeColor: "#fca5a5",
                story: "O fiscal apareceu numa segunda-feira. O ASO do operador tinha vencido há 23 dias. A planilha estava certa — ninguém tinha aberto.",
                persona: "Gerente de segurança, indústria metalúrgica",
              },
              {
                outcome: "Afastamento e processo",
                outcomeBg: "#451a03",
                outcomeColor: "#fdba74",
                story: "O acidente aconteceu 4 meses depois do vencimento do NR. A empresa estava ciente? Não estava. Mas ninguém provou isso na audiência.",
                persona: "Coordenador de RH, construtora",
              },
              {
                outcome: "Contrato perdido",
                outcomeBg: "#1c1917",
                outcomeColor: "#d6d3d1",
                story: "A auditoria do cliente pediu os documentos de todos os colaboradores. Três estavam vencidos. O contrato não foi renovado.",
                persona: "Sócio-gestor, empresa de facilities",
              },
            ].map((item) => (
              <div key={item.outcome} className="vf-story-card">
                <div className="vf-outcome-badge" style={{ background: item.outcomeBg, color: item.outcomeColor }}>
                  {item.outcome}
                </div>
                <p className="vf-sans" style={{ fontSize: 15, color: "#d4d4d0", lineHeight: 1.75, margin: "0 0 20px" }}>
                  "{item.story}"
                </p>
                <p className="vf-sans" style={{ fontSize: 12, color: "#555", margin: 0, fontStyle: "italic" }}>
                  — {item.persona}
                </p>
              </div>
            ))}
          </div>

          <p className="vf-sans" style={{ fontSize: 13, color: "#444", marginTop: 32, textAlign: "center" }}>
            Situações reais. Nomes omitidos. Nenhuma delas precisava ter acontecido.
          </p>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 20px" }}>
        <div className="vf-howto-grid">
          <div className="vf-howto-sticky">
            <span className="vf-tag">Como funciona</span>
            <h2 className="vf-serif" style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)", fontWeight: 900, lineHeight: 1.2, color: "#111", margin: 0 }}>
              Configure uma vez.<br />Esqueça para sempre.
            </h2>
            <div className="vf-divider" />
            <p className="vf-sans" style={{ fontSize: 14, color: "#777", lineHeight: 1.7 }}>
              O UniDatas trabalha enquanto você faz outra coisa. Quando algo está prestes a vencer, você recebe um email. Simples assim.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              {
                n: "01",
                title: "Cadastre seus funcionários",
                desc: "Nome, cargo, empresa. Menos de um minuto por pessoa.",
              },
              {
                n: "02",
                title: "Insira as datas dos documentos",
                desc: "ASO, NR-10, NR-33, AVCB, habilitações. Emissão e vencimento. Ou envie o PDF — a IA extrai as datas automaticamente.",
              },
              {
                n: "03",
                title: "Receba o alerta e resolva",
                desc: "Dias antes de qualquer vencimento, você recebe um email. Nada vence de surpresa. Nenhuma multa evitável. Nenhuma noite perdida.",
              },
            ].map((item) => (
              <div key={item.n} className="vf-step-card">
                <span className="vf-step-num">{item.n}</span>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h3 className="vf-serif" style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: "0 0 10px" }}>{item.title}</h3>
                  <p className="vf-sans" style={{ fontSize: 15, color: "#444", margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── O QUE MUDA NA SUA VIDA ── */}
      <section style={{ background: "#f4f4f0", padding: "64px 0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>
          <div className="vf-whatchanges-grid">

            {/* Lado esquerdo */}
            <div className="vf-whatchanges-sticky">
              <span className="vf-tag">O que muda na prática</span>
              <h2 className="vf-serif" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, color: "#111", marginTop: 0, marginBottom: 20, maxWidth: 400, lineHeight: 1.2 }}>
                Mais do que evitar multas — você recupera tranquilidade.
              </h2>
              <div className="vf-divider" />
              <p className="vf-sans" style={{ fontSize: 14, color: "#777", lineHeight: 1.75, marginTop: 0 }}>
                Cada detalhe foi pensado para tirar peso da sua rotina, não adicionar mais uma ferramenta para gerenciar.
              </p>
            </div>

            {/* Lado direito */}
            <div>
              {[
                {
                  label: "Alertas antes de vencer",
                  desc: "Você escolhe quantos dias antes quer ser avisado. O sistema não esquece, não falta, não vai de férias.",
                },
                {
                  label: "Painel de vencimentos",
                  desc: "Vencidos, urgentes, a vencer — tudo numa tela. Você abre e já sabe exatamente o que precisa de atenção.",
                },
                {
                  label: "Leitura de documentos",
                  desc: "Envie o documento e as datas são extraídas automaticamente. Menos digitação, menos erro humano.",
                },
                {
                  label: "Funciona para qualquer porte",
                  desc: "Cinco funcionários ou duzentos. A lógica é a mesma, a escala é sua.",
                },
                {
                  label: "Sem instalação",
                  desc: "Qualquer navegador, qualquer dispositivo. Nenhuma aprovação necessária.",
                },
                {
                  label: "Seus dados são seus",
                  desc: "Nada é compartilhado com terceiros. Backup diário. Você controla quem acessa.",
                },
              ].map((f) => (
                <div key={f.label} style={{
                  display: "grid",
                  gridTemplateColumns: "20px 1fr",
                  gap: "16px",
                  padding: "24px 0",
                  borderTop: "1px solid #ddd",
                  alignItems: "start",
                }}>
                  <span className="vf-sans" style={{ fontSize: 18, color: "#2563eb", fontWeight: 700, lineHeight: 1.4, marginTop: 1 }}>—</span>
                  <div>
                    <h3 className="vf-serif" style={{ fontSize: 17, fontWeight: 700, color: "#111", margin: "0 0 7px", lineHeight: 1.3 }}>{f.label}</h3>
                    <p className="vf-sans" style={{ fontSize: 14, color: "#666", margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section style={{ padding: "64px 20px", background: "#fafaf8" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}>
          <span className="vf-tag" style={{ display: "inline-block" }}>Planos</span>
          <h2 className="vf-serif" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, color: "#111", marginTop: 12, marginBottom: 8 }}>
            Comece grátis. Assine quando fizer sentido.
          </h2>
          <p className="vf-sans" style={{ fontSize: 15, color: "#777", margin: "0 auto", maxWidth: 380, lineHeight: 1.7 }}>
            Sem pressão, sem cartão no teste. Você decide se vale.
          </p>

          <div className="vf-pricing-grid">
            {/* Plano Teste */}
            <div className="vf-plan-card">
              <span className="vf-sans" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888" }}>Teste gratuito</span>
              <div style={{ margin: "16px 0 4px" }}>
                <span className="vf-serif" style={{ fontSize: 42, fontWeight: 900, color: "#111", lineHeight: 1 }}>Grátis</span>
              </div>
              <p className="vf-sans" style={{ fontSize: 13, color: "#aaa", margin: "0 0 28px" }}>7 dias, sem cartão</p>

              <div style={{ marginBottom: 28 }}>
                {[
                  "Até 2 empresas",
                  "Até 5 funcionários por empresa",
                  "Até 20 PDFs",
                  "Alertas por email",
                  "Painel de vencimentos",
                ].map((item) => (
                  <div key={item} className="vf-check-item">
                    <Check size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/auth?mode=signup" className="vf-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Começar teste <ArrowRight size={14} />
              </Link>
            </div>

            {/* Plano Pro */}
            <div className="vf-plan-card-featured">
              <div className="vf-plan-badge">Mais popular</div>

              <span className="vf-sans" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b8cff" }}>Pro</span>
              <div style={{ margin: "16px 0 4px", display: "flex", alignItems: "flex-end", gap: 6 }}>
                <span className="vf-serif" style={{ fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1 }}>R$24</span>
                <span className="vf-sans" style={{ fontSize: 16, color: "#888", marginBottom: 6 }}>,90/mês</span>
              </div>
              <p className="vf-sans" style={{ fontSize: 13, color: "#666", margin: "0 0 28px" }}>sem limite, sem surpresa</p>

              <div style={{ marginBottom: 28 }}>
                {[
                  "Empresas ilimitadas",
                  "Funcionários ilimitados",
                  "PDFs ilimitados",
                  "Alertas automáticos por email",
                  "Painel de vencimentos",
                  "Suporte prioritário",
                ].map((item) => (
                  <div key={item} className="vf-check-item-dark">
                    <Check size={15} color="#6b8cff" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/auth?mode=signup" className="vf-btn-blue">
                Assinar agora <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <p className="vf-sans" style={{ fontSize: 13, color: "#bbb", marginTop: 28 }}>
            Cancele quando quiser. Sem multa, sem burocracia.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #e0e0d8", background: "#fff", padding: "28px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/images/android-chrome-192x192.png" alt="UniDatas" style={{ height: 22, width: 22, borderRadius: 4, opacity: 0.7 }} />
          <span className="vf-sans" style={{ fontSize: 13, color: "#555" }}>UniDatas</span>
        </div>
      </footer>
    </div>
  );
}