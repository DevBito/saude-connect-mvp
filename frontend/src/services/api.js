import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('🔑 Token no localStorage:', token ? 'Token presente' : 'Token ausente')
    console.log('📡 URL da requisição:', config.url)
    console.log('📋 Headers antes:', config.headers)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token adicionado aos headers')
    } else {
      console.log('❌ Token não encontrado no localStorage')
    }
    
    console.log('📋 Headers depois:', config.headers)
    return config
  },
  (error) => {
    console.log('❌ Erro no interceptor de request:', error)
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
