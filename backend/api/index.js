// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});
app.use('/api/', limiter);

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

// Auth routes with real authentication
app.get('/api/auth/register', (req, res) => {
  res.json({
    message: 'Endpoint de registro funcionando! (GET)',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Simular criação de usuário (sem banco de dados por enquanto)
    const user = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Gerar JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.get('/api/auth/login', (req, res) => {
  res.json({
    message: 'Endpoint de login funcionando! (GET)',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Simular busca de usuário (sem banco de dados por enquanto)
    // Em produção, isso viria do banco de dados
    const mockUser = {
      id: 1,
      name: 'Usuário Teste',
      email: 'teste@exemplo.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      createdAt: new Date().toISOString()
    };

    // Verificar se o email existe (simulação)
    if (email !== mockUser.email) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, mockUser.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar JWT token
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          createdAt: mockUser.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = app;