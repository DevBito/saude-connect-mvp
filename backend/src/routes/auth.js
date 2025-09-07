const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const pool = require('../config/database.js')
const { authenticateToken } = require('../middleware/auth.js')

const router = express.Router()

// Schemas de validação
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
  birth_date: Joi.date().max('now').optional(),
  gender: Joi.string().valid('masculino', 'feminino', 'outro').optional(),
  cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
})

// Função para gerar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.SAUDE_SUPABASE_JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Função para formatar CPF
const formatCPF = (cpf) => {
  return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Função para formatar telefone
const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      })
    }

    const { name, email, password, phone, birth_date, gender, cpf } = value

    // Verificar se email já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      })
    }

    // Hash da senha
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Inserir usuário no banco
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, birth_date, gender, cpf)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, uuid, name, email, role, created_at`,
      [
        name,
        email,
        passwordHash,
        phone ? formatPhone(phone) : null,
        birth_date,
        gender,
        cpf ? formatCPF(cpf) : null
      ]
    )

    const user = result.rows[0]
    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      })
    }

    const { email, password } = value

    // Buscar usuário
    const result = await pool.query(
      `SELECT id, uuid, name, email, password_hash, role, is_active, email_verified
       FROM users WHERE email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      })
    }

    const user = result.rows[0]

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      })
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      })
    }

    const token = generateToken(user.id)

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified
      },
      token
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, uuid, name, email, phone, birth_date, gender, cpf, 
              address, city, state, zip_code, role, email_verified, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      })
    }

    const user = result.rows[0]

    res.json({
      success: true,
      user: {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        birth_date: user.birth_date,
        gender: user.gender,
        cpf: user.cpf,
        address: user.address,
        city: user.city,
        state: user.state,
        zip_code: user.zip_code,
        role: user.role,
        email_verified: user.email_verified,
        created_at: user.created_at
      }
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const updateSchema = Joi.object({
      name: Joi.string().min(2).max(255).optional(),
      phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
      birth_date: Joi.date().max('now').optional(),
      gender: Joi.string().valid('masculino', 'feminino', 'outro').optional(),
      address: Joi.string().max(500).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().length(2).optional(),
      zip_code: Joi.string().max(10).optional()
    })

    const { error, value } = updateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      })
    }

    // Construir query dinamicamente
    const fields = []
    const values = []
    let paramCount = 1

    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`)
        values.push(value[key])
        paramCount++
      }
    })

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      })
    }

    fields.push(`updated_at = NOW()`)
    values.push(req.user.id)

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, uuid, name, email, phone, birth_date, gender, 
                address, city, state, zip_code, role, email_verified, updated_at
    `

    const result = await pool.query(query, values)

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      })
    }

    const { currentPassword, newPassword } = value

    // Buscar senha atual
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      })
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      })
    }

    // Hash da nova senha
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Atualizar senha
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.user.id]
    )

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
