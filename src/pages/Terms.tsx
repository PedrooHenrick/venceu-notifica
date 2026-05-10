import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .terms-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #F7F4EF;
          color: #1C2B3A;
        }

        .terms-header {
          background: #1C2B3A;
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .terms-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .terms-brand img {
          width: 32px;
          height: 32px;
          border-radius: 8px;
        }

        .terms-brand-name {
          font-family: 'Lora', serif;
          font-size: 18px;
          font-weight: 600;
          color: #F7F4EF;
        }

        .terms-container {
          max-width: 760px;
          margin: 0 auto;
          padding: 64px 24px 96px;
        }

        .terms-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #C5986C;
          margin-bottom: 12px;
        }

        .terms-title {
          font-family: 'Lora', serif;
          font-size: 40px;
          font-weight: 600;
          color: #1C2B3A;
          line-height: 1.2;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }

        .terms-updated {
          font-size: 13px;
          color: #7A8695;
          font-weight: 300;
          margin-bottom: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid #DDD8D0;
        }

        .terms-section {
          margin-bottom: 40px;
        }

        .terms-section h2 {
          font-family: 'Lora', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1C2B3A;
          margin-bottom: 14px;
          letter-spacing: -0.3px;
        }

        .terms-section p {
          font-size: 15px;
          line-height: 1.75;
          color: #4A5A6A;
          font-weight: 300;
          margin-bottom: 12px;
        }

        .terms-section ul {
          padding-left: 20px;
          margin-bottom: 12px;
        }

        .terms-section ul li {
          font-size: 15px;
          line-height: 1.75;
          color: #4A5A6A;
          font-weight: 300;
          margin-bottom: 6px;
        }

        .terms-contact {
          background: #1C2B3A;
          border-radius: 16px;
          padding: 32px;
          margin-top: 48px;
        }

        .terms-contact h2 {
          font-family: 'Lora', serif;
          font-size: 20px;
          font-weight: 600;
          color: #F7F4EF;
          margin-bottom: 10px;
        }

        .terms-contact p {
          font-size: 14px;
          color: rgba(232, 226, 217, 0.6);
          font-weight: 300;
          line-height: 1.7;
        }

        .terms-contact a {
          color: #C5986C;
          text-decoration: none;
        }

        .terms-footer {
          text-align: center;
          padding: 32px;
          font-size: 13px;
          color: #A09890;
          border-top: 1px solid #DDD8D0;
        }

        @media (max-width: 768px) {
          .terms-header { padding: 16px 24px; }
          .terms-title { font-size: 28px; }
        }
      `}</style>

      <div className="terms-root">
        <header className="terms-header">
          <Link to="/" className="terms-brand">
            <img src="/images/android-chrome-192x192.png" alt="UniDatas" />
            <span className="terms-brand-name">UniDatas</span>
          </Link>
        </header>

        <div className="terms-container">
          <p className="terms-eyebrow">Legal</p>
          <h1 className="terms-title">Termos de Serviço</h1>
          <p className="terms-updated">Última atualização: 10 de maio de 2026</p>

          <div className="terms-section">
            <h2>1. Aceitação dos termos</h2>
            <p>
              Ao acessar ou utilizar o UniDatas, você concorda com estes Termos de
              Serviço. Se não concordar com qualquer parte dos termos, não utilize
              o serviço. O UniDatas é operado por Pedro Henrick Barbosa de Jesus,
              com sede no Brasil.
            </p>
          </div>

          <div className="terms-section">
            <h2>2. Descrição do serviço</h2>
            <p>
              O UniDatas é uma plataforma de gestão de datas de vencimento de
              documentos trabalhistas e empresariais, como ASOs, NRs e habilitações.
              O sistema permite cadastrar funcionários, inserir documentos e receber
              alertas automáticos por e-mail antes dos vencimentos.
            </p>
          </div>

          <div className="terms-section">
            <h2>3. Cadastro e conta</h2>
            <p>
              Para utilizar o UniDatas, você precisa criar uma conta com e-mail e
              senha válidos ou autenticar-se via Google. Você é responsável por:
            </p>
            <ul>
              <li>Manter a confidencialidade da sua senha</li>
              <li>Todas as atividades realizadas na sua conta</li>
              <li>Notificar imediatamente em caso de uso não autorizado</li>
              <li>Fornecer informações verdadeiras no cadastro</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>4. Uso aceitável</h2>
            <p>Você concorda em utilizar o UniDatas apenas para fins legais e não irá:</p>
            <ul>
              <li>Violar leis ou regulamentos aplicáveis</li>
              <li>Inserir dados falsos ou enganosos no sistema</li>
              <li>Tentar acessar contas de outros usuários</li>
              <li>Utilizar o serviço para fins que não sejam gestão de documentos</li>
              <li>Realizar engenharia reversa ou tentar comprometer a segurança do sistema</li>
            </ul>
          </div>

          <div className="terms-section">
            <h2>5. Planos e pagamento</h2>
            <p>
              O UniDatas oferece um período de teste gratuito de 7 dias, sem necessidade
              de cartão de crédito. Após o período de teste, é necessário assinar um
              plano pago para continuar utilizando o serviço.
            </p>
            <p>
              Os pagamentos são processados de forma segura pelo Mercado Pago. O
              cancelamento pode ser feito a qualquer momento, sem multa ou burocracia,
              e tem efeito no final do período já pago.
            </p>
          </div>

          <div className="terms-section">
            <h2>6. Responsabilidade pelos dados</h2>
            <p>
              Você é o único responsável pelos dados inseridos no sistema, incluindo
              informações de funcionários e documentos. O UniDatas não se responsabiliza
              por dados incorretos inseridos pelo usuário, nem por consequências
              decorrentes de vencimentos não cadastrados no sistema.
            </p>
          </div>

          <div className="terms-section">
            <h2>7. Disponibilidade do serviço</h2>
            <p>
              Nos esforçamos para manter o UniDatas disponível 24 horas por dia, 7
              dias por semana. No entanto, não garantimos disponibilidade ininterrupta
              e podemos realizar manutenções programadas ou emergenciais sem aviso
              prévio.
            </p>
          </div>

          <div className="terms-section">
            <h2>8. Cancelamento e encerramento</h2>
            <p>
              Você pode cancelar sua conta a qualquer momento pelo painel do sistema
              ou entrando em contato conosco. Reservamo-nos o direito de suspender
              ou encerrar contas que violem estes termos, sem aviso prévio.
            </p>
            <p>
              Após o cancelamento, seus dados serão mantidos por 30 dias e depois
              excluídos permanentemente.
            </p>
          </div>

          <div className="terms-section">
            <h2>9. Alterações nos termos</h2>
            <p>
              Podemos atualizar estes Termos de Serviço periodicamente. Em caso de
              mudanças relevantes, você será notificado por e-mail com pelo menos
              7 dias de antecedência. O uso continuado do serviço após as alterações
              implica na aceitação dos novos termos.
            </p>
          </div>

          <div className="terms-contact">
            <h2>Dúvidas?</h2>
            <p>
              Entre em contato conosco pelo e-mail:{" "}
              <a href="mailto:hxpedrinho@gmail.com">hxpedrinho@gmail.com</a>
              <br />
              Respondemos em até 2 dias úteis.
            </p>
          </div>
        </div>

        <footer className="terms-footer">
          © 2026 UniDatas · Pedro Henrick Barbosa de Jesus ·{" "}
          <Link to="/privacy" style={{ color: "#C5986C", textDecoration: "none" }}>
            Política de Privacidade
          </Link>
          {" · "}
          <Link to="/terms" style={{ color: "#C5986C", textDecoration: "none" }}>
            Termos de Serviço
          </Link>
        </footer>
      </div>
    </>
  );
}