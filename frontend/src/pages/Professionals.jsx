import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { professionalService } from '../services/professionalService'
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Filter,
  User,
  Calendar
} from 'lucide-react'

export default function Professionals() {
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    location: '',
    availability: ''
  })

  const { data: professionals, isLoading } = useQuery(
    ['professionals', filters],
    () => professionalService.getProfessionals(filters),
    {
      keepPreviousData: true
    }
  )

  const specialties = [
    'Clínica Geral',
    'Cardiologia',
    'Dermatologia',
    'Ginecologia',
    'Pediatria',
    'Psicologia',
    'Nutrição',
    'Ortopedia',
    'Oftalmologia',
    'Otorrinolaringologia',
    'Urologia',
    'Neurologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Pneumologia'
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais de Saúde</h1>
          <p className="text-gray-600">Encontre o profissional ideal para sua necessidade</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Specialty */}
          <select
            value={filters.specialty}
            onChange={(e) => handleFilterChange('specialty', e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas as especialidades</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>

          {/* Location */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cidade ou estado..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Availability */}
          <select
            value={filters.availability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Disponibilidade</option>
            <option value="today">Hoje</option>
            <option value="tomorrow">Amanhã</option>
            <option value="this_week">Esta semana</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))
        ) : professionals?.length > 0 ? (
          professionals.map((professional) => (
            <div key={professional.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {professional.name}
                    </h3>
                    <p className="text-primary-600 font-medium">
                      {professional.specialty}
                    </p>
                    {professional.sub_specialty && (
                      <p className="text-sm text-gray-600">
                        {professional.sub_specialty}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    {renderStars(professional.rating || 0)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {professional.review_count || 0} avaliações
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {professional.city && professional.state && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {professional.city}, {professional.state}
                  </div>
                )}
                
                {professional.consultation_price && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">R$ {professional.consultation_price}</span> por consulta
                  </div>
                )}

                {professional.experience_years && (
                  <div className="text-sm text-gray-600">
                    {professional.experience_years} anos de experiência
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {professional.accepts_online && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Online
                    </span>
                  )}
                  {professional.accepts_insurance && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      Convênio
                    </span>
                  )}
                </div>
              </div>

              {professional.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {professional.bio}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Link
                  to={`/professionals/${professional.id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ver perfil completo
                </Link>
                <Link
                  to={`/scheduling/${professional.id}`}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <Calendar size={16} />
                  Agendar
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum profissional encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros de busca
            </p>
            <button
              onClick={() => setFilters({ search: '', specialty: '', location: '', availability: '' })}
              className="btn btn-secondary"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Load More */}
      {professionals?.length > 0 && (
        <div className="text-center">
          <button className="btn btn-secondary">
            Carregar mais profissionais
          </button>
        </div>
      )}
    </div>
  )
}
