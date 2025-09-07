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
  // USAR APENAS SAUDE_POSTGRES_URL_NON_POOLING (FUNCIONOU!)
  if (!process.env.SAUDE_POSTGRES_URL_NON_POOLING) {
    console.log('❌ SAUDE_POSTGRES_URL_NON_POOLING não configurada');
    return null;
  }
  
  let databaseUrl = process.env.SAUDE_POSTGRES_URL_NON_POOLING;
  console.log('✅ Usando SAUDE_POSTGRES_URL_NON_POOLING (FUNCIONOU!)');
  console.log('URL original:', databaseUrl);
  
  // FORÇAR SSL DESABILITADO NA URL
  console.log('🔧 FORÇANDO SSL DESABILITADO NA URL...');
  
  // Remover TODOS os parâmetros SSL existentes
  databaseUrl = databaseUrl.replace(/[?&]sslmode=[^&]*/g, '');
  databaseUrl = databaseUrl.replace(/[?&]ssl=[^&]*/g, '');
  databaseUrl = databaseUrl.replace(/[?&]sslcert=[^&]*/g, '');
  databaseUrl = databaseUrl.replace(/[?&]sslkey=[^&]*/g, '');
  databaseUrl = databaseUrl.replace(/[?&]sslrootcert=[^&]*/g, '');
  
  // Adicionar sslmode=disable FORÇADAMENTE
  if (databaseUrl.includes('?')) {
    databaseUrl += '&sslmode=disable';
  } else {
    databaseUrl += '?sslmode=disable';
  }
  
  console.log('✅ URL FINAL COM SSL FORÇADAMENTE DESABILITADO:', databaseUrl);
  return databaseUrl;
};

