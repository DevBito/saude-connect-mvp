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
  Heart
} from 'lucide-react'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const { user } = useAuth()
  const [upcomingAppointments, setUpcomingAppointments] = useState([])

  // Buscar agendamentos do usuário
  const { data: appointments, isLoading } = useQuery(
    'userAppointments',
    appointmentService.getUserAppointments,
    {
      onSuccess: (data) => {
        const upcoming = data
          .filter(apt => new Date(apt.appointment_date) > new Date())
          .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
          .slice(0, 3)
        setUpcomingAppointments(upcoming)
      }
    }
  )

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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Olá, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-100">
              Como está se sentindo hoje? Vamos cuidar da sua saúde.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Consultas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Próximas Consultas</h2>
                <Link
                  to="/professionals"
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  Nova Consulta
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="spinner"></div>
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {appointment.professional?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {appointment.professional?.specialty}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock size={14} className="mr-1" />
                              {formatAppointmentDate(appointment.appointment_date)}
                            </div>
                            {appointment.type === 'presential' && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin size={14} className="mr-1" />
                                Presencial
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                        <Link
                          to={`/appointments/${appointment.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma consulta agendada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Que tal agendar sua primeira consulta?
                  </p>
                  <Link to="/professionals" className="btn btn-primary">
                    Buscar Profissionais
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Ações Rápidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Link
                to="/professionals"
                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">Buscar Profissionais</span>
              </Link>
              
              <Link
                to="/history"
                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">Ver Histórico</span>
              </Link>
              
              <Link
                to="/profile"
                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium">Meu Perfil</span>
              </Link>
            </div>
          </div>

          {/* Dicas de Saúde */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Dica de Saúde</h2>
            <p className="text-gray-700 text-sm">
              Lembre-se de beber pelo menos 2 litros de água por dia e manter uma alimentação equilibrada. 
              Pequenos hábitos fazem grande diferença na sua saúde!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
