import express from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import pool from '../config/database.js'

const router = express.Router()

// Apply admin middleware to all routes
router.use(authenticateToken)
router.use(requireAdmin)

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    // Get user count
    const userCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE is_active = true'
    )

    // Get professional count
    const professionalCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM professionals WHERE is_active = true'
    )

    // Get today's appointments
    const todayAppointmentsResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM appointments 
       WHERE DATE(appointment_date) = CURRENT_DATE 
       AND status NOT IN ('cancelled', 'no_show')`
    )

    // Get total appointments this month
    const monthlyAppointmentsResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM appointments 
       WHERE DATE_TRUNC('month', appointment_date) = DATE_TRUNC('month', CURRENT_DATE)`
    )

    // Get recent users (last 7 days)
    const recentUsersResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM users 
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
    )

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(userCountResult.rows[0].count),
        totalProfessionals: parseInt(professionalCountResult.rows[0].count),
        todayAppointments: parseInt(todayAppointmentsResult.rows[0].count),
        monthlyAppointments: parseInt(monthlyAppointmentsResult.rows[0].count),
        recentUsers: parseInt(recentUsersResult.rows[0].count)
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT id, uuid, name, email, phone, created_at, is_active, email_verified
      FROM users
      WHERE 1=1
    `
    
    const queryParams = []
    let paramCount = 1

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`
      queryParams.push(`%${search}%`)
      paramCount++
    }

    if (status === 'active') {
      query += ` AND is_active = true`
    } else if (status === 'inactive') {
      query += ` AND is_active = false`
    }

    query += ` ORDER BY created_at DESC`
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    queryParams.push(limit, offset)

    const result = await pool.query(query, queryParams)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`
    const countParams = []
    let countParamCount = 1

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`
      countParams.push(`%${search}%`)
      countParamCount++
    }

    if (status === 'active') {
      countQuery += ` AND is_active = true`
    } else if (status === 'inactive') {
      countQuery += ` AND is_active = false`
    }

    const countResult = await pool.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].total)

    res.json({
      success: true,
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/professionals
router.get('/professionals', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, specialty, status } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT p.id, p.uuid, p.name, p.email, p.specialty, p.crm, 
             p.city, p.state, p.is_active, p.is_verified, p.created_at,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM professionals p
      LEFT JOIN reviews r ON p.id = r.professional_id
      WHERE 1=1
    `
    
    const queryParams = []
    let paramCount = 1

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.email ILIKE $${paramCount})`
      queryParams.push(`%${search}%`)
      paramCount++
    }

    if (specialty) {
      query += ` AND p.specialty ILIKE $${paramCount}`
      queryParams.push(`%${specialty}%`)
      paramCount++
    }

    if (status === 'active') {
      query += ` AND p.is_active = true`
    } else if (status === 'inactive') {
      query += ` AND p.is_active = false`
    } else if (status === 'verified') {
      query += ` AND p.is_verified = true`
    } else if (status === 'unverified') {
      query += ` AND p.is_verified = false`
    }

    query += ` GROUP BY p.id, p.uuid, p.name, p.email, p.specialty, p.crm, 
                      p.city, p.state, p.is_active, p.is_verified, p.created_at`
    query += ` ORDER BY p.created_at DESC`
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    queryParams.push(limit, offset)

    const result = await pool.query(query, queryParams)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM professionals WHERE 1=1`
    const countParams = []
    let countParamCount = 1

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`
      countParams.push(`%${search}%`)
      countParamCount++
    }

    if (specialty) {
      countQuery += ` AND specialty ILIKE $${countParamCount}`
      countParams.push(`%${specialty}%`)
      countParamCount++
    }

    if (status === 'active') {
      countQuery += ` AND is_active = true`
    } else if (status === 'inactive') {
      countQuery += ` AND is_active = false`
    } else if (status === 'verified') {
      countQuery += ` AND is_verified = true`
    } else if (status === 'unverified') {
      countQuery += ` AND is_verified = false`
    }

    const countResult = await pool.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].total)

    res.json({
      success: true,
      professionals: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/admin/professionals/:id/verify
router.put('/professionals/:id/verify', async (req, res, next) => {
  try {
    const { id } = req.params
    const { is_verified } = req.body

    const result = await pool.query(
      'UPDATE professionals SET is_verified = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_verified',
      [is_verified, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      })
    }

    res.json({
      success: true,
      message: `Profissional ${is_verified ? 'verificado' : 'desverificado'} com sucesso`,
      professional: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params
    const { is_active } = req.body

    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, is_active',
      [is_active, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      })
    }

    res.json({
      success: true,
      message: `Usuário ${is_active ? 'ativado' : 'desativado'} com sucesso`,
      user: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
})

export default router
