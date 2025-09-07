import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../config/database.js'

const router = express.Router()

// GET /api/users/profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, uuid, name, email, phone, birth_date, gender, 
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

    res.json({
      success: true,
      user: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/users/profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { name, phone, birth_date, gender, address, city, state, zip_code } = req.body

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           birth_date = COALESCE($3, birth_date),
           gender = COALESCE($4, gender),
           address = COALESCE($5, address),
           city = COALESCE($6, city),
           state = COALESCE($7, state),
           zip_code = COALESCE($8, zip_code),
           updated_at = NOW()
       WHERE id = $9
       RETURNING id, uuid, name, email, phone, birth_date, gender, 
                 address, city, state, zip_code, role, email_verified, updated_at`,
      [name, phone, birth_date, gender, address, city, state, zip_code, req.user.id]
    )

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
})

export default router
