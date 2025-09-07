import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Informe seu email.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email inválido.';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      return 'Informe sua senha.';
    }
    if (password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validação
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError,
        password: passwordError
      });
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      font: '400 1rem/1.6 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      color: 'var(--text)',
      background: `
        radial-gradient(800px 400px at 20% -10%, color-mix(in srgb, var(--secondary-500) 14%, transparent), transparent 70%),
        radial-gradient(900px 500px at 80% -20%, color-mix(in srgb, var(--primary-500) 16%, transparent), transparent 70%),
        linear-gradient(180deg, #fff, var(--surface-2))
      `,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      padding: '28px'
    }}>
      <main style={{ width: 'min(100%, var(--container))', marginInline: 'auto' }} role="main">
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <Link 
            to="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
              textDecoration: 'none',
              color: 'inherit'
            }}
            aria-label="Voltar para a página inicial"
          >
            <span style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
              fontWeight: '800',
              fontSize: '20px',
              boxShadow: 'var(--shadow-2)'
            }} aria-hidden="true">S</span>
            <strong style={{ fontSize: '1.2rem' }}>Saúde Connect</strong>
          </Link>
        </div>

        <section style={{
          width: 'min(100%, 520px)',
          marginInline: 'auto',
          background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--line)',
          borderRadius: '22px',
          boxShadow: 'var(--shadow-1)',
          padding: '28px clamp(20px, 6vw, 40px)'
        }} aria-labelledby="login-title">
          <header style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h1 id="login-title" style={{ 
              margin: '8px 0 4px', 
              fontSize: 'clamp(1.6rem, 1.4rem + 1vw, 2rem)', 
              lineHeight: '1.2' 
            }}>Bem-vindo de volta</h1>
            <p style={{ color: 'var(--muted)', margin: '0 0 10px' }}>Entre na sua conta para continuar</p>
          </header>

          <form onSubmit={handleSubmit} style={{ marginTop: '14px' }} noValidate autoComplete="on">
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '700', 
                fontSize: '.9rem', 
                marginBottom: '6px' 
              }} htmlFor="email">Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    font: '500 1.125rem/1.3 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial',
                    padding: '14px 16px',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    transition: '.2s border-color ease, .2s box-shadow ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 50%, var(--line))';
                    e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--primary-600) 18%, transparent)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--line)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {fieldErrors.email && (
                <div style={{ color: 'var(--error)', fontSize: '.9rem', marginTop: '6px' }} aria-live="polite">
                  {fieldErrors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '700', 
                fontSize: '.9rem', 
                marginBottom: '6px' 
              }} htmlFor="password">Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  minLength="8"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    font: '500 1.125rem/1.3 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial',
                    padding: '14px 16px',
                    paddingRight: '44px',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    transition: '.2s border-color ease, .2s box-shadow ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 50%, var(--line))';
                    e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--primary-600) 18%, transparent)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--line)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: '0',
                    background: 'transparent',
                    cursor: 'pointer',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--muted)'
                  }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {showPassword ? (
                      <>
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" y1="2" x2="22" y2="22"/>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {fieldErrors.password && (
                <div style={{ color: 'var(--error)', fontSize: '.9rem', marginTop: '6px' }} aria-live="polite">
                  {fieldErrors.password}
                </div>
              )}
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              gap: '10px', 
              marginTop: '6px' 
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--muted)', 
                fontSize: '.9375rem' 
              }}>
                <input 
                  type="checkbox" 
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    accentColor: 'var(--primary-600)' 
                  }} 
                />
                <span>Lembrar de mim</span>
              </label>
              <Link 
                to="/forgot-password" 
                style={{ 
                  color: 'var(--primary-600)', 
                  fontWeight: '700', 
                  fontSize: '.9375rem' 
                }}
              >
                Esqueceu a senha?
              </Link>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  letterSpacing: '.2px',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: '.2s transform ease, .25s box-shadow ease, .2s filter ease',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
                  color: '#fff',
                  boxShadow: 'var(--shadow-2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.filter = 'brightness(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.filter = 'none';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(1px)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'none';
                }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr auto 1fr', 
              alignItems: 'center', 
              gap: '12px',
              color: 'var(--muted)', 
              margin: '18px 0 12px', 
              fontWeight: '600' 
            }} role="separator" aria-label="Ou continue com">
              <div style={{ content: '""', height: '1px', background: 'var(--line)' }}></div>
              <span>Ou continue com</span>
              <div style={{ content: '""', height: '1px', background: 'var(--line)' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} aria-label="Entrar com redes sociais">
              <button 
                type="button" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  letterSpacing: '.2px',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                  transition: '.2s border-color ease',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
                aria-label="Entrar com Google"
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 30%, var(--line))';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--line)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span style={{ fontWeight: '700' }}>Google</span>
              </button>

              <button 
                type="button" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  letterSpacing: '.2px',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                  transition: '.2s border-color ease',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
                aria-label="Entrar com Facebook"
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 30%, var(--line))';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--line)';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span style={{ fontWeight: '700' }}>Facebook</span>
              </button>
            </div>

            {error && (
              <div style={{ 
                color: 'var(--error)', 
                fontSize: '.9rem', 
                marginTop: '10px' 
              }} aria-live="assertive">
                {error}
              </div>
            )}
          </form>

          <p style={{ 
            textAlign: 'center', 
            color: 'var(--muted)', 
            marginTop: '16px', 
            fontSize: '.9375rem' 
          }}>
            Não tem uma conta? <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: '800' }}>Criar conta gratuita</Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Login;