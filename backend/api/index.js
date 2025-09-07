// Vercel serverless function entry point
const express = require('express');

const app = express();

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

module.exports = app;