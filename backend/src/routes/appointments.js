const express = require('express')
const { authenticateToken } = require('../middleware/auth.js')
const pool = require('../config/database.js')

const router = express.Router()

// GET /api/appointments
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT a.id, a.uuid, a.appointment_date, a.duration, a.status, 
             a.type, a.notes, a.symptoms, a.diagnosis, a.prescription,
             a.follow_up_date, a.price, a.payment_status, a.created_at,
             p.name as professional_name, p.specialty, p.phone as professional_phone,
             p.address as professional_address, p.city, p.state
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      WHERE a.user_id = $1
    `
    
    const queryParams = [req.user.id]
    let paramCount = 2

    if (status) {
      query += ` AND a.status = $${paramCount}`
      queryParams.push(status)
      paramCount++
    }

    query += ` ORDER BY a.appointment_date DESC`
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    queryParams.push(limit, offset)

    const result = await pool.query(query, queryParams)

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM appointments a
      WHERE a.user_id = $1
    `
    const countParams = [req.user.id]
    let countParamCount = 2

    if (status) {
      countQuery += ` AND a.status = $${countParamCount}`
      countParams.push(status)
      countParamCount++
    }

    const countResult = await pool.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].total)

    res.json({
      success: true,
      appointments: result.rows,
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

// GET /api/appointments/history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.uuid, a.appointment_date, a.duration, a.status, 
              a.type, a.notes, a.symptoms, a.diagnosis, a.prescription,
              a.follow_up_date, a.price, a.payment_status, a.created_at,
              p.name as professional_name, p.specialty, p.phone as professional_phone,
              p.address as professional_address, p.city, p.state,
              array_agg(
                json_build_object(
                  'id', r.id,
                  'title', r.title,
                  'description', r.description,
                  'file_path', r.file_path,
                  'created_at', r.created_at
                )
              ) as results
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      LEFT JOIN results r ON a.id = r.appointment_id
      WHERE a.user_id = $1 AND a.status = 'completed'
      GROUP BY a.id, a.uuid, a.appointment_date, a.duration, a.status, 
               a.type, a.notes, a.symptoms, a.diagnosis, a.prescription,
               a.follow_up_date, a.price, a.payment_status, a.created_at,
               p.name, p.specialty, p.phone, p.address, p.city, p.state
      ORDER BY a.appointment_date DESC`,
      [req.user.id]
    )

    res.json({
      success: true,
      appointments: result.rows
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/appointments/:id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT a.*, 
              p.name as professional_name, p.specialty, p.phone as professional_phone,
              p.address as professional_address, p.city, p.state, p.bio,
              array_agg(
                json_build_object(
                  'id', r.id,
                  'title', r.title,
                  'description', r.description,
                  'file_path', r.file_path,
                  'created_at', r.created_at
                )
              ) as results
      FROM appointments a
      JOIN professionals p ON a.professional_id = p.id
      LEFT JOIN results r ON a.id = r.appointment_id
      WHERE a.id = $1 AND a.user_id = $2
      GROUP BY a.id, a.uuid, a.appointment_date, a.duration, a.status, 
               a.type, a.notes, a.symptoms, a.diagnosis, a.prescription,
               a.follow_up_date, a.price, a.payment_status, a.created_at,
               p.name, p.specialty, p.phone, p.address, p.city, p.state, p.bio`,
      [id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consulta não encontrada'
      })
    }

    res.json({
      success: true,
      appointment: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/appointments
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    console.log('📅 POST /appointments - Dados recebidos:', req.body)
    console.log('👤 Usuário autenticado:', req.user)
    
    const { professional_id, appointment_date, type = 'presential', notes } = req.body

    console.log('🔍 Validação dos campos:')
    console.log('  - professional_id:', professional_id, typeof professional_id)
    console.log('  - appointment_date:', appointment_date, typeof appointment_date)
    console.log('  - type:', type, typeof type)
    console.log('  - notes:', notes, typeof notes)

    if (!professional_id || !appointment_date) {
      console.log('❌ Validação falhou: campos obrigatórios ausentes')
      return res.status(400).json({
        success: false,
        message: 'Profissional e data são obrigatórios'
      })
    }

    // Validar se professional_id é um número válido
    const professionalIdNum = parseInt(professional_id)
    if (isNaN(professionalIdNum) || professionalIdNum <= 0) {
      console.log('❌ Validação falhou: professional_id inválido')
      return res.status(400).json({
        success: false,
        message: 'ID do profissional inválido'
      })
    }

    // Validar se appointment_date é uma data válida
    const appointmentDate = new Date(appointment_date)
    if (isNaN(appointmentDate.getTime())) {
      console.log('❌ Validação falhou: appointment_date inválido')
      return res.status(400).json({
        success: false,
        message: 'Data do agendamento inválida'
      })
    }

    // Verify professional exists and is active
    console.log('🔍 Verificando profissional com ID:', professionalIdNum)
    const professionalResult = await pool.query(
      'SELECT id, consultation_price FROM professionals WHERE id = $1 AND is_active = true',
      [professionalIdNum]
    )

    console.log('👨‍⚕️ Resultado da busca do profissional:', professionalResult.rows)

    if (professionalResult.rows.length === 0) {
      console.log('❌ Profissional não encontrado ou inativo')
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      })
    }

    const professional = professionalResult.rows[0]

    // Check if appointment time is available
    console.log('🔍 Verificando disponibilidade do horário:')
    console.log('  - professional_id:', professionalIdNum)
    console.log('  - appointment_date:', appointment_date)
    
    const existingAppointment = await pool.query(
      `SELECT id FROM appointments 
       WHERE professional_id = $1 
       AND appointment_date = $2 
       AND status NOT IN ('cancelled', 'no_show')`,
      [professionalIdNum, appointment_date]
    )

    console.log('📅 Agendamentos existentes no horário:', existingAppointment.rows)

    if (existingAppointment.rows.length > 0) {
      console.log('❌ Horário não disponível')
      return res.status(409).json({
        success: false,
        message: 'Horário não disponível'
      })
    }

    // Create appointment
    console.log('📝 Criando agendamento com os seguintes dados:')
    console.log('  - user_id:', req.user.id)
    console.log('  - professional_id:', professionalIdNum)
    console.log('  - appointment_date:', appointment_date)
    console.log('  - type:', type)
    console.log('  - notes:', notes)
    console.log('  - price:', professional.consultation_price)
    
    const result = await pool.query(
      `INSERT INTO appointments (user_id, professional_id, appointment_date, type, notes, price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, uuid, appointment_date, status, type, price, created_at`,
      [
        req.user.id,
        professionalIdNum,
        appointment_date,
        type,
        notes,
        professional.consultation_price
      ]
    )

    console.log('✅ Agendamento criado com sucesso:', result.rows[0])

    res.status(201).json({
      success: true,
      message: 'Consulta agendada com sucesso',
      appointment: result.rows[0]
    })
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error)
    console.error('❌ Stack trace:', error.stack)
    next(error)
  }
})

