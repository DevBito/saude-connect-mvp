const notFound = (req, res, next) => {
  console.log('🔍 NOT FOUND - MIDDLEWARE CHAMADO!')
  console.log('🔍 NOT FOUND - Rota não encontrada:', req.originalUrl)
  console.log('🔍 NOT FOUND - Method:', req.method)
  console.log('🔍 NOT FOUND - Headers:', req.headers)
  console.log('🔍 NOT FOUND - Body:', req.body)
  
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

module.exports = { notFound }
