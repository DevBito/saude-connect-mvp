import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Calendar, Users, Shield, Heart } from 'lucide-react'

export default function Home() {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: Calendar,
      title: 'Agendamento Fácil',
      description: 'Agende suas consultas de forma rápida e prática, 24 horas por dia.'
    },
    {
      icon: Users,
      title: 'Profissionais Qualificados',
      description: 'Acesso a uma rede de profissionais de saúde verificados e especializados.'
    },
    {
      icon: Shield,
      title: 'Dados Seguros',
      description: 'Seus dados médicos são protegidos com as melhores práticas de segurança.'
    },
    {
      icon: Heart,
      title: 'Cuidado Integral',
      description: 'Acompanhe seu histórico médico e tenha acesso aos seus resultados.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Saúde Connect</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Recursos</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">Sobre</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contato</a>
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900">
                    Entrar
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Criar Conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-health-teal-50 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-health-blue-50/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
              Sua saúde em suas mãos
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-12 max-w-5xl mx-auto leading-relaxed">
              Conecte-se com profissionais de saúde qualificados, agende consultas 
              online e presenciais, e gerencie seu histórico médico de forma segura e prática.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              {!isAuthenticated && (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg btn-modern shadow-medium text-lg px-12 py-4">
                    Começar Agora
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg shadow-soft text-lg px-12 py-4">
                    Já tenho conta
                  </Link>
                </>
              )}
              {isAuthenticated && (
                <Link to="/professionals" className="btn btn-primary btn-lg btn-modern shadow-medium text-lg px-12 py-4">
                  Buscar Profissionais
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-br from-white to-primary-50">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Por que escolher o Saúde Connect?
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Oferecemos uma plataforma completa para gerenciar sua saúde de forma digital e segura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const colors = [
                'bg-gradient-to-br from-primary-500 to-primary-600',
                'bg-gradient-to-br from-health-blue-500 to-health-blue-600',
                'bg-gradient-to-br from-health-teal-500 to-health-teal-600',
                'bg-gradient-to-br from-secondary-500 to-secondary-600'
              ]
              return (
                <div key={index} className="card card-hover p-10 text-center animate-slide-up bg-white/80 backdrop-blur-sm" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className={`w-24 h-24 ${colors[index]} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-medium`}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-gradient-to-br from-primary-50 via-white to-health-teal-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div className="animate-fade-in">
              <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent mb-6">1000+</div>
              <div className="text-2xl text-gray-700 font-medium">Profissionais Cadastrados</div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-health-blue-500 to-health-blue-600 bg-clip-text text-transparent mb-6">5000+</div>
              <div className="text-2xl text-gray-700 font-medium">Consultas Realizadas</div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <div className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-health-teal-500 to-health-teal-600 bg-clip-text text-transparent mb-6">98%</div>
              <div className="text-2xl text-gray-700 font-medium">Satisfação dos Usuários</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-health-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-health-teal-600/90"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
              Pronto para cuidar da sua saúde?
            </h2>
            <p className="text-2xl text-white/95 mb-12 max-w-4xl mx-auto leading-relaxed">
              Junte-se a milhares de pessoas que já confiam no Saúde Connect para gerenciar sua saúde de forma segura e eficiente
            </p>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 shadow-medium btn-modern text-xl px-16 py-5">
                Criar Conta Gratuita
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-800 via-gray-900 to-primary-900 text-white py-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-health-teal-500 rounded-2xl flex items-center justify-center shadow-medium">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
                <span className="text-3xl font-bold">Saúde Connect</span>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">
                Conectando pessoas a profissionais de saúde qualificados de forma segura e prática.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Produto</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Suporte</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6">Legal</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                &copy; 2024 Saúde Connect. Todos os direitos reservados.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