// PUT /api/appointments/:id
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params
    const { appointment_date, notes, symptoms } = req.body

    // Check if appointment belongs to user
    const existingAppointment = await pool.query(
      'SELECT id, status FROM appointments WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )

    if (existingAppointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consulta não encontrada'
      })
    }

    const appointment = existingAppointment.rows[0]

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível editar uma consulta já realizada'
      })
    }

    const result = await pool.query(
      `UPDATE appointments 
       SET appointment_date = COALESCE($1, appointment_date),
           notes = COALESCE($2, notes),
           symptoms = COALESCE($3, symptoms),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING id, uuid, appointment_date, status, type, notes, symptoms, updated_at`,
      [appointment_date, notes, symptoms, id, req.user.id]
    )

    res.json({
      success: true,
      message: 'Consulta atualizada com sucesso',
      appointment: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/appointments/:id
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if appointment belongs to user
    const existingAppointment = await pool.query(
      'SELECT id, status, appointment_date FROM appointments WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )

    if (existingAppointment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consulta não encontrada'
      })
    }

    const appointment = existingAppointment.rows[0]

    // Check if appointment can be cancelled (not completed and not in the past)
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar uma consulta já realizada'
      })
    }

    const appointmentDate = new Date(appointment.appointment_date)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60)

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar uma consulta com menos de 24 horas de antecedência'
      })
    }

    await pool.query(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2',
      ['cancelled', id]
    )

    res.json({
      success: true,
      message: 'Consulta cancelada com sucesso'
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
