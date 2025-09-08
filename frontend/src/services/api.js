import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://saude-connect-mvp-rtzk.vercel.app/api')

console.log('🌐 VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('🌐 API_BASE_URL final:', API_BASE_URL)

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
    const fullUrl = `${config.baseURL}${config.url}`
    
    console.log('🔑 Token no localStorage:', token ? `Token presente (${token.substring(0, 20)}...)` : 'Token ausente')
    console.log('📡 URL relativa:', config.url)
    console.log('🌐 URL completa:', fullUrl)
    console.log('📋 Headers antes:', config.headers)

    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token adicionado aos headers')
    } else {
      console.log('❌ Token não encontrado ou inválido no localStorage')
      console.log('🔍 Valor do token:', token)
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
