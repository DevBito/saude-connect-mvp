import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Phone, Calendar, MapPin, Lock, Save, LogOut, ArrowLeft } from 'lucide-react'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birth_date: user?.birth_date || '',
      gender: user?.gender || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      zip_code: user?.zip_code || ''
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Aqui você faria a chamada para a API para atualizar o perfil
      // await authService.updateProfile(data)
      updateUser(data)
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
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
              Meu Perfil
            </h1>
            <p style={{ 
              margin: '0', 
              opacity: '0.9',
              fontSize: '1.1rem'
            }}>
              Gerencie suas informações pessoais
            </p>
          </div>
        </section>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {/* Profile Card */}
          <div>
            <div style={{
              background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-1)',
              padding: '32px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '96px',
                height: '96px',
                background: 'var(--primary-100)',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 20px'
              }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: 'var(--primary-600)'
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 style={{
                margin: '0 0 8px',
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text)'
              }}>
                {user?.name}
              </h2>
              <p style={{
                margin: '0 0 20px',
                color: 'var(--muted)'
              }}>
                {user?.email}
              </p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '.85rem',
                fontWeight: '600',
                background: 'var(--success-100)',
                color: 'var(--success-600)'
              }}>
                Conta ativa
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <div>
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
                  Informações Pessoais
                </h2>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
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
                    Editar
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  {/* Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '8px'
                    }}>
                      Nome completo
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        transform: 'translateY(-50%)',
                        color: 'var(--muted)'
                      }}>
                        <User size={20} />
                      </div>
                      <input
                        {...register('name', {
                          required: 'Nome é obrigatório',
                          minLength: {
                            value: 2,
                            message: 'Nome deve ter pelo menos 2 caracteres'
                          }
                        })}
                        type="text"
                        disabled={!isEditing}
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 44px',
                          border: '1px solid var(--line)',
                          borderRadius: '12px',
                          background: isEditing ? 'var(--surface)' : 'var(--surface-2)',
                          color: isEditing ? 'var(--text)' : 'var(--muted)',
                          fontSize: '1rem',
                          transition: '.2s border-color ease, .2s box-shadow ease'
                        }}
                        onFocus={(e) => {
                          if (isEditing) {
                            e.target.style.outline = 'none';
                            e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 50%, var(--line))';
                            e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--primary-600) 18%, transparent)';
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--line)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    {errors.name && (
                      <p style={{
                        margin: '4px 0 0',
                        fontSize: '.85rem',
                        color: 'var(--error-600)'
                      }}>
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '8px'
                    }}>
                      Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        transform: 'translateY(-50%)',
                        color: 'var(--muted)'
                      }}>
                        <Mail size={20} />
                      </div>
                      <input
                        {...register('email', {
                          required: 'Email é obrigatório',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                        type="email"
                        disabled={!isEditing}
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 44px',
                          border: '1px solid var(--line)',
                          borderRadius: '12px',
                          background: isEditing ? 'var(--surface)' : 'var(--surface-2)',
                          color: isEditing ? 'var(--text)' : 'var(--muted)',
                          fontSize: '1rem',
                          transition: '.2s border-color ease, .2s box-shadow ease'
                        }}
                        onFocus={(e) => {
                          if (isEditing) {
                            e.target.style.outline = 'none';
                            e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 50%, var(--line))';
                            e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--primary-600) 18%, transparent)';
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--line)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    {errors.email && (
                      <p style={{
                        margin: '4px 0 0',
                        fontSize: '.85rem',
                        color: 'var(--error-600)'
                      }}>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '8px'
                    }}>
                      Telefone
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        transform: 'translateY(-50%)',
                        color: 'var(--muted)'
                      }}>
                        <Phone size={20} />
                      </div>
                      <input
                        {...register('phone')}
                        type="tel"
                        disabled={!isEditing}
                        placeholder="(11) 99999-9999"
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 44px',
                          border: '1px solid var(--line)',
                          borderRadius: '12px',
                          background: isEditing ? 'var(--surface)' : 'var(--surface-2)',
                          color: isEditing ? 'var(--text)' : 'var(--muted)',
                          fontSize: '1rem',
                          transition: '.2s border-color ease, .2s box-shadow ease'
                        }}
                        onFocus={(e) => {
                          if (isEditing) {
                            e.target.style.outline = 'none';
                            e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 50%, var(--line))';
                            e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--primary-600) 18%, transparent)';
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--line)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '8px'
                    }}>
                      Data de nascimento
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '12px',
                        transform: 'translateY(-50%)',
                        color: 'var(--muted)'
                      }}>
                        <Calendar size={20} />
                      </div>
                      <input
                        {...register('birth_date')}
                        type="date"
                        disabled={!isEditing}
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 44px',
                          border: '1px solid var(--line)',
                          borderRadius: '12px',
                          background: isEditing ? 'var(--surface)' : 'var(--surface-2)',
                          color: isEditing ? 'var(--text)' : 'var(--muted)',
                          fontSize: '1rem',
                          transition: '.2s border-color ease, .2s box-shadow ease'
                        }}
                        onFocus={(e) => {
                          if (isEditing) {
                            e.target.style.outline = 'none';
                            e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 50%, var(--line))';
                            e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--primary-600) 18%, transparent)';
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--line)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '8px'
                    }}>
                      Gênero
                    </label>
                    <select
                      {...register('gender')}
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        background: isEditing ? 'var(--surface)' : 'var(--surface-2)',
                        color: isEditing ? 'var(--text)' : 'var(--muted)',
                        fontSize: '1rem',
                        cursor: isEditing ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '8px'
                    }}>
                      Endereço
                    </label>
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
                        {...register('address')}
                        type="text"
                        disabled={!isEditing}
                        placeholder="Rua, número, bairro"
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 44px',
                          border: '1px solid var(--line)',
                          borderRadius: '12px',
                          background: isEditing ? 'var(--surface)' : 'var(--surface-2)',
                          color: isEditing ? 'var(--text)' : 'var(--muted)',
                          fontSize: '1rem',
                          transition: '.2s border-color ease, .2s box-shadow ease'
                        }}
                        onFocus={(e) => {
                          if (isEditing) {
                            e.target.style.outline = 'none';
                            e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 50%, var(--line))';
                            e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--primary-600) 18%, transparent)';
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--line)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '8px'
                    }}>
                      Cidade
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      disabled={!isEditing}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        background: isEditing ? 'var(--surface)' : 'var(--surface-2)',
                        color: isEditing ? 'var(--text)' : 'var(--muted)',
                        fontSize: '1rem',
                        transition: '.2s border-color ease, .2s box-shadow ease'
                      }}
                      onFocus={(e) => {
                        if (isEditing) {
                          e.target.style.outline = 'none';
                          e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 50%, var(--line))';
                          e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--primary-600) 18%, transparent)';
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--line)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '.9rem',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '8px'
                    }}>
                      Estado
                    </label>
                    <input
                      {...register('state')}
                      type="text"
                      maxLength="2"
                      disabled={!isEditing}
                      placeholder="SP"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        background: isEditing ? 'var(--surface)' : 'var(--surface-2)',
                        color: isEditing ? 'var(--text)' : 'var(--muted)',
                        fontSize: '1rem',
                        transition: '.2s border-color ease, .2s box-shadow ease'
                      }}
                      onFocus={(e) => {
                        if (isEditing) {
                          e.target.style.outline = 'none';
                          e.target.style.borderColor = 'color-mix(in srgb, var(--primary-600) 50%, var(--line))';
                          e.target.style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--primary-600) 18%, transparent)';
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--line)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid var(--line)'
                  }}>
                    <button
                      type="button"
                      onClick={handleCancel}
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
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '.95rem',
                        border: '1px solid transparent',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: '.2s transform ease, .25s box-shadow ease, .2s filter ease',
                        background: 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
                        color: '#fff',
                        boxShadow: 'var(--shadow-2)',
                        opacity: isLoading ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.target.style.filter = 'brightness(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.filter = 'none';
                      }}
                    >
                      {isLoading ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid currentColor',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Salvar alterações
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div style={{
              marginTop: '24px',
              background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--line)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-1)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid var(--line)'
              }}>
                <h2 style={{
                  margin: '0',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--text)'
                }}>
                  Alterar Senha
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                <button style={{
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
                  <Lock size={16} />
                  Alterar senha
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
