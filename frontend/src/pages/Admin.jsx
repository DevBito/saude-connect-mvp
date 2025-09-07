import { useState } from 'react'
import { Users, UserPlus, BarChart3, Settings, Calendar, FileText } from 'lucide-react'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const stats = [
    {
      title: 'Total de Usuários',
      value: '1,234',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Profissionais Ativos',
      value: '89',
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Consultas Hoje',
      value: '45',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Relatórios',
      value: '12',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'users', name: 'Usuários', icon: Users },
    { id: 'professionals', name: 'Profissionais', icon: UserPlus },
    { id: 'appointments', name: 'Consultas', icon: Calendar },
    { id: 'settings', name: 'Configurações', icon: Settings }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600">Gerencie o sistema Saúde Connect</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-2">Consultas Recentes</h3>
                  <p className="text-sm text-gray-600">Nenhuma consulta recente</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-2">Usuários Novos</h3>
                  <p className="text-sm text-gray-600">5 novos usuários esta semana</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerenciar Usuários</h2>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}

          {activeTab === 'professionals' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerenciar Profissionais</h2>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gerenciar Consultas</h2>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações do Sistema</h2>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
