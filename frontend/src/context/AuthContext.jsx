import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const user = await authService.getCurrentUser()
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Token inválido'
          })
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' })
    
    try {
      const response = await authService.login(email, password)
      console.log('🔑 Resposta do login:', response)
      
      // A resposta tem a estrutura: { success: true, data: { user: {...}, token: "..." } }
      const { user, token } = response.data
      
      if (token) {
        localStorage.setItem('token', token)
        console.log('✅ Token salvo no localStorage:', token.substring(0, 20) + '...')
      } else {
        console.error('❌ Token não encontrado na resposta')
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      return { success: true }
    } catch (error) {
      console.error('❌ Erro no login:', error)
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login'
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      })
      
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' })
    
    try {
      const response = await authService.register(userData)
      console.log('🔑 Resposta do registro:', response)
      
      // A resposta tem a estrutura: { success: true, data: { user: {...}, token: "..." } }
      const { user, token } = response.data
      
      if (token) {
        localStorage.setItem('token', token)
        console.log('✅ Token salvo no localStorage:', token.substring(0, 20) + '...')
      } else {
        console.error('❌ Token não encontrado na resposta')
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      return { success: true }
    } catch (error) {
      console.error('❌ Erro no registro:', error)
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta'
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      })
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const updateUser = (userData) => {
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: {
        user: { ...state.user, ...userData },
        token: state.token
      }
    })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
