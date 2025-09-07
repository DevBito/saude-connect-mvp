const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

// Função para forçar SSL desabilitado na URL
const getDatabaseUrl = () => {
  let databaseUrl = process.env.SAUDE_POSTGRES_URL_NON_POOLING || process.env.SAUDE_POSTGRES_URL;
  
  if (!databaseUrl) {
    console.log('❌ Nenhuma URL de banco encontrada');
    return null;
  }
  
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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
