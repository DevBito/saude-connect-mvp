import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useAuth } from '../context/AuthContext'
import { appointmentService } from '../services/appointmentService'
import { Calendar, Clock, User, FileText, Download, LogOut, ArrowLeft } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function History() {
  const { user, logout } = useAuth()
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const { data: appointments, isLoading } = useQuery(
    'medicalHistory',
    appointmentService.getMedicalHistory
  )

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const formatTime = (dateString) => {
    return format(parseISO(dateString), 'HH:mm')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Realizada'
      case 'cancelled':
        return 'Cancelada'
      case 'no_show':
        return 'Não compareceu'
      default:
        return status
    }
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
              Histórico Médico
            </h1>
            <p style={{ 
              margin: '0', 
              opacity: '0.9',
              fontSize: '1.1rem'
            }}>
              Acompanhe suas consultas e resultados
            </p>
          </div>
        </section>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {/* Appointments List */}
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
                  Consultas Realizadas
                </h2>
              </div>
              
              <div>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} style={{
                      padding: '24px',
                      borderBottom: '1px solid var(--line)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: 'var(--surface-2)',
                          borderRadius: '12px'
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
                    </div>
                  ))
                ) : appointments?.length > 0 ? (
                  appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      style={{
                        padding: '24px',
                        borderBottom: '1px solid var(--line)',
                        cursor: 'pointer',
                        transition: '.2s background-color ease'
                      }}
                      onClick={() => setSelectedAppointment(appointment)}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'var(--surface-2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                                <Calendar size={14} style={{ marginRight: '4px' }} />
                                {formatDate(appointment.appointment_date)}
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                fontSize: '.85rem',
                                color: 'var(--muted)'
                              }}>
                                <Clock size={14} style={{ marginRight: '4px' }} />
                                {formatTime(appointment.appointment_date)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            fontSize: '.75rem',
                            fontWeight: '600',
                            borderRadius: '20px',
                            background: getStatusColor(appointment.status).includes('green') ? 'var(--success-100)' : 
                                       getStatusColor(appointment.status).includes('red') ? 'var(--error-100)' : 
                                       getStatusColor(appointment.status).includes('blue') ? 'var(--primary-100)' : 'var(--surface-2)',
                            color: getStatusColor(appointment.status).includes('green') ? 'var(--success-600)' : 
                                   getStatusColor(appointment.status).includes('red') ? 'var(--error-600)' : 
                                   getStatusColor(appointment.status).includes('blue') ? 'var(--primary-600)' : 'var(--muted)'
                          }}>
                            {getStatusText(appointment.status)}
                          </span>
                          <button style={{
                            color: 'var(--primary-600)',
                            fontSize: '.9rem',
                            fontWeight: '600',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}>
                            Ver detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <Calendar size={64} style={{ color: 'var(--muted)', margin: '0 auto 16px' }} />
                    <h3 style={{
                      margin: '0 0 8px',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: 'var(--text)'
                    }}>
                      Nenhuma consulta encontrada
                    </h3>
                    <p style={{
                      margin: '0',
                      color: 'var(--muted)'
                    }}>
                      Suas consultas realizadas aparecerão aqui
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div>
            {selectedAppointment ? (
              <div style={{
                background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                boxShadow: 'var(--shadow-1)',
                padding: '24px'
              }}>
                <h3 style={{
                  margin: '0 0 20px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: 'var(--text)'
                }}>
                  Detalhes da Consulta
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{
                      margin: '0 0 8px',
                      fontWeight: '600',
                      color: 'var(--text)'
                    }}>
                      Profissional
                    </h4>
                    <p style={{
                      margin: '0 0 4px',
                      color: 'var(--muted)'
                    }}>
                      {selectedAppointment.professional?.name}
                    </p>
                    <p style={{
                      margin: '0',
                      fontSize: '.9rem',
                      color: 'var(--muted)'
                    }}>
                      {selectedAppointment.professional?.specialty}
                    </p>
                  </div>

                  <div>
                    <h4 style={{
                      margin: '0 0 8px',
                      fontWeight: '600',
                      color: 'var(--text)'
                    }}>
                      Data e Horário
                    </h4>
                    <p style={{
                      margin: '0',
                      color: 'var(--muted)'
                    }}>
                      {formatDate(selectedAppointment.appointment_date)} às {formatTime(selectedAppointment.appointment_date)}
                    </p>
                  </div>

                  <div>
                    <h4 style={{
                      margin: '0 0 8px',
                      fontWeight: '600',
                      color: 'var(--text)'
                    }}>
                      Tipo
                    </h4>
                    <p style={{
                      margin: '0',
                      color: 'var(--muted)',
                      textTransform: 'capitalize'
                    }}>
                      {selectedAppointment.type === 'presential' ? 'Presencial' : 'Online'}
                    </p>
                  </div>

                  {selectedAppointment.diagnosis && (
                    <div>
                      <h4 style={{
                        margin: '0 0 8px',
                        fontWeight: '600',
                        color: 'var(--text)'
                      }}>
                        Diagnóstico
                      </h4>
                      <p style={{
                        margin: '0',
                        color: 'var(--muted)'
                      }}>
                        {selectedAppointment.diagnosis}
                      </p>
                    </div>
                  )}

                  {selectedAppointment.prescription && (
                    <div>
                      <h4 style={{
                        margin: '0 0 8px',
                        fontWeight: '600',
                        color: 'var(--text)'
                      }}>
                        Prescrição
                      </h4>
                      <p style={{
                        margin: '0',
                        color: 'var(--muted)'
                      }}>
                        {selectedAppointment.prescription}
                      </p>
                    </div>
                  )}

                  {selectedAppointment.results?.length > 0 && (
                    <div>
                      <h4 style={{
                        margin: '0 0 12px',
                        fontWeight: '600',
                        color: 'var(--text)'
                      }}>
                        Resultados
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedAppointment.results.map((result) => (
                          <div key={result.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px',
                            background: 'var(--surface-2)',
                            borderRadius: '12px',
                            border: '1px solid var(--line)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <FileText size={20} style={{ color: 'var(--muted)' }} />
                              <div>
                                <p style={{
                                  margin: '0 0 4px',
                                  fontWeight: '600',
                                  color: 'var(--text)'
                                }}>
                                  {result.title}
                                </p>
                                <p style={{
                                  margin: '0',
                                  fontSize: '.85rem',
                                  color: 'var(--muted)'
                                }}>
                                  {formatDate(result.created_at)}
                                </p>
                              </div>
                            </div>
                            <button style={{
                              color: 'var(--primary-600)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '8px',
                              borderRadius: '8px',
                              transition: '.2s background-color ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--primary-100)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'none';
                            }}
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--line)',
                borderRadius: '18px',
                boxShadow: 'var(--shadow-1)',
                padding: '24px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <FileText size={48} style={{ color: 'var(--muted)', margin: '0 auto 16px' }} />
                  <h3 style={{
                    margin: '0 0 8px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    Selecione uma consulta
                  </h3>
                  <p style={{
                    margin: '0',
                    fontSize: '.9rem',
                    color: 'var(--muted)'
                  }}>
                    Clique em uma consulta para ver os detalhes
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
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
