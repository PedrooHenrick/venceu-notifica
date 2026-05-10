import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .privacy-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #F7F4EF;
          color: #1C2B3A;
        }

        .privacy-header {
          background: #1C2B3A;
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .privacy-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .privacy-brand img {
          width: 32px;
          height: 32px;
          border-radius: 8px;
        }

        .privacy-brand-name {
          font-family: 'Lora', serif;
          font-size: 18px;
          font-weight: 600;
          color: #F7F4EF;
        }

        .privacy-container {
          max-width: 760px;
          margin: 0 auto;
          padding: 64px 24px 96px;
        }

        .privacy-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #C5986C;
          margin-bottom: 12px;
        }

        .privacy-title {
          font-family: 'Lora', serif;
          font-size: 40px;
          font-weight: 600;
          color: #1C2B3A;
          line-height: 1.2;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }

        .privacy-updated {
          font-size: 13px;
          color: #7A8695;
          font-weight: 300;
          margin-bottom: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid #DDD8D0;
        }

        .privacy-section {
          margin-bottom: 40px;
        }

        .privacy-section h2 {
          font-family: 'Lora', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1C2B3A;
          margin-bottom: 14px;
          letter-spacing: -0.3px;
        }

        .privacy-section p {
          font-size: 15px;
          line-height: 1.75;
          color: #4A5A6A;
          font-weight: 300;
          margin-bottom: 12px;
        }

        .privacy-section ul {
          padding-left: 20px;
          margin-bottom: 12px;
        }

        .privacy-section ul li {
          font-size: 15px;
          line-height: 1.75;
          color: #4A5A6A;
          font-weight: 300;
          margin-bottom: 6px;
        }

        .privacy-contact {
          background: #1C2B3A;
          border-radius: 16px;
          padding: 32px;
          margin-top: 48px;
        }

        .privacy-contact h2 {
          font-family: 'Lora', serif;
          font-size: 20px;
          font-weight: 600;
          color: #F7F4EF;
          margin-bottom: 10px;
        }

        .privacy-contact p {
          font-size: 14px;
          color: rgba(232, 226, 217, 0.6);
          font-weight: 300;
          line-height: 1.7;
        }

        .privacy-contact a {
          color: #C5986C;
          text-decoration: none;
        }

        .privacy-footer {
          text-align: center;
          padding: 32px;
          font-size: 13px;
          color: #A09890;
          border-top: 1px solid #DDD8D0;
        }

        @media (max-width: 768px) {
          .privacy-header { padding: 16px 24px; }
          .privacy-title { font-size: 28px; }
        }
      `}</style>

      <div className="privacy-root">
        <header className="privacy-header">
          <Link to="/" className="privacy-brand">
            <img src="/images/android-chrome-192x192.png" alt="UniDatas" />
            <span className="privacy-brand-name">UniDatas</span>
          </Link>
        </header>

        <div className="privacy-container">
          <p className="privacy-eyebrow">Legal</p>
          <h1 className="privacy-title">Política de Privacidade</h1>
          <p className="privacy-updated">Última atualização: 10 de maio de 2026</p>

          <div className="privacy-section">
            <h2>1. Quem somos</h2>
            <p>
              O UniDatas é um serviço operado por Pedro Henrick Barbosa de Jesus,
              com sede no Brasil. Nosso sistema permite que empresas e profissionais
              gerenciem datas de vencimento de documentos, como ASOs, NRs e habilitações,
              recebendo alertas automáticos por e-mail antes dos vencimentos.
            </p>
          </div>

          <div className="privacy-section">
            <h2>2. Quais dados coletamos</h2>
            <p>Coletamos apenas os dados necessários para o funcionamento do serviço:</p>
            <ul>
              <li>Nome e endereço de e-mail (fornecidos no cadastro)</li>
              <li>Dados de funcionários e documentos inseridos por você no sistema</li>
              <li>Datas de emissão e vencimento de documentos</li>
              <li>Dados de acesso (login via e-mail/senha ou Google)</li>
              <li>Informações de uso do sistema para melhorias</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>3. Como usamos seus dados</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul>
              <li>Enviar alertas de vencimento de documentos por e-mail</li>
              <li>Exibir o painel de controle com seus documentos</li>
              <li>Autenticar seu acesso ao sistema</li>
              <li>Melhorar a experiência e funcionalidades do serviço</li>
            </ul>
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados com terceiros para
              fins comerciais.
            </p>
          </div>

          <div className="privacy-section">
            <h2>4. Armazenamento e segurança</h2>
            <p>
              Seus dados são armazenados de forma segura na infraestrutura do Supabase,
              com backup diário e criptografia em trânsito e em repouso. O acesso aos
              dados é restrito apenas a você e à equipe do UniDatas quando necessário
              para suporte técnico.
            </p>
          </div>

          <div className="privacy-section">
            <h2>5. Login com Google</h2>
            <p>
              Caso você opte por entrar com sua conta Google, coletamos apenas seu
              nome e endereço de e-mail fornecidos pelo Google. Não acessamos outros
              dados da sua conta Google, como contatos, calendário ou arquivos.
            </p>
          </div>

          <div className="privacy-section">
            <h2>6. Seus direitos</h2>
            <p>Você tem direito a:</p>
            <ul>
              <li>Acessar os dados que temos sobre você</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar a exclusão da sua conta e todos os seus dados</li>
              <li>Exportar seus dados em formato legível</li>
            </ul>
            <p>
              Para exercer qualquer um desses direitos, entre em contato pelo e-mail
              abaixo.
            </p>
          </div>

          <div className="privacy-section">
            <h2>7. Cookies</h2>
            <p>
              Utilizamos cookies estritamente necessários para manter sua sessão ativa
              no sistema. Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </div>

          <div className="privacy-section">
            <h2>8. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Em caso de mudanças
              relevantes, você será notificado por e-mail. O uso continuado do serviço
              após as alterações implica na aceitação da nova política.
            </p>
          </div>

          <div className="privacy-contact">
            <h2>Dúvidas ou solicitações?</h2>
            <p>
              Entre em contato conosco pelo e-mail:{" "}
              <a href="mailto:hxpedrinho@gmail.com">hxpedrinho@gmail.com</a>
              <br />
              Respondemos em até 2 dias úteis.
            </p>
          </div>
        </div>

        <footer className="privacy-footer">
          © 2026 UniDatas · Pedro Henrick Barbosa de Jesus ·{" "}
          <Link to="/privacy" style={{ color: "#C5986C", textDecoration: "none" }}>
            Política de Privacidade
          </Link>
        </footer>
      </div>
    </>
  );
}