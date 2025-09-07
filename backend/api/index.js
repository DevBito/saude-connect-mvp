// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Saúde Connect API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// API routes placeholder
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Auth routes placeholder
app.post('/api/auth/register', (req, res) => {
  res.json({
    message: 'Endpoint de registro funcionando!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    message: 'Endpoint de login funcionando!',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;