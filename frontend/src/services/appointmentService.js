import api from './api'

export const appointmentService = {
  // Obter agendamentos do usuário
  async getUserAppointments() {
    const response = await api.get('/appointments')
    return response.data
  },

  // Criar agendamento
  async createAppointment(appointmentData) {
    console.log('📅 appointmentService.createAppointment - Dados:', appointmentData)
    console.log('📅 appointmentService.createAppointment - URL:', '/appointments')
    const response = await api.post('/appointments', appointmentData)
    console.log('📅 appointmentService.createAppointment - Resposta:', response.data)
    return response.data
  },

  // Atualizar agendamento
  async updateAppointment(id, appointmentData) {
    const response = await api.put(`/appointments/${id}`, appointmentData)
    return response.data
  },

  // Cancelar agendamento
  async cancelAppointment(id) {
    const response = await api.delete(`/appointments/${id}`)
    return response.data
  },

  // Obter agendamento por ID
  async getAppointmentById(id) {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  // Obter histórico médico
  async getMedicalHistory() {
    const response = await api.get('/appointments/history')
    return response.data
  }
}
