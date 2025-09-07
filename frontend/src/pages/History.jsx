import { useState } from 'react'
import { useQuery } from 'react-query'
import { appointmentService } from '../services/appointmentService'
import { Calendar, Clock, User, FileText, Download } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function History() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Histórico Médico</h1>
        <p className="text-gray-600">Acompanhe suas consultas e resultados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Consultas Realizadas</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-6 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : appointments?.length > 0 ? (
                appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="flex items-center justify-between">
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
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(appointment.appointment_date)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTime(appointment.appointment_date)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                        <button className="text-primary-600 hover:text-primary-700">
                          Ver detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma consulta encontrada
                  </h3>
                  <p className="text-gray-600">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detalhes da Consulta
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Profissional</h4>
                  <p className="text-gray-600">{selectedAppointment.professional?.name}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.professional?.specialty}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Data e Horário</h4>
                  <p className="text-gray-600">
                    {formatDate(selectedAppointment.appointment_date)} às {formatTime(selectedAppointment.appointment_date)}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Tipo</h4>
                  <p className="text-gray-600 capitalize">
                    {selectedAppointment.type === 'presential' ? 'Presencial' : 'Online'}
                  </p>
                </div>

                {selectedAppointment.diagnosis && (
                  <div>
                    <h4 className="font-medium text-gray-900">Diagnóstico</h4>
                    <p className="text-gray-600">{selectedAppointment.diagnosis}</p>
                  </div>
                )}

                {selectedAppointment.prescription && (
                  <div>
                    <h4 className="font-medium text-gray-900">Prescrição</h4>
                    <p className="text-gray-600">{selectedAppointment.prescription}</p>
                  </div>
                )}

                {selectedAppointment.results?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Resultados</h4>
                    <div className="space-y-2">
                      {selectedAppointment.results.map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{result.title}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(result.created_at)}
                              </p>
                            </div>
                          </div>
                          <button className="text-primary-600 hover:text-primary-700">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Selecione uma consulta
                </h3>
                <p className="text-sm text-gray-600">
                  Clique em uma consulta para ver os detalhes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
