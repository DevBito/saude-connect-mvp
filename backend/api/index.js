// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const Joi = require('joi');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Database connection
const getDatabaseUrl = () => {
  // Usar SAUDE_POSTGRES_URL como principal
  if (process.env.SAUDE_POSTGRES_URL) {
    console.log('✅ Usando SAUDE_POSTGRES_URL');
    return process.env.SAUDE_POSTGRES_URL;
  }
  
  // Construir URL a partir das variáveis individuais como fallback
  const user = process.env.SAUDE_POSTGRES_USER;
  const password = process.env.SAUDE_POSTGRES_PASSWORD;
  const host = process.env.SAUDE_POSTGRES_HOST;
  const database = process.env.SAUDE_POSTGRES_DATABASE;
  
  if (user && password && host && database) {
    const constructedUrl = `postgresql://${user}:${password}@${host}:5432/${database}?sslmode=require`;
    console.log('✅ Construindo URL a partir de variáveis individuais');
    return constructedUrl;
  }
  
  console.log('❌ Nenhuma variável de banco encontrada');
  return null;
};

// JWT Secret
const getJwtSecret = () => {
  return process.env.SAUDE_SUPABASE_JWT_SECRET || 
         'fallback-secret-key';
};

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined,
    secureProtocol: 'TLSv1_2_method'
  }
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão PostgreSQL:', err);
});

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

// Validation schemas
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
  cpf: Joi.string().optional()
});

const professionalSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  specialty: Joi.string().required(),
  crm: Joi.string().required(),
  phone: Joi.string().optional()
});

