const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

// Função para forçar SSL desabilitado na URL
const getDatabaseUrl = () => {
  // USAR APENAS SAUDE_POSTGRES_URL_NON_POOLING (FUNCIONOU!)
  if (!process.env.SAUDE_POSTGRES_URL_NON_POOLING) {
    console.log('❌ SAUDE_POSTGRES_URL_NON_POOLING não configurada');
    return null;
  }
  
  let databaseUrl = process.env.SAUDE_POSTGRES_URL_NON_POOLING;
  console.log('✅ Usando SAUDE_POSTGRES_URL_NON_POOLING (FUNCIONOU!)');
  
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
  
  console.log('✅ URL FINAL COM SSL FORÇADAMENTE DESABILITADO');
  return databaseUrl;
}

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: false,
  max: 5, // REDUZIDO: Máximo 5 conexões simultâneas
  min: 1, // Mínimo 1 conexão
  idleTimeoutMillis: 10000, // REDUZIDO: 10 segundos
  connectionTimeoutMillis: 5000, // AUMENTADO: 5 segundos
  acquireTimeoutMillis: 10000, // Timeout para adquirir conexão
  allowExitOnIdle: true, // Permitir saída quando idle
})

// Test database connection
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL')
})

pool.on('error', (err) => {
  console.error('❌ Erro na conexão com o banco de dados:', err)
  process.exit(-1)
})

module.exports = pool
