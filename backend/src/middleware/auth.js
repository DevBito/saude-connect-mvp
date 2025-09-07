const jwt = require('jsonwebtoken')
const pool = require('../config/database.js')

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Buscar usuário no banco de dados
    const userQuery = `
      SELECT id, uuid, name, email, role, is_active, email_verified
      FROM users 
      WHERE id = $1 AND is_active = true
    `
    const userResult = await pool.query(userQuery, [decoded.userId])
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      })
    }

    req.user = userResult.rows[0]
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      })
    }

    console.error('Erro na autenticação:', error)
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
