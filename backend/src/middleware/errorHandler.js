const errorHandler = (err, req, res, next) => {
  console.error('🚨 ERROR HANDLER - MIDDLEWARE CHAMADO!')
  console.error('🚨 ERROR HANDLER - Erro capturado:', err)
  console.error('🚨 ERROR HANDLER - URL:', req.url)
  console.error('🚨 ERROR HANDLER - Method:', req.method)
  console.error('🚨 ERROR HANDLER - Headers:', req.headers)
  console.error('🚨 ERROR HANDLER - Body:', req.body)
  console.error('🚨 ERROR HANDLER - Stack:', err.stack)

  // Erro de validação do Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    })
  }

  // Erro de duplicação de chave única (PostgreSQL)
  if (err.code === '23505') {
    const field = err.constraint.includes('email') ? 'email' : 'campo'
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} já está em uso`
    })
  }

  // Erro de violação de chave estrangeira
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referência inválida'
    })
  }

  // Erro de violação de restrição de verificação
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos'
    })
  }

  // Erro de sintaxe SQL
  if (err.code === '42601') {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }

  // Erro de conexão com banco de dados
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: 'Serviço temporariamente indisponível'
    })
  }

  // Erro padrão
  const statusCode = err.statusCode || 500
  const message = err.message || 'Erro interno do servidor'

  console.error('🚨 ERROR HANDLER - Enviando resposta de erro:')
  console.error('🚨 ERROR HANDLER - Status Code:', statusCode)
  console.error('🚨 ERROR HANDLER - Message:', message)

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
}

module.exports = { errorHandler }