const appointmentSchema = Joi.object({
  patient_id: Joi.number().integer().required(),
  professional_id: Joi.number().integer().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  notes: Joi.string().optional()
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acesso requerido' });
  }

  jwt.verify(token, getJwtSecret(), (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint para verificar conexão com banco
app.get('/debug', async (req, res) => {
  try {
    // Testar conexão com banco
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    
    res.json({
      success: true,
      message: 'Conexão com banco funcionando!',
      database: {
        connected: true,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].postgres_version
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        SAUDE_POSTGRES_URL: getDatabaseUrl() ? 'Configurado' : 'Não configurado',
        SAUDE_SUPABASE_JWT_SECRET: process.env.SAUDE_SUPABASE_JWT_SECRET ? 'Configurado' : 'Não configurado'
      }
    });
  } catch (error) {
    console.error('Erro na conexão com banco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na conexão com banco',
      error: error.message,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        SAUDE_POSTGRES_URL: getDatabaseUrl() ? 'Configurado' : 'Não configurado',
        SAUDE_SUPABASE_JWT_SECRET: process.env.SAUDE_SUPABASE_JWT_SECRET ? 'Configurado' : 'Não configurado'
      }
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Saúde Connect API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Saúde Connect API',
    version: '1.0.0',
    status: 'OK',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      vars: '/api/vars',
      dbTest: '/api/db-test',
      sslTest: '/api/ssl-test',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// API root endpoint with trailing slash
app.get('/api/', (req, res) => {
  res.json({
    message: 'Saúde Connect API',
    version: '1.0.0',
    status: 'OK',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      vars: '/api/vars',
      dbTest: '/api/db-test',
      sslTest: '/api/ssl-test',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// API routes placeholder
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Teste simples de variáveis
app.get('/api/vars', (req, res) => {
  res.json({
    message: 'Variáveis de ambiente',
    vars: {
      NODE_ENV: process.env.NODE_ENV,
      SAUDE_POSTGRES_URL: process.env.SAUDE_POSTGRES_URL ? 'Configurado' : 'Não configurado',
      SAUDE_POSTGRES_PRISMA_URL: process.env.SAUDE_POSTGRES_PRISMA_URL ? 'Configurado' : 'Não configurado',
      SAUDE_SUPABASE_URL: process.env.SAUDE_SUPABASE_URL ? 'Configurado' : 'Não configurado',
      SAUDE_NEXT_PUBLIC_SUPABASE_URL: process.env.SAUDE_NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'Não configurado',
      SAUDE_POSTGRES_URL_NON_POOLING: process.env.SAUDE_POSTGRES_URL_NON_POOLING ? 'Configurado' : 'Não configurado',
      SAUDE_SUPABASE_JWT_SECRET: process.env.SAUDE_SUPABASE_JWT_SECRET ? 'Configurado' : 'Não configurado',
      SAUDE_POSTGRES_USER: process.env.SAUDE_POSTGRES_USER ? 'Configurado' : 'Não configurado',
      SAUDE_NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SAUDE_NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado',
      SAUDE_POSTGRES_PASSWORD: process.env.SAUDE_POSTGRES_PASSWORD ? 'Configurado' : 'Não configurado',
      SAUDE_POSTGRES_DATABASE: process.env.SAUDE_POSTGRES_DATABASE ? 'Configurado' : 'Não configurado',
      SAUDE_SUPABASE_SERVICE_ROLE_KEY: process.env.SAUDE_SUPABASE_SERVICE_ROLE_KEY ? 'Configurado' : 'Não configurado',
      SAUDE_POSTGRES_HOST: process.env.SAUDE_POSTGRES_HOST ? 'Configurado' : 'Não configurado',
      FRONTEND_URL: process.env.FRONTEND_URL ? 'Configurado' : 'Não configurado'
    },
    databaseUrl: getDatabaseUrl() ? 'URL construída com sucesso' : 'Falha ao construir URL',
    jwtSecret: getJwtSecret() !== 'fallback-secret-key' ? 'Configurado' : 'Não configurado'
  });
});

// Teste de conexão com banco
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('Testando conexão com banco...');
    console.log('Database URL:', getDatabaseUrl() ? 'Configurado' : 'Não configurado');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    
    res.json({
      success: true,
      message: 'Conexão com banco funcionando!',
      database: {
        connected: true,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].postgres_version
      },
      config: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: getDatabaseUrl() ? 'Configurado' : 'Não configurado',
        sslConfig: process.env.NODE_ENV === 'production' ? 'SSL habilitado' : 'SSL desabilitado'
      }
    });
  } catch (error) {
    console.error('Erro na conexão com banco:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na conexão com banco',
      error: error.message,
      stack: error.stack,
      config: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: getDatabaseUrl() ? 'Configurado' : 'Não configurado',
        sslConfig: process.env.NODE_ENV === 'production' ? 'SSL habilitado' : 'SSL desabilitado'
      }
    });
  }
});

// Teste de conexão SSL específico
app.get('/api/ssl-test', async (req, res) => {
  const { Pool } = require('pg');
  const results = [];
  
  // Teste 1: SSL desabilitado
  try {
    console.log('Testando SSL desabilitado...');
    const testPool1 = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: false
    });
    
    const result1 = await testPool1.query('SELECT NOW() as current_time');
    await testPool1.end();
    
    results.push({
      test: 'SSL desabilitado',
      success: true,
      currentTime: result1.rows[0].current_time
    });
  } catch (error) {
    results.push({
      test: 'SSL desabilitado',
      success: false,
      error: error.message
    });
  }
  
  // Teste 2: SSL com configuração permissiva
  try {
    console.log('Testando SSL permissivo...');
    const testPool2 = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
      }
    });
    
    const result2 = await testPool2.query('SELECT NOW() as current_time');
    await testPool2.end();
    
    results.push({
      test: 'SSL permissivo',
      success: true,
      currentTime: result2.rows[0].current_time
    });
  } catch (error) {
    results.push({
      test: 'SSL permissivo',
      success: false,
      error: error.message
    });
  }
  
  // Teste 3: SSL com configuração mais permissiva
  try {
    console.log('Testando SSL muito permissivo...');
    const testPool3 = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
        secureProtocol: 'TLSv1_2_method'
      }
    });
    
    const result3 = await testPool3.query('SELECT NOW() as current_time');
    await testPool3.end();
    
    results.push({
      test: 'SSL muito permissivo',
      success: true,
      currentTime: result3.rows[0].current_time
    });
  } catch (error) {
    results.push({
      test: 'SSL muito permissivo',
      success: false,
      error: error.message
    });
  }
  
  res.json({
    message: 'Testes de conexão SSL',
    results: results,
    recommendation: results.find(r => r.success) ? 
      `Use: ${results.find(r => r.success).test}` : 
      'Nenhuma configuração SSL funcionou'
  });
});

// Teste de tabelas
app.get('/api/tables-test', async (req, res) => {
  try {
    console.log('Testando tabelas...');
    
    // Verificar se tabelas existem
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    // Tentar inserir um usuário de teste
    const testUser = await pool.query(`
      INSERT INTO users (name, email, password, created_at) 
      VALUES ($1, $2, $3, NOW()) 
      RETURNING id, name, email, created_at
    `, ['Teste', 'teste@exemplo.com', 'senha123']);
    
    res.json({
      success: true,
      message: 'Tabelas funcionando!',
      tables: tablesResult.rows.map(row => row.table_name),
      testInsert: testUser.rows[0]
    });
  } catch (error) {
    console.error('Erro nas tabelas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro nas tabelas',
      error: error.message,
      stack: error.stack
    });
  }
});

