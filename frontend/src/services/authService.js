import api from './api'

export const authService = {
  // Login
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Registro
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Obter usuário atual
  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Atualizar perfil
  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },

  // Alterar senha
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  // Recuperar senha
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Resetar senha
  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword
    })
    return response.data
  }
}
