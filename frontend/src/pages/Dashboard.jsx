import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useAuth } from '../context/AuthContext'
import { appointmentService } from '../services/appointmentService'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus,
  Bell,
  TrendingUp,
  Heart,
  LogOut,
  Settings,
  Search
} from 'lucide-react'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [upcomingAppointments, setUpcomingAppointments] = useState([])

  // Buscar agendamentos do usuário
  const { data: appointmentsResponse, isLoading } = useQuery(
    'userAppointments',
    appointmentService.getUserAppointments,
    {
      onSuccess: (response) => {
        console.log('📅 Resposta dos appointments:', response)
        const data = response.data || []
        const upcoming = data
          .filter(apt => new Date(apt.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3)
        setUpcomingAppointments(upcoming)
      }
    }
  )

  // Extrair os dados dos appointments da resposta
  const appointments = appointmentsResponse?.data || []

  const formatAppointmentDate = (dateString) => {
    const date = parseISO(dateString)
    if (isToday(date)) {
      return `Hoje às ${format(date, 'HH:mm')}`
    } else if (isTomorrow(date)) {
      return `Amanhã às ${format(date, 'HH:mm')}`
    } else {
      return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado'
      case 'confirmed':
        return 'Confirmado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const stats = [
    {
      title: 'Consultas Agendadas',
      value: appointments?.filter(apt => apt.status === 'scheduled').length || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Consultas Realizadas',
      value: appointments?.filter(apt => apt.status === 'completed').length || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Profissionais Favoritos',
      value: 0, // Implementar favoritos
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ]

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
        {/* Welcome Section */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ 
                margin: '0 0 8px', 
                fontSize: 'clamp(1.8rem, 1.6rem + 1vw, 2.4rem)', 
                lineHeight: '1.2',
                fontWeight: '800'
              }}>
                Olá, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p style={{ 
                margin: '0', 
                opacity: '0.9',
                fontSize: '1.1rem'
              }}>
                Como está se sentindo hoje? Vamos cuidar da sua saúde.
              </p>
            </div>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              display: 'grid',
              placeItems: 'center'
            }}>
              <Bell size={28} />
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} style={{
                background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                boxShadow: 'var(--shadow-1)',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ 
                      margin: '0 0 8px', 
                      fontSize: '.9rem', 
                      fontWeight: '600',
                      color: 'var(--muted)'
                    }}>
                      {stat.title}
                    </p>
                    <p style={{ 
                      margin: '0', 
                      fontSize: '2rem', 
                      fontWeight: '800',
                      color: 'var(--text)'
                    }}>
                      {stat.value}
                    </p>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: stat.bgColor.replace('bg-', 'var(--').replace('-100', '-100)')
                  }}>
                    <Icon size={24} style={{ color: stat.color.replace('text-', 'var(--').replace('-600', '-600)') }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {/* Próximas Consultas */}
          <div style={{ minWidth: '0' }}>
            <div style={{
              background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-1)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h2 style={{ 
                  margin: '0', 
                  fontSize: '1.25rem', 
                  fontWeight: '700',
                  color: 'var(--text)'
                }}>
                  Próximas Consultas
                </h2>
                <Link
                  to="/professionals"
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
                  <Plus size={16} />
                  Nova Consulta
                </Link>
              </div>
              
              <div style={{ padding: '24px' }}>
                {isLoading ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '32px 0' 
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid var(--line)',
                      borderTop: '3px solid var(--primary-600)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '20px',
                          background: 'var(--surface-2)',
                          borderRadius: '14px',
                          border: '1px solid var(--line)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'var(--primary-100)',
                            borderRadius: '12px',
                            display: 'grid',
                            placeItems: 'center'
                          }}>
                            <User size={24} style={{ color: 'var(--primary-600)' }} />
                          </div>
                          <div>
                            <h3 style={{ 
                              margin: '0 0 4px', 
                              fontWeight: '600',
                              color: 'var(--text)'
                            }}>
                              {appointment.professional?.name}
                            </h3>
                            <p style={{ 
                              margin: '0 0 8px', 
                              fontSize: '.9rem',
                              color: 'var(--muted)'
                            }}>
                              {appointment.professional?.specialty}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                fontSize: '.85rem',
                                color: 'var(--muted)'
                              }}>
                                <Clock size={14} style={{ marginRight: '4px' }} />
                                {formatAppointmentDate(appointment.appointment_date)}
                              </div>
                              {appointment.type === 'presential' && (
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  fontSize: '.85rem',
                                  color: 'var(--muted)'
                                }}>
                                  <MapPin size={14} style={{ marginRight: '4px' }} />
                                  Presencial
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            fontSize: '.75rem',
                            fontWeight: '600',
                            borderRadius: '20px',
                            background: getStatusColor(appointment.status).includes('blue') ? 'var(--primary-100)' : 
                                       getStatusColor(appointment.status).includes('green') ? 'var(--success-100)' : 
                                       getStatusColor(appointment.status).includes('red') ? 'var(--error-100)' : 'var(--surface-2)',
                            color: getStatusColor(appointment.status).includes('blue') ? 'var(--primary-600)' : 
                                   getStatusColor(appointment.status).includes('green') ? 'var(--success-600)' : 
                                   getStatusColor(appointment.status).includes('red') ? 'var(--error-600)' : 'var(--muted)'
                          }}>
                            {getStatusText(appointment.status)}
                          </span>
                          <Link
                            to={`/appointments/${appointment.id}`}
                            style={{
                              color: 'var(--primary-600)',
                              fontSize: '.9rem',
                              fontWeight: '600',
                              textDecoration: 'none'
                            }}
                          >
                            Ver detalhes
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <Calendar size={48} style={{ color: 'var(--muted)', margin: '0 auto 16px' }} />
                    <h3 style={{ 
                      margin: '0 0 8px', 
                      fontSize: '1.1rem', 
                      fontWeight: '600',
                      color: 'var(--text)'
                    }}>
                      Nenhuma consulta agendada
                    </h3>
                    <p style={{ 
                      margin: '0 0 20px', 
                      color: 'var(--muted)'
                    }}>
                      Que tal agendar sua primeira consulta?
                    </p>
                    <Link 
                      to="/professionals" 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontWeight: '700',
                        letterSpacing: '.2px',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        transition: '.2s transform ease, .25s box-shadow ease, .2s filter ease',
                        background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
                        color: '#fff',
                        boxShadow: 'var(--shadow-2)',
                        textDecoration: 'none'
                      }}
                    >
                      Buscar Profissionais
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Ações Rápidas */}
            <div style={{
              background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--line)',
              borderRadius: '18px',
              boxShadow: 'var(--shadow-1)',
              padding: '24px'
            }}>
              <h2 style={{ 
                margin: '0 0 20px', 
                fontSize: '1.1rem', 
                fontWeight: '700',
                color: 'var(--text)'
              }}>
                Ações Rápidas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link
                  to="/professionals"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    color: 'var(--text)',
                    borderRadius: '12px',
                    transition: '.2s background-color ease',
                    textDecoration: 'none',
                    border: '1px solid var(--line)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--primary-100)',
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    marginRight: '12px'
                  }}>
                    <Search size={20} style={{ color: 'var(--primary-600)' }} />
                  </div>
                  <span style={{ fontWeight: '600' }}>Buscar Profissionais</span>
                </Link>
                
                <Link
                  to="/history"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    color: 'var(--text)',
                    borderRadius: '12px',
                    transition: '.2s background-color ease',
                    textDecoration: 'none',
                    border: '1px solid var(--line)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--success-100)',
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    marginRight: '12px'
                  }}>
                    <TrendingUp size={20} style={{ color: 'var(--success-600)' }} />
                  </div>
                  <span style={{ fontWeight: '600' }}>Ver Histórico</span>
                </Link>
                
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    color: 'var(--text)',
                    borderRadius: '12px',
                    transition: '.2s background-color ease',
                    textDecoration: 'none',
                    border: '1px solid var(--line)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--secondary-100)',
                    borderRadius: '10px',
                    display: 'grid',
                    placeItems: 'center',
                    marginRight: '12px'
                  }}>
                    <Settings size={20} style={{ color: 'var(--secondary-600)' }} />
                  </div>
                  <span style={{ fontWeight: '600' }}>Meu Perfil</span>
                </Link>
              </div>
            </div>

            {/* Dicas de Saúde */}
            <div style={{
              background: 'linear-gradient(135deg, var(--success-50), var(--success-100))',
              borderRadius: '18px',
              padding: '24px',
              border: '1px solid var(--success-200)'
            }}>
              <h2 style={{ 
                margin: '0 0 16px', 
                fontSize: '1.1rem', 
                fontWeight: '700',
                color: 'var(--text)'
              }}>
                💡 Dica de Saúde
              </h2>
              <p style={{ 
                margin: '0', 
                color: 'var(--muted)',
                fontSize: '.95rem',
                lineHeight: '1.5'
              }}>
                Lembre-se de beber pelo menos 2 litros de água por dia e manter uma alimentação equilibrada. 
                Pequenos hábitos fazem grande diferença na sua saúde!
              </p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