// JWT Secret
const getJwtSecret = () => {
  return process.env.SAUDE_SUPABASE_JWT_SECRET || 
         'fallback-secret-key';
};

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: false,
  max: 5, // REDUZIDO: Máximo 5 conexões simultâneas
  min: 1, // Mínimo 1 conexão
  idleTimeoutMillis: 10000, // REDUZIDO: 10 segundos
  connectionTimeoutMillis: 5000, // AUMENTADO: 5 segundos
  acquireTimeoutMillis: 10000, // Timeout para adquirir conexão
  allowExitOnIdle: true, // Permitir saída quando idle
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
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://saude-connect-mvp.vercel.app',
    'https://saude-connect-mvp.vercel.app/',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
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
  console.log('🔐 Middleware de autenticação - Iniciando...');
  console.log('📋 Headers recebidos:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('🔑 Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🎫 Token extraído:', token ? 'Token presente' : 'Token ausente');

  if (!token) {
    console.log('❌ Token não encontrado - retornando 401');
    return res.status(401).json({ success: false, message: 'Token de acesso requerido' });
  }

  console.log('🔍 Verificando token com JWT secret...');
  jwt.verify(token, getJwtSecret(), (err, user) => {
    if (err) {
      console.log('❌ Erro na verificação do token:', err.message);
      return res.status(403).json({ success: false, message: 'Token inválido', error: err.message });
    }
    console.log('✅ Token válido - usuário:', user);
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

// Pool status endpoint
app.get('/api/pool-status', (req, res) => {
  res.json({
    message: 'Status do pool de conexões',
    pool: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
      max: pool.options.max,
      min: pool.options.min,
      idleTimeoutMillis: pool.options.idleTimeoutMillis,
      connectionTimeoutMillis: pool.options.connectionTimeoutMillis
    },
    timestamp: new Date().toISOString()
  });
});

// Test authentication endpoint
app.get('/api/test-auth', authenticateToken, (req, res) => {
  res.json({
    message: 'Autenticação funcionando!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Test appointments endpoint
app.get('/api/test-appointments', authenticateToken, async (req, res) => {
  try {
    console.log('🧪 Teste de appointments - userId:', req.user.userId);
    
    // Verificar se o usuário existe
    const userResult = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.userId]);
    console.log('👤 Usuário encontrado:', userResult.rows[0]);
    
    // Verificar appointments
    const appointmentsResult = await pool.query('SELECT COUNT(*) as total FROM appointments WHERE patient_id = $1', [req.user.userId]);
    console.log('📅 Total de appointments:', appointmentsResult.rows[0].total);
    
    res.json({
      success: true,
      message: 'Teste de appointments funcionando',
      user: userResult.rows[0],
      appointmentsCount: appointmentsResult.rows[0].total,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro no teste de appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no teste',
      error: error.message
    });
  }
});

// Endpoint simples para testar autenticação
app.get('/api/simple-test', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Autenticação simples funcionando',
    userId: req.user.userId,
    timestamp: new Date().toISOString()
  });
});

// Endpoint temporário com dados mockados
app.get('/api/appointments-mock', authenticateToken, (req, res) => {
  console.log('🎭 Retornando dados mockados para userId:', req.user.userId);
  
  const mockAppointments = [
    {
      id: 1,
      patient_id: req.user.userId,
      professional_id: 1,
      professional_name: 'Dr. João Silva',
      specialty: 'Cardiologia',
      date: '2024-01-15',
      time: '14:00:00',
      notes: 'Consulta de rotina',
      status: 'scheduled',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      patient_id: req.user.userId,
      professional_id: 2,
      professional_name: 'Dra. Maria Santos',
      specialty: 'Dermatologia',
      date: '2024-01-20',
      time: '10:30:00',
      notes: 'Exame de pele',
      status: 'confirmed',
      created_at: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: mockAppointments
  });
});

// Endpoint para inserir dados de teste
app.post('/api/seed-professionals', async (req, res) => {
  try {
    console.log('🌱 Inserindo dados de teste para profissionais...');
    
    const testProfessionals = [
      {
        name: 'Dr. João Silva',
        email: 'joao.silva@exemplo.com',
        password: '$2b$10$example', // Hash de exemplo
        specialty: 'Cardiologia',
        crm: 'CRM-SP 123456',
        phone: '(11) 99999-1111'
      },
      {
        name: 'Dra. Maria Santos',
        email: 'maria.santos@exemplo.com',
        password: '$2b$10$example',
        specialty: 'Dermatologia',
        crm: 'CRM-SP 789012',
        phone: '(11) 99999-2222'
      },
      {
        name: 'Dr. Pedro Costa',
        email: 'pedro.costa@exemplo.com',
        password: '$2b$10$example',
        specialty: 'Ginecologia',
        crm: 'CRM-SP 345678',
        phone: '(11) 99999-3333'
      },
      {
        name: 'Dra. Ana Oliveira',
        email: 'ana.oliveira@exemplo.com',
        password: '$2b$10$example',
        specialty: 'Pediatria',
        crm: 'CRM-SP 901234',
        phone: '(11) 99999-4444'
      }
    ];

    for (const professional of testProfessionals) {
      await pool.query(
        'INSERT INTO professionals (name, email, password, specialty, crm, phone, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT (email) DO NOTHING',
        [professional.name, professional.email, professional.password, professional.specialty, professional.crm, professional.phone]
      );
    }

    res.json({
      success: true,
      message: 'Dados de teste inseridos com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao inserir dados de teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao inserir dados de teste',
      error: error.message
    });
  }
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
  const databaseUrl = getDatabaseUrl();
  
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
    databaseUrl: databaseUrl ? 'URL construída com sucesso' : 'Falha ao construir URL',
    sslConfig: 'SSL desabilitado no pool',
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

// Teste de diferentes URLs de conexão
app.get('/api/url-test', async (req, res) => {
  const { Pool } = require('pg');
  const results = [];
  
  const urls = [
    { name: 'SAUDE_POSTGRES_URL_NON_POOLING', url: process.env.SAUDE_POSTGRES_URL_NON_POOLING },
    { name: 'SAUDE_POSTGRES_URL', url: process.env.SAUDE_POSTGRES_URL },
    { name: 'SAUDE_POSTGRES_PRISMA_URL', url: process.env.SAUDE_POSTGRES_PRISMA_URL }
  ];
  
  for (const urlConfig of urls) {
    if (!urlConfig.url) {
      results.push({
        test: urlConfig.name,
        success: false,
        error: 'URL não configurada'
      });
      continue;
    }
    
    // Teste 1: URL original com SSL desabilitado no pool
    try {
      console.log(`Testando ${urlConfig.name} (SSL desabilitado no pool)...`);
      const testPool1 = new Pool({
        connectionString: urlConfig.url,
        ssl: false
      });
      
      const result1 = await testPool1.query('SELECT NOW() as current_time');
      await testPool1.end();
      
      results.push({
        test: `${urlConfig.name} (SSL desabilitado no pool)`,
        success: true,
        currentTime: result1.rows[0].current_time
      });
    } catch (error) {
      results.push({
        test: `${urlConfig.name} (SSL desabilitado no pool)`,
        success: false,
        error: error.message
      });
    }
    
    // Teste 2: URL modificada com sslmode=disable
    try {
      console.log(`Testando ${urlConfig.name} (sslmode=disable na URL)...`);
      let modifiedUrl = urlConfig.url;
      
      // Remover TODOS os parâmetros SSL existentes
      modifiedUrl = modifiedUrl.replace(/[?&]sslmode=[^&]*/g, '');
      modifiedUrl = modifiedUrl.replace(/[?&]ssl=[^&]*/g, '');
      modifiedUrl = modifiedUrl.replace(/[?&]sslcert=[^&]*/g, '');
      modifiedUrl = modifiedUrl.replace(/[?&]sslkey=[^&]*/g, '');
      modifiedUrl = modifiedUrl.replace(/[?&]sslrootcert=[^&]*/g, '');
      
      // Adicionar sslmode=disable FORÇADAMENTE
      if (modifiedUrl.includes('?')) {
        modifiedUrl += '&sslmode=disable';
      } else {
        modifiedUrl += '?sslmode=disable';
      }
      
      const testPool2 = new Pool({
        connectionString: modifiedUrl,
        ssl: false
      });
      
      const result2 = await testPool2.query('SELECT NOW() as current_time');
      await testPool2.end();
      
      results.push({
        test: `${urlConfig.name} (sslmode=disable na URL)`,
        success: true,
        currentTime: result2.rows[0].current_time
      });
    } catch (error) {
      results.push({
        test: `${urlConfig.name} (sslmode=disable na URL)`,
        success: false,
        error: error.message
      });
    }
  }
  
  res.json({
    message: 'Testes de diferentes URLs com SSL forçadamente desabilitado',
    results: results,
    recommendation: results.find(r => r.success) ? 
      `Use: ${results.find(r => r.success).test}` : 
      'Nenhuma URL funcionou'
  });
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
  
  // Teste 2: URL modificada para forçar SSL desabilitado
  try {
    console.log('Testando URL modificada...');
    let modifiedUrl = getDatabaseUrl();
    if (modifiedUrl) {
      // Remover parâmetros SSL da URL
      modifiedUrl = modifiedUrl.replace(/[?&]sslmode=[^&]*/g, '');
      modifiedUrl = modifiedUrl.replace(/[?&]ssl=[^&]*/g, '');
      // Adicionar sslmode=disable
      modifiedUrl += (modifiedUrl.includes('?') ? '&' : '?') + 'sslmode=disable';
    }
    
    const testPool2 = new Pool({
      connectionString: modifiedUrl,
      ssl: false
    });
    
    const result2 = await testPool2.query('SELECT NOW() as current_time');
    await testPool2.end();
    
    results.push({
      test: 'URL modificada (sslmode=disable)',
      success: true,
      currentTime: result2.rows[0].current_time
    });
  } catch (error) {
    results.push({
      test: 'URL modificada (sslmode=disable)',
      success: false,
      error: error.message
    });
  }
  
  // Teste 3: SSL com configuração permissiva
  try {
    console.log('Testando SSL permissivo...');
    const testPool3 = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
      }
    });
    
    const result3 = await testPool3.query('SELECT NOW() as current_time');
    await testPool3.end();
    
    results.push({
      test: 'SSL permissivo',
      success: true,
      currentTime: result3.rows[0].current_time
    });
  } catch (error) {
    results.push({
      test: 'SSL permissivo',
      success: false,
      error: error.message
    });
  }
  
  // Teste 4: Sem configuração SSL (padrão)
  try {
    console.log('Testando sem configuração SSL...');
    const testPool4 = new Pool({
      connectionString: getDatabaseUrl()
    });
    
    const result4 = await testPool4.query('SELECT NOW() as current_time');
    await testPool4.end();
    
    results.push({
      test: 'Sem configuração SSL (padrão)',
      success: true,
      currentTime: result4.rows[0].current_time
    });
  } catch (error) {
    results.push({
      test: 'Sem configuração SSL (padrão)',
      success: false,
      error: error.message
    });
  }
  
  // Teste 5: SSL com configuração mais permissiva
  try {
    console.log('Testando SSL muito permissivo...');
    const testPool5 = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
        secureProtocol: 'TLSv1_2_method',
        ciphers: 'ALL:!ADH:!LOW:!EXP:!MD5:@STRENGTH'
      }
    });
    
    const result5 = await testPool5.query('SELECT NOW() as current_time');
    await testPool5.end();
    
    results.push({
      test: 'SSL muito permissivo',
      success: true,
      currentTime: result5.rows[0].current_time
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
    
    console.log('Tabelas encontradas:', tablesResult.rows.map(row => row.table_name));
    
    // Verificar estrutura da tabela users se existir
    let usersTableStructure = null;
    if (tablesResult.rows.some(row => row.table_name === 'users')) {
      const structureResult = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      usersTableStructure = structureResult.rows;
      console.log('Estrutura da tabela users:', usersTableStructure);
    }
    
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
      usersTableStructure: usersTableStructure,
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
    console.log('=== INÍCIO DO REGISTRO ===');
    console.log('Body recebido:', req.body);
    
    // Validação com Joi
    console.log('Validando dados com Joi...');
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      console.log('Erro de validação:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }
    console.log('Dados validados:', value);

    const { name, email, password, phone, cpf } = value;

    // Verificar se email já existe
    console.log('Verificando se email já existe...');
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    console.log('Resultado da verificação de email:', existingUser.rows.length);

    if (existingUser.rows.length > 0) {
      console.log('Email já cadastrado');
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    console.log('Fazendo hash da senha...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hash da senha concluído');

    // Criar usuário no banco
    console.log('Inserindo usuário no banco...');
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, cpf, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, name, email, phone, cpf, created_at',
      [name, email, hashedPassword, phone, cpf]
    );
    console.log('Usuário inserido com sucesso:', result.rows[0]);

    const user = result.rows[0];

    // Gerar JWT token
    console.log('Gerando JWT token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '24h' }
    );
    console.log('JWT token gerado');

    console.log('=== REGISTRO CONCLUÍDO COM SUCESSO ===');
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
    console.error('=== ERRO NO REGISTRO ===');
    console.error('Erro completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensagem:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    console.log('=== INÍCIO DO LOGIN ===');
    console.log('Body recebido:', req.body);
    
    const { email, password } = req.body;

    // Validação básica
    console.log('Validando dados básicos...');
    if (!email || !password) {
      console.log('Email ou senha não fornecidos');
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }
    console.log('Dados básicos validados');

    // Buscar usuário no banco
    console.log('Buscando usuário no banco...');
    const result = await pool.query(
      'SELECT id, name, email, password, phone, cpf, created_at FROM users WHERE email = $1',
      [email]
    );
    console.log('Resultado da busca:', result.rows.length, 'usuários encontrados');

    if (result.rows.length === 0) {
      console.log('Usuário não encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const user = result.rows[0];
    console.log('Usuário encontrado:', { id: user.id, email: user.email });

    // Verificar senha
    console.log('Verificando senha...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Senha válida:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Senha inválida');
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar JWT token
    console.log('Gerando JWT token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '24h' }
    );
    console.log('JWT token gerado');

    console.log('=== LOGIN CONCLUÍDO COM SUCESSO ===');
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
    console.error('=== ERRO NO LOGIN ===');
    console.error('Erro completo:', error);
    console.error('Stack trace:', error.stack);
    console.error('Mensagem:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ===== USER ROUTES =====

// Get current user (alias for /users/profile)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(
      'SELECT id, name, email, phone, cpf, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    const user = result.rows[0];
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          cpf: user.cpf,
          createdAt: user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

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
    console.log('👨‍⚕️ Buscando profissionais com filtros:', req.query);
    
    let query = 'SELECT id, name, specialty, crm, phone, created_at FROM professionals WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filtro por especialidade
    if (req.query.specialty) {
      paramCount++;
      query += ` AND specialty ILIKE $${paramCount}`;
      params.push(`%${req.query.specialty}%`);
    }

    // Filtro por busca (nome)
    if (req.query.search) {
      paramCount++;
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${req.query.search}%`);
    }

    // Filtro por localização (se implementado)
    if (req.query.location) {
      paramCount++;
      query += ` AND (city ILIKE $${paramCount} OR state ILIKE $${paramCount})`;
      params.push(`%${req.query.location}%`);
    }

    query += ' ORDER BY name';

    console.log('🔍 Query final:', query);
    console.log('📋 Parâmetros:', params);

    const result = await pool.query(query, params);

    console.log('👨‍⚕️ Profissionais encontrados:', result.rows.length);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Erro ao listar profissionais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
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
    console.log('📅 Buscando appointments para userId:', req.user.userId);
    
    const result = await pool.query(
      `SELECT a.*, p.name as professional_name, p.specialty 
       FROM appointments a 
       LEFT JOIN professionals p ON a.professional_id = p.id 
       WHERE a.patient_id = $1 
       ORDER BY a.date, a.time`,
      [req.user.userId]
    );

    console.log('📅 Appointments encontrados:', result.rows.length);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Erro ao listar consultas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
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