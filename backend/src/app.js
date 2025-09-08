const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const dotenv = require('dotenv')

// Import routes
const authRoutes = require('./routes/auth.js')
const userRoutes = require('./routes/users.js')
const professionalRoutes = require('./routes/professionals.js')
const appointmentRoutes = require('./routes/appointments.js')
const adminRoutes = require('./routes/admin.js')

// Import middleware
const { errorHandler } = require('./middleware/errorHandler.js')
const { notFound } = require('./middleware/notFound.js')

// Load environment variables
dotenv.config()

// Log environment variables (for debugging)
console.log('🔧 Environment Variables:')
console.log('  - NODE_ENV:', process.env.NODE_ENV)
console.log('  - PORT:', process.env.PORT)
console.log('  - SAUDE_SUPABASE_JWT_SECRET:', process.env.SAUDE_SUPABASE_JWT_SECRET ? 'Configurado' : 'NÃO CONFIGURADO')
console.log('  - SAUDE_POSTGRES_URL_NON_POOLING:', process.env.SAUDE_POSTGRES_URL_NON_POOLING ? 'Configurado' : 'NÃO CONFIGURADO')
console.log('  - FRONTEND_URL:', process.env.FRONTEND_URL)

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
})
app.use('/api/', limiter)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/professionals', professionalRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/admin', adminRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Saúde Connect API',
    version: '1.0.0',
    documentation: '/api/docs'
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`)
    console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 URL: http://localhost:${PORT}`)
  })
}

module.exports = app
