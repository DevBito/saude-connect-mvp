import api from './api'

export const professionalService = {
  // Buscar profissionais
  async getProfessionals(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.specialty) params.append('specialty', filters.specialty)
    if (filters.location) params.append('location', filters.location)
    if (filters.availability) params.append('availability', filters.availability)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    const response = await api.get(`/professionals?${params.toString()}`)
    return response.data
  },

  // Obter profissional por ID
  async getProfessionalById(id) {
    const response = await api.get(`/professionals/${id}`)
    return response.data
  },

  // Obter disponibilidade de um profissional
  async getAvailability(professionalId, date) {
    const response = await api.get(`/professionals/${professionalId}/availability`, {
      params: { date }
    })
    return response.data
  },

  // Obter avaliações de um profissional
  async getReviews(professionalId) {
    const response = await api.get(`/professionals/${professionalId}/reviews`)
    return response.data
  },

  // Criar avaliação
  async createReview(professionalId, reviewData) {
    const response = await api.post(`/professionals/${professionalId}/reviews`, reviewData)
    return response.data
  }
}
