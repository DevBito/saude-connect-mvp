const express = require('express')
const pool = require('../config/database.js')

const router = express.Router()

// GET /api/professionals
router.get('/', async (req, res, next) => {
  try {
    const { 
      specialty, 
      location, 
      availability, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query

    let query = `
      SELECT p.id, p.uuid, p.name, p.specialty, p.sub_specialty, 
             p.consultation_price, p.city, p.state, p.bio, 
             p.experience_years, p.accepts_online, p.accepts_insurance,
             p.is_active, p.is_verified,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.id) as review_count
      FROM professionals p
      LEFT JOIN reviews r ON p.id = r.professional_id
      WHERE p.is_active = true
    `
    
    const queryParams = []
    let paramCount = 1

    if (specialty) {
      query += ` AND p.specialty ILIKE $${paramCount}`
      queryParams.push(`%${specialty}%`)
      paramCount++
    }

    if (location) {
      query += ` AND (p.city ILIKE $${paramCount} OR p.state ILIKE $${paramCount})`
      queryParams.push(`%${location}%`)
      paramCount++
    }

    if (search) {
      query += ` AND p.name ILIKE $${paramCount}`
      queryParams.push(`%${search}%`)
      paramCount++
    }

    query += ` GROUP BY p.id, p.uuid, p.name, p.specialty, p.sub_specialty, 
                      p.consultation_price, p.city, p.state, p.bio, 
                      p.experience_years, p.accepts_online, p.accepts_insurance,
                      p.is_active, p.is_verified`

    // Pagination
    const offset = (page - 1) * limit
    query += ` ORDER BY p.is_verified DESC, rating DESC, p.name ASC`
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    queryParams.push(limit, offset)

    const result = await pool.query(query, queryParams)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM professionals p
      WHERE p.is_active = true
    `
    const countParams = []
    let countParamCount = 1

    if (specialty) {
      countQuery += ` AND p.specialty ILIKE $${countParamCount}`
      countParams.push(`%${specialty}%`)
      countParamCount++
    }

    if (location) {
      countQuery += ` AND (p.city ILIKE $${countParamCount} OR p.state ILIKE $${countParamCount})`
      countParams.push(`%${location}%`)
      countParamCount++
    }

    if (search) {
      countQuery += ` AND p.name ILIKE $${countParamCount}`
      countParams.push(`%${search}%`)
      countParamCount++
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

// GET /api/professionals/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT p.*, 
              COALESCE(AVG(r.rating), 0) as rating,
              COUNT(r.id) as review_count
       FROM professionals p
       LEFT JOIN reviews r ON p.id = r.professional_id
       WHERE p.id = $1 AND p.is_active = true
       GROUP BY p.id`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      })
    }

    res.json({
      success: true,
      professional: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/professionals/:id/availability
router.get('/:id/availability', async (req, res, next) => {
  try {
    const { id } = req.params
    const { date } = req.query

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Data é obrigatória'
      })
    }

    // Get professional schedule
    const scheduleResult = await pool.query(
      `SELECT day_of_week, start_time, end_time
       FROM professional_schedules
       WHERE professional_id = $1 AND is_available = true`,
      [id]
    )

    // Get existing appointments for the date
    const appointmentsResult = await pool.query(
      `SELECT appointment_date
       FROM appointments
       WHERE professional_id = $1 
       AND DATE(appointment_date) = $2
       AND status NOT IN ('cancelled', 'no_show')`,
      [id, date]
    )

    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay()
    
    const daySchedule = scheduleResult.rows.find(s => s.day_of_week === dayOfWeek)
    
    if (!daySchedule) {
      return res.json({
        success: true,
        available: false,
        message: 'Profissional não atende neste dia'
      })
    }

    // Generate available time slots
    const availableSlots = []
    const startTime = new Date(`${date}T${daySchedule.start_time}`)
    const endTime = new Date(`${date}T${daySchedule.end_time}`)
    
    const existingAppointments = appointmentsResult.rows.map(apt => 
      new Date(apt.appointment_date).getTime()
    )

    let currentTime = new Date(startTime)
    while (currentTime < endTime) {
      const timeSlot = new Date(currentTime)
      if (!existingAppointments.includes(timeSlot.getTime())) {
        availableSlots.push(timeSlot.toISOString())
      }
      currentTime.setMinutes(currentTime.getMinutes() + 30) // 30-minute slots
    }

    res.json({
      success: true,
      available: availableSlots.length > 0,
      timeSlots: availableSlots
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/professionals/:id/reviews
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 10 } = req.query

    const offset = (page - 1) * limit

    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.is_anonymous, r.created_at,
              u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.professional_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    )

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM reviews WHERE professional_id = $1',
      [id]
    )

    const total = parseInt(countResult.rows[0].total)

    res.json({
      success: true,
      reviews: result.rows,
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

module.exports = router
