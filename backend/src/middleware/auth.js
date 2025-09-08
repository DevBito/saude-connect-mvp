const jwt = require('jsonwebtoken')
const pool = require('../config/database.js')

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    console.log('🔑 Auth middleware - Token recebido:', token ? `Token presente (${token.substring(0, 20)}...)` : 'Token ausente')
    console.log('🔑 Auth middleware - JWT Secret configurado:', process.env.SAUDE_SUPABASE_JWT_SECRET ? 'Sim' : 'Não')

    if (!token) {
      console.log('❌ Auth middleware - Token ausente')
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      })
    }

    const decoded = jwt.verify(token, process.env.SAUDE_SUPABASE_JWT_SECRET)
    console.log('🔑 Auth middleware - Token decodificado:', decoded)
    
    // Buscar usuário no banco de dados
    console.log('🔍 Auth middleware - Buscando usuário com ID:', decoded.userId)
    const userQuery = `
      SELECT id, uuid, name, email, role, is_active, email_verified
      FROM users 
      WHERE id = $1 AND is_active = true
    `
    const userResult = await pool.query(userQuery, [decoded.userId])
    
    console.log('👤 Auth middleware - Resultado da busca do usuário:', userResult.rows)
    
    if (userResult.rows.length === 0) {
      console.log('❌ Auth middleware - Usuário não encontrado ou inativo')
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      })
    }

    req.user = userResult.rows[0]
    console.log('✅ Auth middleware - Usuário autenticado:', req.user)
    next()
  } catch (error) {
    console.error('❌ Auth middleware - Erro na autenticação:', error)
    console.error('❌ Auth middleware - Tipo do erro:', error.name)
    console.error('❌ Auth middleware - Mensagem do erro:', error.message)
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Auth middleware - Token inválido')
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('❌ Auth middleware - Token expirado')
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      })
    }

    console.error('❌ Auth middleware - Erro interno do servidor')
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
    })
  }
  next()
}

const requireEmailVerification = (req, res, next) => {
  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      message: 'Email não verificado. Verifique seu email antes de continuar.'
    })
  }
  next()
}

module.exports = { authenticateToken, requireAdmin, requireEmailVerification }
