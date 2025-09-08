import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { professionalService } from '../services/professionalService'
import { appointmentService } from '../services/appointmentService'
import { Calendar, Clock, MapPin, User, LogOut, ArrowLeft } from 'lucide-react'

export default function Scheduling() {
  const { user, logout } = useAuth()
  const { professionalId } = useParams()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [professional, setProfessional] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ]

  // Carregar dados do profissional
  useEffect(() => {
    const loadProfessional = async () => {
      try {
        setIsLoading(true)
        const response = await professionalService.getProfessionalById(professionalId)
        setProfessional(response.professional)
      } catch (error) {
        console.error('Erro ao carregar profissional:', error)
        setError('Erro ao carregar dados do profissional')
      } finally {
        setIsLoading(false)
      }
    }

    if (professionalId) {
      loadProfessional()
    }
  }, [professionalId])

  // Função para confirmar agendamento
  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedTime || !professional) return

    try {
      setIsSubmitting(true)
      setError('')

      const appointmentData = {
        patient_id: parseInt(user.id),
        professional_id: parseInt(professional.id),
        date: selectedDate,
        time: selectedTime,
        notes: ''
      }

      console.log('📅 Dados do agendamento:', appointmentData)
      console.log('👤 Usuário:', user)
      console.log('👨‍⚕️ Profissional:', professional)
      console.log('🔑 Token no localStorage:', localStorage.getItem('token'))

      const response = await appointmentService.createAppointment(appointmentData)
      
      if (response.success) {
        // Redirecionar para dashboard com mensagem de sucesso
        navigate('/dashboard', { 
          state: { 
            message: 'Consulta agendada com sucesso!',
            type: 'success'
          }
        })
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error)
      setError(error.response?.data?.message || 'Erro ao agendar consulta')
    } finally {
      setIsSubmitting(false)
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
              to="/professionals" 
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
              Agendar Consulta
            </h1>
            <p style={{ 
              margin: '0', 
              opacity: '0.9',
              fontSize: '1.1rem'
            }}>
              Selecione a data e horário para sua consulta
            </p>
          </div>
        </section>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {/* Professional Info */}
          <div>
            <div style={{
              background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-1)',
              padding: '24px'
            }}>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text)'
              }}>
                Profissional
              </h2>
              
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--surface-2)',
                    borderRadius: '50%',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: '20px',
                      background: 'var(--surface-2)',
                      borderRadius: '8px',
                      width: '60%',
                      marginBottom: '8px',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}></div>
                    <div style={{
                      height: '16px',
                      background: 'var(--surface-2)',
                      borderRadius: '6px',
                      width: '40%',
                      marginBottom: '8px',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}></div>
                    <div style={{
                      height: '14px',
                      background: 'var(--surface-2)',
                      borderRadius: '6px',
                      width: '30%',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}></div>
                  </div>
                </div>
              ) : professional ? (
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
                      fontWeight: '700',
                      color: 'var(--text)'
                    }}>
                      {professional.name}
                    </h3>
                    <p style={{
                      margin: '0 0 4px',
                      color: 'var(--primary-600)',
                      fontWeight: '600'
                    }}>
                      {professional.specialty}
                    </p>
                    <p style={{
                      margin: '0',
                      fontSize: '.9rem',
                      color: 'var(--muted)'
                    }}>
                      {professional.consultation_price ? `R$ ${professional.consultation_price} por consulta` : 'Preço sob consulta'}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ color: 'var(--muted)' }}>Profissional não encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling Form */}
          <div>
            <div style={{
              background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-1)',
              padding: '24px'
            }}>
              <h2 style={{
                margin: '0 0 20px',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text)'
              }}>
                Selecionar Horário
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '.9rem',
                    fontWeight: '600',
                    color: 'var(--text)',
                    marginBottom: '8px'
                  }}>
                    Data
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
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

                {selectedDate && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '12px'
                    }}>
                      Horário
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                      gap: '8px'
                    }}>
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          style={{
                            padding: '10px 12px',
                            fontSize: '.9rem',
                            border: '1px solid var(--line)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: '.2s all ease',
                            background: selectedTime === time ? 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))' : 'var(--surface)',
                            color: selectedTime === time ? '#fff' : 'var(--text)',
                            borderColor: selectedTime === time ? 'transparent' : 'var(--line)',
                            boxShadow: selectedTime === time ? 'var(--shadow-2)' : 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedTime !== time) {
                              e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 30%, var(--line))';
                              e.target.style.background = 'var(--surface-2)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedTime !== time) {
                              e.target.style.borderColor = 'var(--line)';
                              e.target.style.background = 'var(--surface)';
                            }
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedDate && selectedTime && (
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--line)'
                }}>
                  <h3 style={{
                    margin: '0 0 16px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    Resumo da Consulta
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '.9rem', color: 'var(--muted)' }}>
                      <Calendar size={16} style={{ marginRight: '8px' }} />
                      {new Date(selectedDate).toLocaleDateString('pt-BR')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '.9rem', color: 'var(--muted)' }}>
                      <Clock size={16} style={{ marginRight: '8px' }} />
                      {selectedTime}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '.9rem', color: 'var(--muted)' }}>
                      <MapPin size={16} style={{ marginRight: '8px' }} />
                      Consulta presencial
                    </div>
                  </div>
                  
                  {error && (
                    <div style={{
                      padding: '12px 16px',
                      background: 'var(--error-50)',
                      border: '1px solid var(--error-200)',
                      borderRadius: '8px',
                      color: 'var(--error-600)',
                      fontSize: '.9rem',
                      marginBottom: '16px'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleConfirmAppointment}
                    disabled={isSubmitting || !professional}
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px 20px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      border: '1px solid transparent',
                      cursor: isSubmitting || !professional ? 'not-allowed' : 'pointer',
                      transition: '.2s transform ease, .25s box-shadow ease, .2s filter ease',
                      background: isSubmitting || !professional ? 'var(--muted)' : 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
                      color: '#fff',
                      boxShadow: isSubmitting || !professional ? 'none' : 'var(--shadow-2)',
                      opacity: isSubmitting || !professional ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting && professional) {
                        e.target.style.filter = 'brightness(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting && professional) {
                        e.target.style.filter = 'none';
                      }
                    }}
                  >
                    {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
