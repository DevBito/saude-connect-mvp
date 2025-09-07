import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useAuth } from '../context/AuthContext'
import { professionalService } from '../services/professionalService'
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Filter,
  User,
  Calendar,
  LogOut,
  ArrowLeft
} from 'lucide-react'

export default function Professionals() {
  const { user, logout } = useAuth()
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    location: '',
    availability: ''
  })

  const { data: professionals, isLoading } = useQuery(
    ['professionals', filters],
    () => professionalService.getProfessionals(filters),
    {
      keepPreviousData: true
    }
  )

  const specialties = [
    'Clínica Geral',
    'Cardiologia',
    'Dermatologia',
    'Ginecologia',
    'Pediatria',
    'Psicologia',
    'Nutrição',
    'Ortopedia',
    'Oftalmologia',
    'Otorrinolaringologia',
    'Urologia',
    'Neurologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Pneumologia'
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <div style={{
      minHeight: '100vh',
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
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: '0',
        zIndex: '50',
        backdropFilter: 'saturate(140%) blur(10px)',
        background: 'color-mix(in srgb, var(--surface) 80%, transparent)',
        borderBottom: '1px solid var(--line)',
        borderRadius: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '72px',
          padding: '0 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link 
              to="/dashboard" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--muted)',
                textDecoration: 'none',
                fontSize: '.9rem',
                fontWeight: '600'
              }}
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
            <Link 
              to="/" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: '800',
                letterSpacing: '.2px',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <span style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
                boxShadow: 'var(--shadow-2)',
                fontWeight: '800',
                fontSize: '20px'
              }}>S</span>
              <span>Saúde Connect</span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={logout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '.9rem',
                border: '1px solid var(--line)',
                cursor: 'pointer',
                transition: '.2s border-color ease',
                background: 'var(--surface)',
                color: 'var(--text)'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 30%, var(--line))';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--line)';
              }}
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main style={{ width: 'min(100%, var(--container))', marginInline: 'auto' }} role="main">
        {/* Page Header */}
        <section style={{
          background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--line)',
          borderRadius: '22px',
          boxShadow: 'var(--shadow-1)',
          padding: '32px',
          marginBottom: '32px',
          backgroundImage: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
          color: '#fff'
        }}>
          <div>
            <h1 style={{ 
              margin: '0 0 8px', 
              fontSize: 'clamp(1.8rem, 1.6rem + 1vw, 2.4rem)', 
              lineHeight: '1.2',
              fontWeight: '800'
            }}>
              Profissionais de Saúde 👨‍⚕️
            </h1>
            <p style={{ 
              margin: '0', 
              opacity: '0.9',
              fontSize: '1.1rem'
            }}>
              Encontre o profissional ideal para sua necessidade
            </p>
          </div>
        </section>

        {/* Filters */}
        <section style={{
          background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--line)',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-1)',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                color: 'var(--muted)'
              }}>
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '1rem',
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

            {/* Specialty */}
            <select
              value={filters.specialty}
              onChange={(e) => handleFilterChange('specialty', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--line)',
                borderRadius: '12px',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Todas as especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>

            {/* Location */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                color: 'var(--muted)'
              }}>
                <MapPin size={20} />
              </div>
              <input
                type="text"
                placeholder="Cidade ou estado..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '1rem',
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

            {/* Availability */}
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--line)',
                borderRadius: '12px',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Disponibilidade</option>
              <option value="today">Hoje</option>
              <option value="tomorrow">Amanhã</option>
              <option value="this_week">Esta semana</option>
              <option value="online">Online</option>
            </select>
          </div>
        </section>

        {/* Results */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} style={{
                background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                boxShadow: 'var(--shadow-1)',
                padding: '24px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--surface-2)',
                    borderRadius: '50%'
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: '16px',
                      background: 'var(--surface-2)',
                      borderRadius: '8px',
                      width: '75%',
                      marginBottom: '8px'
                    }}></div>
                    <div style={{
                      height: '12px',
                      background: 'var(--surface-2)',
                      borderRadius: '6px',
                      width: '50%'
                    }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    height: '12px',
                    background: 'var(--surface-2)',
                    borderRadius: '6px'
                  }}></div>
                  <div style={{
                    height: '12px',
                    background: 'var(--surface-2)',
                    borderRadius: '6px',
                    width: '83%'
                  }}></div>
                </div>
              </div>
            ))
          ) : professionals?.length > 0 ? (
            professionals.map((professional) => (
              <div key={professional.id} style={{
                background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                boxShadow: 'var(--shadow-1)',
                padding: '24px',
                transition: '.2s transform ease, .2s box-shadow ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'none';
                e.target.style.boxShadow = 'var(--shadow-1)';
              }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'var(--primary-100)',
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center'
                    }}>
                      <User size={32} style={{ color: 'var(--primary-600)' }} />
                    </div>
                    <div>
                      <h3 style={{
                        margin: '0 0 4px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: 'var(--text)'
                      }}>
                        {professional.name}
                      </h3>
                      <p style={{
                        margin: '0 0 4px',
                        color: 'var(--primary-600)',
                        fontWeight: '600',
                        fontSize: '.95rem'
                      }}>
                        {professional.specialty}
                      </p>
                      {professional.sub_specialty && (
                        <p style={{
                          margin: '0',
                          fontSize: '.85rem',
                          color: 'var(--muted)'
                        }}>
                          {professional.sub_specialty}
                        </p>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      {renderStars(professional.rating || 0)}
                    </div>
                    <p style={{
                      margin: '0',
                      fontSize: '.8rem',
                      color: 'var(--muted)'
                    }}>
                      {professional.review_count || 0} avaliações
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {professional.city && professional.state && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '.9rem', color: 'var(--muted)' }}>
                      <MapPin size={16} style={{ marginRight: '6px' }} />
                      {professional.city}, {professional.state}
                    </div>
                  )}
                  
                  {professional.consultation_price && (
                    <div style={{ fontSize: '.9rem', color: 'var(--muted)' }}>
                      <span style={{ fontWeight: '600' }}>R$ {professional.consultation_price}</span> por consulta
                    </div>
                  )}

                  {professional.experience_years && (
                    <div style={{ fontSize: '.9rem', color: 'var(--muted)' }}>
                      {professional.experience_years} anos de experiência
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {professional.accepts_online && (
                      <span style={{
                        background: 'var(--success-100)',
                        color: 'var(--success-600)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '.75rem',
                        fontWeight: '600'
                      }}>
                        Online
                      </span>
                    )}
                    {professional.accepts_insurance && (
                      <span style={{
                        background: 'var(--primary-100)',
                        color: 'var(--primary-600)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '.75rem',
                        fontWeight: '600'
                      }}>
                        Convênio
                      </span>
                    )}
                  </div>
                </div>

                {professional.bio && (
                  <p style={{
                    margin: '0 0 16px',
                    fontSize: '.9rem',
                    color: 'var(--muted)',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {professional.bio}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link
                    to={`/professionals/${professional.id}`}
                    style={{
                      color: 'var(--primary-600)',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    Ver perfil completo
                  </Link>
                  <Link
                    to={`/scheduling/${professional.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '.9rem',
                      border: '1px solid transparent',
                      cursor: 'pointer',
                      transition: '.2s transform ease, .25s box-shadow ease, .2s filter ease',
                      background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
                      color: '#fff',
                      boxShadow: 'var(--shadow-2)',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.filter = 'brightness(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.filter = 'none';
                    }}
                  >
                    <Calendar size={16} />
                    Agendar
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 0'
            }}>
              <User size={64} style={{ color: 'var(--muted)', margin: '0 auto 16px' }} />
              <h3 style={{
                margin: '0 0 8px',
                fontSize: '1.2rem',
                fontWeight: '600',
                color: 'var(--text)'
              }}>
                Nenhum profissional encontrado
              </h3>
              <p style={{
                margin: '0 0 20px',
                color: 'var(--muted)'
              }}>
                Tente ajustar os filtros de busca
              </p>
              <button
                onClick={() => setFilters({ search: '', specialty: '', location: '', availability: '' })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '.95rem',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                  transition: '.2s border-color ease',
                  background: 'var(--surface)',
                  color: 'var(--text)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 30%, var(--line))';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'var(--line)';
                }}
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Load More */}
        {professionals?.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '.95rem',
              border: '1px solid var(--line)',
              cursor: 'pointer',
              transition: '.2s border-color ease',
              background: 'var(--surface)',
              color: 'var(--text)'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 30%, var(--line))';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--line)';
            }}
            >
              Carregar mais profissionais
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
