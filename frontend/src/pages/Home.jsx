import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header role="banner">
        <div className="container nav" aria-label="Barra de navegação">
          <Link className="brand" to="/" aria-label="Saúde Connect — Início">
            <span className="logo" aria-hidden="true">S</span>
            <span>Saúde Connect</span>
          </Link>

          <nav aria-label="Principal" className="nav-links" style={{display: 'flex', gap: '22px'}}>
            <a href="#features">Recursos</a>
            <a href="#about">Sobre</a>
            <a href="#contact">Contato</a>
          </nav>

          <div className="actions">
            <Link className="btn btn-outline" to="/login" rel="nofollow">Entrar</Link>
            <Link className="btn btn-primary" to="/register">Criar Conta</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container">
          <h1 id="hero-title">Sua saúde em suas mãos</h1>
          <p>Conecte-se com profissionais de saúde qualificados, agende consultas online ou presenciais e gerencie seu histórico médico com segurança.</p>
          <div className="cta">
            <Link className="btn btn-primary" to="/register" aria-label="Começar agora">Começar agora</Link>
            <Link className="btn btn-outline" to="/login" aria-label="Já tenho conta">Já tenho conta</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" aria-labelledby="features-title">
        <div className="container">
          <h2 id="features-title" className="section-title">Por que escolher o Saúde Connect?</h2>
          <p className="section-sub">Plataforma completa para centralizar seus cuidados de saúde com agendamento simples, dados protegidos e acompanhamento contínuo.</p>

          <div className="grid" role="list">
            <article className="feature" role="listitem">
              <div className="icon" aria-hidden="true">
                {/* Calendário */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3>Agendamento fácil</h3>
              <p>Marque consultas 24/7 com poucos toques e receba lembretes automáticos.</p>
            </article>

            <article className="feature" role="listitem">
              <div className="icon" aria-hidden="true">
                {/* Usuários */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3>Profissionais qualificados</h3>
              <p>Rede verificada com especialidades diversas e atendimento presencial ou online.</p>
            </article>

            <article className="feature" role="listitem">
              <div className="icon" aria-hidden="true">
                {/* Escudo */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3>Dados seguros</h3>
              <p>Autenticação robusta, criptografia e controle de acesso por perfil.</p>
            </article>

            <article className="feature" role="listitem">
              <div className="icon" aria-hidden="true">
                {/* Coração */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </div>
              <h3>Cuidado integral</h3>
              <p>Dashboard com próximas consultas, histórico de atendimentos e resultados.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats" aria-label="Indicadores">
        <div className="container grid">
          <div className="stat" style={{gridColumn: 'span 12'}}>
            <div className="num">1000+</div>
            <div className="label">Profissionais cadastrados</div>
          </div>
          <div className="stat" style={{gridColumn: 'span 12'}}>
            <div className="num">5000+</div>
            <div className="label">Consultas realizadas</div>
          </div>
          <div className="stat" style={{gridColumn: 'span 12'}}>
            <div className="num">98%</div>
            <div className="label">Satisfação dos usuários</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-title">
        <div className="container">
          <div className="cta-block">
            <h2 id="cta-title">Pronto para cuidar da sua saúde?</h2>
            <p>Junte-se a milhares de pessoas que organizam seus cuidados no Saúde Connect.</p>
            <Link className="btn btn-primary" to="/register" aria-label="Criar conta gratuita">Criar conta gratuita</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer role="contentinfo">
        <div className="container foot-grid">
          <div className="foot-brand">
            <div className="brand" aria-label="Saúde Connect">
              <span className="logo" aria-hidden="true">S</span>
              <span style={{fontSize: '1.25rem', fontWeight: '800'}}>Saúde Connect</span>
            </div>
            <p style={{color: 'var(--muted)', maxWidth: '50ch', marginTop: '10px'}}>
              Conectando pessoas a profissionais de saúde de forma segura, prática e humana.
            </p>
          </div>

          <nav className="foot-col" aria-label="Produto">
            <div className="foot-title">Produto</div>
            <a className="foot-link" href="#features">Recursos</a>
            <a className="foot-link" href="#">Preços</a>
            <a className="foot-link" href="#">Segurança</a>
            <a className="foot-link" href="#">API</a>
          </nav>

          <nav className="foot-col" aria-label="Suporte">
            <div className="foot-title">Suporte</div>
            <a className="foot-link" href="#contact">Central de Ajuda</a>
            <a className="foot-link" href="#contact">Contato</a>
            <a className="foot-link" href="#">FAQ</a>
            <a className="foot-link" href="#">Status</a>
          </nav>

          <nav className="foot-col" aria-label="Legal">
            <div className="foot-title">Legal</div>
            <a className="foot-link" href="#">Termos de Uso</a>
            <a className="foot-link" href="#">Privacidade</a>
            <a className="foot-link" href="#">LGPD</a>
            <a className="foot-link" href="#">Cookies</a>
          </nav>
        </div>

        <div className="container foot-bottom">
          <p>© 2025 Saúde Connect. Todos os direitos reservados.</p>
          <div style={{display: 'flex', gap: '14px'}}>
            <a className="foot-link" href="https://www.linkedin.com/in/gabriel-a837921a3/" aria-label="LinkedIn">LinkedIn</a>
            <a className="foot-link" href="https://x.com/?lang=pt" aria-label="Twitter">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;