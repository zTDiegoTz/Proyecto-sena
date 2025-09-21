import React, { useState } from 'react'
import { useSimpleSupabase } from '../context/SimpleSupabaseContext'

// Componente de navegación lateral
function AdminSidebar({ activeSection, setActiveSection, onLogout }) {
  const { usuarioActual, tienePermiso } = useSimpleSupabase()

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '📊',
      visible: true
    },
    {
      id: 'usuarios',
      name: 'Gestión de Usuarios',
      icon: '👥',
      visible: tienePermiso('gestionar_usuarios') || usuarioActual.role === 'super_admin'
    },
    {
      id: 'surtidores',
      name: 'Gestión de Surtidores',
      icon: '⛽',
      visible: tienePermiso('gestionar_surtidores') || usuarioActual.role === 'super_admin'
    },
    {
      id: 'ventas',
      name: 'Control de Ventas',
      icon: '💰',
      visible: true
    },
    {
      id: 'reportes',
      name: 'Reportes',
      icon: '📈',
      visible: tienePermiso('ver_reportes') || usuarioActual.role === 'super_admin'
    },
    {
      id: 'configuracion',
      name: 'Configuración',
      icon: '⚙️',
      visible: usuarioActual.role === 'super_admin'
    }
  ]

  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-900">
        <h2 className="text-xl font-bold">Panel de Control</h2>
        <p className="text-sm text-gray-300">{usuarioActual.name}</p>
        <span className="text-xs bg-blue-600 px-2 py-1 rounded">
          {usuarioActual.role === 'super_admin' ? 'Super Admin' : 'Gerente'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.filter(item => item.visible).map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

// Dashboard principal
function DashboardOverview({ surtidores }) {
  const totalSurtidores = surtidores.length
  const surtidoresActivos = surtidores.filter(s => s.estado === 'disponible').length
  const surtidoresOcupados = surtidores.filter(s => s.estado === 'ocupado').length

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Gerencial</h1>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              ⛽
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Surtidores</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSurtidores}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              ✅
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-semibold text-gray-900">{surtidoresActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              🔄
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Uso</p>
              <p className="text-2xl font-semibold text-gray-900">{surtidoresOcupados}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de surtidores */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado de Surtidores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {surtidores.map((surtidor) => (
            <div key={surtidor.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">{surtidor.nombre}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  surtidor.estado === 'disponible' 
                    ? 'bg-green-100 text-green-800'
                    : surtidor.estado === 'ocupado'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {surtidor.estado}
                </span>
              </div>
              
              <div className="space-y-1">
                {Object.entries(surtidor.combustibles || {}).map(([tipo, datos]) => (
                  <div key={tipo} className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{tipo}:</span>
                    <div className="text-right">
                      <div>${(datos.precio || 0).toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Stock: {datos.stock}L</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Gestión de Usuarios
function GestionUsuarios() {
  const [usuarios] = useState([
    { id: 1, nombre: 'Admin Principal', usuario: 'admin', rol: 'super_admin', email: 'admin@estacion.com', activo: true },
    { id: 2, nombre: 'Gerente Estación', usuario: 'gerente', rol: 'administrador', email: 'gerente@estacion.com', activo: true },
    { id: 3, nombre: 'Juan Pérez', usuario: 'bombero1', rol: 'bombero', email: 'juan@estacion.com', activo: true }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          ➕ Nuevo Usuario
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                    <div className="text-sm text-gray-500">@{usuario.usuario}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    ✏️ Editar
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Gestión de Surtidores
function GestionSurtidores({ surtidores }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Surtidores</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          ⚙️ Configurar Precios
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {surtidores.map((surtidor) => (
          <div key={surtidor.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{surtidor.nombre}</h3>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">
                  ✏️ Editar
                </button>
                <button className="text-green-600 hover:text-green-800">
                  ⚙️ Configurar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Estado:</label>
                <select 
                  className="ml-2 text-sm border rounded px-2 py-1"
                  value={surtidor.estado}
                  onChange={(e) => {
                    // Aquí puedes agregar la lógica para actualizar el estado
                    console.log('Estado cambiado a:', e.target.value)
                  }}
                >
                  <option value="disponible">Disponible</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de Servicio</option>
                </select>
              </div>

              {Object.entries(surtidor.combustibles || {}).map(([tipo, datos]) => (
                <div key={tipo} className="border-t pt-2">
                  <div className="font-medium text-gray-700 capitalize mb-1">{tipo}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <label className="text-gray-600">Precio:</label>
                      <input 
                        type="number" 
                        defaultValue={datos.precio}
                        className="w-full border rounded px-2 py-1 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-gray-600">Stock (L):</label>
                      <input 
                        type="number" 
                        defaultValue={datos.stock}
                        className="w-full border rounded px-2 py-1 mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                💾 Guardar
              </button>
              <button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded">
                🔄 Resetear
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Control de Ventas
function ControlVentas() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Control de Ventas</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Resumen del Día</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">$2,450,000</div>
            <div className="text-sm text-gray-600">Total Vendido</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-sm text-gray-600">Transacciones</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">1,245L</div>
            <div className="text-sm text-gray-600">Combustible Vendido</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Últimas Ventas</h3>
        <div className="text-center text-gray-500 py-8">
          📊 Aquí aparecerán las últimas ventas registradas en el sistema
        </div>
      </div>
    </div>
  )
}

// Reportes
function Reportes() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📈 Ventas por Período</h3>
          <div className="text-center text-gray-500 py-8">
            Gráfico de ventas por día/semana/mes
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">⛽ Consumo por Combustible</h3>
          <div className="text-center text-gray-500 py-8">
            Distribución de ventas por tipo de combustible
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">👥 Rendimiento por Bombero</h3>
          <div className="text-center text-gray-500 py-8">
            Estadísticas de ventas por empleado
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🕐 Análisis de Turnos</h3>
          <div className="text-center text-gray-500 py-8">
            Horas trabajadas y productividad
          </div>
        </div>
      </div>
    </div>
  )
}

// Configuración del Sistema
function ConfiguracionSistema() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🏪 Información de la Estación</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de la Estación</label>
              <input type="text" defaultValue="Estación Principal" className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">RUC/NIT</label>
              <input type="text" defaultValue="12345678-9" className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input type="text" defaultValue="Av. Principal #123" className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">💰 Configuración de Precios</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gasolina Extra</label>
              <input type="number" defaultValue="12500" className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gasolina Corriente</label>
              <input type="number" defaultValue="11500" className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ACPM</label>
              <input type="number" defaultValue="10500" className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🔐 Configuración de Seguridad</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <label className="text-sm text-gray-700">Requerir confirmación para ventas grandes</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <label className="text-sm text-gray-700">Backup automático diario</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <label className="text-sm text-gray-700">Notificaciones por email</label>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🗄️ Base de Datos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Estado de Supabase:</span>
              <span className="text-green-600 font-medium">✅ Conectado</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Último backup:</span>
              <span className="text-gray-600">Hoy 14:30</span>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
              🔄 Sincronizar Datos
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded">
          Cancelar
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded">
          💾 Guardar Configuración
        </button>
      </div>
    </div>
  )
}

// Componente principal del dashboard administrativo
function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const { usuarioActual, logout, surtidores } = useSimpleSupabase()

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview surtidores={surtidores} />
      case 'usuarios':
        return <GestionUsuarios />
      case 'surtidores':
        return <GestionSurtidores surtidores={surtidores} />
      case 'ventas':
        return <ControlVentas />
      case 'reportes':
        return <Reportes />
      case 'configuracion':
        return <ConfiguracionSistema />
      default:
        return <DashboardOverview surtidores={surtidores} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={logout}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
