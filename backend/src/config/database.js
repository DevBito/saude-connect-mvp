const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

// Função para forçar SSL desabilitado
const getDatabaseUrl = () => {
  let databaseUrl = process.env.SAUDE_POSTGRES_URL;
  
  if (!databaseUrl) {
    console.log('❌ SAUDE_POSTGRES_URL não encontrada');
    return null;
  }
  
  // Forçar SSL desabilitado
  console.log('🔧 Forçando SSL desabilitado...');
  console.log('URL original:', databaseUrl);
  
  // Remover parâmetros SSL existentes de forma mais cuidadosa
  databaseUrl = databaseUrl.replace(/[?&]sslmode=[^&]*/g, '');
  databaseUrl = databaseUrl.replace(/[?&]ssl=[^&]*/g, '');
  
  // Adicionar sslmode=disable
  if (databaseUrl.includes('?')) {
    databaseUrl += '&sslmode=disable';
  } else {
    databaseUrl += '?sslmode=disable';
  }
  
  console.log('✅ URL final com SSL desabilitado:', databaseUrl);
  return databaseUrl;
}

const pool = new Pool({
  connectionString: getDatabaseUrl(),
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
