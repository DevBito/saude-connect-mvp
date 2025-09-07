const { Pool } = require('pg')
const dotenv = require('dotenv')

dotenv.config()

const pool = new Pool({
  connectionString: process.env.SAUDE_POSTGRES_URL,
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