// ===== AUTH ROUTES =====

app.get('/api/auth/register', (req, res) => {
  res.json({
    message: 'Endpoint de registro funcionando! (GET)',
    timestamp: new Date().toISOString(),
    method: 'GET'
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    // Validação com Joi
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { name, email, password, phone, cpf } = value;

    // Verificar se email já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário no banco
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, cpf, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, name, email, phone, cpf, created_at',
      [name, email, hashedPassword, phone, cpf]
    );

    const user = result.rows[0];

    // Gerar JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret(),
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
          phone: user.phone,
          cpf: user.cpf,
          createdAt: user.created_at
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

    // Buscar usuário no banco
    const result = await pool.query(
      'SELECT id, name, email, password, phone, cpf, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpf,
          createdAt: user.created_at
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

// ===== USER ROUTES =====

// Buscar perfil do usuário logado
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, cpf, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar perfil do usuário
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, cpf } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, cpf = $3, updated_at = NOW() WHERE id = $4 RETURNING id, name, email, phone, cpf, created_at, updated_at',
      [name, phone, cpf, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ===== PROFESSIONAL ROUTES =====

// Registrar profissional
app.post('/api/professionals/register', async (req, res) => {
  try {
    // Validação com Joi
    const { error, value } = professionalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { name, email, password, specialty, crm, phone } = value;

    // Verificar se email já existe
    const existingProfessional = await pool.query(
      'SELECT id FROM professionals WHERE email = $1',
      [email]
    );

    if (existingProfessional.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar profissional no banco
    const result = await pool.query(
      'INSERT INTO professionals (name, email, password, specialty, crm, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, name, email, specialty, crm, phone, created_at',
      [name, email, hashedPassword, specialty, crm, phone]
    );

    const professional = result.rows[0];

    // Gerar JWT token
    const token = jwt.sign(
      { professionalId: professional.id, email: professional.email },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Profissional registrado com sucesso!',
      data: {
        professional: {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          specialty: professional.specialty,
          crm: professional.crm,
          phone: professional.phone,
          createdAt: professional.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro do profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Login do profissional
app.post('/api/professionals/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar profissional no banco
    const result = await pool.query(
      'SELECT id, name, email, password, specialty, crm, phone, created_at FROM professionals WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const professional = result.rows[0];

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, professional.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar JWT token
    const token = jwt.sign(
      { professionalId: professional.id, email: professional.email },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        professional: {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          specialty: professional.specialty,
          crm: professional.crm,
          phone: professional.phone,
          createdAt: professional.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Erro no login do profissional:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar profissionais
app.get('/api/professionals', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, specialty, crm, phone, created_at FROM professionals ORDER BY name'
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ===== APPOINTMENT ROUTES =====

// Criar consulta
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    // Validação com Joi
    const { error, value } = appointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { patient_id, professional_id, date, time, notes } = value;

    // Verificar se o profissional existe
    const professional = await pool.query(
      'SELECT id FROM professionals WHERE id = $1',
      [professional_id]
    );

    if (professional.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profissional não encontrado'
      });
    }

    // Criar consulta
    const result = await pool.query(
      'INSERT INTO appointments (patient_id, professional_id, date, time, notes, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [patient_id, professional_id, date, time, notes, 'scheduled']
    );

    res.status(201).json({
      success: true,
      message: 'Consulta agendada com sucesso!',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar consultas do usuário
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.name as professional_name, p.specialty 
       FROM appointments a 
       JOIN professionals p ON a.professional_id = p.id 
       WHERE a.patient_id = $1 
       ORDER BY a.date, a.time`,
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ===== ADMIN ROUTES =====

// Listar todos os usuários (admin)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Verificar se é admin (implementar lógica de admin)
    const result = await pool.query(
      'SELECT id, name, email, phone, cpf, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar todas as consultas (admin)
app.get('/api/admin/appointments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as patient_name, p.name as professional_name, p.specialty 
       FROM appointments a 
       JOIN users u ON a.patient_id = u.id 
       JOIN professionals p ON a.professional_id = p.id 
       ORDER BY a.date, a.time`
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro ao listar consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = app;