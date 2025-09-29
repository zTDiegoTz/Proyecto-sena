import React, { useState, useEffect, useMemo } from 'react'
import { useSimpleSupabase } from '../context/SimpleSupabaseContextTemp.jsx'
import { ventasServiceClean } from '../services/ventasServiceClean'
import { usuariosService, surtidoresService, combustiblesService } from '../services/supabaseServiceFinal'

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
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: '',
    password: '',
    name: '',
    role: 'bombero',
    email: ''
  })
  const [usuarioEditando, setUsuarioEditando] = useState({
    username: '',
    password: '',
    name: '',
    role: 'bombero',
    email: ''
  })

  // Cargar usuarios desde Supabase
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setLoading(true)
        const resultado = await usuariosService.obtenerTodos()
        if (resultado.success) {
          setUsuarios(resultado.data)
        } else {
          setError(resultado.message)
        }
      } catch (err) {
        setError('Error al cargar usuarios: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    cargarUsuarios()
  }, [])

  // Crear nuevo usuario
  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    try {
      setError('')
      const resultado = await usuariosService.crear(nuevoUsuario)
      if (resultado.success) {
        // Recargar lista de usuarios
        const usuariosResult = await usuariosService.obtenerTodos()
        if (usuariosResult.success) {
          setUsuarios(usuariosResult.data)
        }
        // Limpiar formulario y cerrar
        setNuevoUsuario({
          username: '',
          password: '',
          name: '',
          role: 'bombero',
          email: ''
        })
        setShowCreateForm(false)
        alert('Usuario creado exitosamente')
      } else {
        setError(resultado.message)
      }
    } catch (err) {
      setError('Error al crear usuario: ' + err.message)
    }
  }

  // Editar usuario
  const handleEdit = (usuario) => {
    console.log('Editando usuario:', usuario)
    setEditingUser(usuario)
    setUsuarioEditando({
      username: usuario.username,
      password: '', // No mostrar contraseña actual
      name: usuario.name,
      role: usuario.role,
      email: usuario.email || ''
    })
    setShowEditForm(true)
  }

  // Guardar cambios de usuario editado
  const handleGuardarEdicion = async (e) => {
    e.preventDefault()
    try {
      setError('')
      
      // Preparar datos para actualizar (solo campos que cambiaron)
      const datosActualizacion = {
        username: usuarioEditando.username,
        name: usuarioEditando.name,
        role: usuarioEditando.role,
        email: usuarioEditando.email
      }
      
      // Solo incluir password si se proporcionó uno nuevo
      if (usuarioEditando.password.trim()) {
        datosActualizacion.password = usuarioEditando.password
      }
      
      const resultado = await usuariosService.actualizar(editingUser.id, datosActualizacion)
      
      if (resultado.success) {
        // Recargar lista de usuarios
        const usuariosResult = await usuariosService.obtenerTodos()
        if (usuariosResult.success) {
          setUsuarios(usuariosResult.data)
        }
        
        // Cerrar modal y limpiar
        setShowEditForm(false)
        setEditingUser(null)
        setUsuarioEditando({
          username: '',
          password: '',
          name: '',
          role: 'bombero',
          email: ''
        })
        alert('Usuario actualizado exitosamente')
      } else {
        setError(resultado.message)
      }
    } catch (err) {
      setError('Error al actualizar usuario: ' + err.message)
    }
  }

  // Eliminar usuario
  const handleDelete = async (usuarioId) => {
    console.log('Eliminando usuario con ID:', usuarioId)
    
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        const resultado = await usuariosService.eliminar(usuarioId)
        console.log('Resultado de eliminación:', resultado)
        
        if (resultado.success) {
          alert('Usuario eliminado exitosamente')
          // Recargar lista de usuarios
          const usuariosResult = await usuariosService.obtenerTodos()
          if (usuariosResult.success) {
            setUsuarios(usuariosResult.data)
          }
        } else {
          alert('Error al eliminar el usuario: ' + resultado.message)
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error)
        alert('Error al eliminar el usuario. Por favor, inténtalo de nuevo.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          ➕ Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Formulario de creación de usuario */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Crear Nuevo Usuario</h2>
          <form onSubmit={handleCrearUsuario} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={nuevoUsuario.name}
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={nuevoUsuario.username}
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, username: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={nuevoUsuario.password}
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={nuevoUsuario.email}
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={nuevoUsuario.role}
                  onChange={(e) => setNuevoUsuario({...nuevoUsuario, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="bombero">Bombero</option>
                  <option value="administrador">Administrador</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                ✅ Crear Usuario
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario de edición de usuario */}
      {showEditForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Editar Usuario: {editingUser?.name}</h2>
          <form onSubmit={handleGuardarEdicion} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={usuarioEditando.name}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={usuarioEditando.username}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, username: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña (opcional)
                </label>
                <input
                  type="password"
                  value={usuarioEditando.password}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dejar vacío para mantener la contraseña actual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={usuarioEditando.email}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={usuarioEditando.role}
                  onChange={(e) => setUsuarioEditando({...usuarioEditando, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="bombero">Bombero</option>
                  <option value="administrador">Administrador</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                ✅ Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false)
                  setEditingUser(null)
                  setUsuarioEditando({
                    username: '',
                    password: '',
                    name: '',
                    role: 'bombero',
                    email: ''
                  })
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Cargando usuarios...
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{usuario.name}</div>
                      <div className="text-sm text-gray-500">@{usuario.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {usuario.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {usuario.email || 'Sin email'}
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
                    <button 
                      onClick={() => handleEdit(usuario)}
                      className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-600 hover:text-red-900 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Gestión de Surtidores
function GestionSurtidores({ surtidores }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGlobalConfigModal, setShowGlobalConfigModal] = useState(false)
  const [editingSurtidor, setEditingSurtidor] = useState(null)
  const [configurandoSurtidor, setConfigurandoSurtidor] = useState(null)
  const [surtidorData, setSurtidorData] = useState({
    nombre: '',
    estado: 'disponible'
  })
  const [nuevoSurtidor, setNuevoSurtidor] = useState({
    nombre: '',
    estado: 'disponible'
  })
  const [configuracionGlobal, setConfiguracionGlobal] = useState({
    extra: { precio: 0, stock_total: 0, stock_disponible: 0 },
    corriente: { precio: 0, stock_total: 0, stock_disponible: 0 },
    acpm: { precio: 0, stock_total: 0, stock_disponible: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Verificar si se puede agregar más surtidores
  const puedeAgregarSurtidor = surtidores.length < 6

  // Cargar configuración global al montar el componente
  useEffect(() => {
    cargarConfiguracionGlobal()
  }, [])

  const cargarConfiguracionGlobal = async () => {
    try {
      const resultado = await combustiblesService.obtenerConfiguracionGlobal()
      if (resultado.success) {
        setConfiguracionGlobal(resultado.data)
      }
    } catch (error) {
      console.error('Error al cargar configuración global:', error)
    }
  }

  // Función para abrir modal de crear surtidor
  const handleCrearSurtidor = () => {
    if (!puedeAgregarSurtidor) {
      alert('No se pueden agregar más surtidores. Máximo permitido: 6')
      return
    }
    setNuevoSurtidor({
      nombre: '',
      estado: 'disponible'
    })
    setShowCreateModal(true)
  }

  // Función para abrir modal de configuración global
  const handleConfiguracionGlobal = () => {
    setShowGlobalConfigModal(true)
  }

  // Función para guardar configuración global
  const handleGuardarConfiguracionGlobal = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      
      const resultado = await combustiblesService.actualizarConfiguracionGlobal(configuracionGlobal)
      
      if (resultado.success) {
        alert('Configuración global actualizada exitosamente')
        setShowGlobalConfigModal(false)
        // Recargar página para ver cambios
        window.location.reload()
      } else {
        setError(resultado.message)
      }
    } catch (err) {
      setError('Error al actualizar configuración global: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para crear nuevo surtidor
  const handleGuardarCreacion = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      
      const resultado = await surtidoresService.crear(nuevoSurtidor)
      
      if (resultado.success) {
        alert('Surtidor creado exitosamente')
        setShowCreateModal(false)
        setNuevoSurtidor({
          nombre: '',
          estado: 'disponible',
          combustibles: {
            extra: { precio: 0, stock: 0 },
            corriente: { precio: 0, stock: 0 },
            acpm: { precio: 0, stock: 0 }
          }
        })
        // Recargar página para ver cambios
        window.location.reload()
      } else {
        setError(resultado.message)
      }
    } catch (err) {
      setError('Error al crear surtidor: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Función para editar surtidor
  const handleEdit = (surtidor) => {
    console.log('Editando surtidor:', surtidor)
    setEditingSurtidor(surtidor)
    setSurtidorData({
      nombre: surtidor.nombre,
      estado: surtidor.estado
    })
    setShowEditModal(true)
  }

  // Función para configurar surtidor
  const handleConfigurar = (surtidor) => {
    console.log('Configurando surtidor:', surtidor)
    setConfigurandoSurtidor(surtidor)
    setConfigData({
      extra: {
        precio: surtidor.combustibles?.extra?.precio || 0,
        stock: surtidor.combustibles?.extra?.stock || 0
      },
      corriente: {
        precio: surtidor.combustibles?.corriente?.precio || 0,
        stock: surtidor.combustibles?.corriente?.stock || 0
      },
      acpm: {
        precio: surtidor.combustibles?.acpm?.precio || 0,
        stock: surtidor.combustibles?.acpm?.stock || 0
      }
    })
    setShowConfigModal(true)
  }

  // Guardar cambios del surtidor editado
  const handleGuardarEdicion = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      
      const resultado = await surtidoresService.actualizarEstado(editingSurtidor.id, surtidorData.estado)
      
      if (resultado.success) {
        alert('Surtidor actualizado exitosamente')
        setShowEditModal(false)
        setEditingSurtidor(null)
        // Recargar página para ver cambios
        window.location.reload()
      } else {
        setError(resultado.message)
      }
    } catch (err) {
      setError('Error al actualizar surtidor: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Guardar configuración del surtidor
  const handleGuardarConfiguracion = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      
      // Actualizar precios
      const precios = {
        extra: configData.extra.precio,
        corriente: configData.corriente.precio,
        acpm: configData.acpm.precio
      }
      
      const resultadoPrecios = await surtidoresService.actualizarPrecios(precios)
      
      if (resultadoPrecios.success) {
        // Actualizar stock para cada combustible
        const actualizacionesStock = []
        
        for (const [tipo, data] of Object.entries(configData)) {
          actualizacionesStock.push(
            surtidoresService.establecerStock(configurandoSurtidor.id, tipo, data.stock)
          )
        }
        
        const resultadosStock = await Promise.all(actualizacionesStock)
        const todosExitosos = resultadosStock.every(r => r.success)
        
        if (todosExitosos) {
          alert('Configuración del surtidor guardada exitosamente')
          setShowConfigModal(false)
          setConfigurandoSurtidor(null)
          // Recargar página para ver cambios
          window.location.reload()
        } else {
          setError('Error al actualizar algunos stocks')
        }
      } else {
        setError(resultadoPrecios.message)
      }
    } catch (err) {
      setError('Error al guardar configuración: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Surtidores</h1>
          <p className="text-sm text-gray-600 mt-1">
            Surtidores activos: {surtidores.length}/6
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCrearSurtidor}
            disabled={!puedeAgregarSurtidor}
            className={`px-4 py-2 rounded-lg text-white ${
              puedeAgregarSurtidor
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            ➕ Agregar Surtidor
          </button>
          <button 
            onClick={handleConfiguracionGlobal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            ⚙️ Configurar Precios Globales
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {surtidores.map((surtidor) => (
          <div key={surtidor.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{surtidor.nombre}</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(surtidor)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={() => handleConfigurar(surtidor)}
                  className="text-green-600 hover:text-green-800"
                >
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

      {/* Modal de Edición de Surtidor */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Surtidor</h2>
            <form onSubmit={handleGuardarEdicion}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Surtidor
                  </label>
                  <input
                    type="text"
                    value={surtidorData.nombre}
                    onChange={(e) => setSurtidorData({...surtidorData, nombre: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={surtidorData.estado}
                    onChange={(e) => setSurtidorData({...surtidorData, estado: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="fuera_servicio">Fuera de Servicio</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Surtidor */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Configurar {configurandoSurtidor?.nombre}
            </h2>
            <form onSubmit={handleGuardarConfiguracion}>
              <div className="space-y-6">
                {Object.entries(configData).map(([tipo, data]) => (
                  <div key={tipo} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 capitalize mb-3">
                      {tipo}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio por Litro ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={data.precio}
                          onChange={(e) => setConfigData({
                            ...configData,
                            [tipo]: {...data, precio: parseFloat(e.target.value) || 0}
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock (Litros)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={data.stock}
                          onChange={(e) => setConfigData({
                            ...configData,
                            [tipo]: {...data, stock: parseFloat(e.target.value) || 0}
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Creación de Surtidor */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Surtidor</h2>
            <form onSubmit={handleGuardarCreacion}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Surtidor *
                    </label>
                    <input
                      type="text"
                      value={nuevoSurtidor.nombre}
                      onChange={(e) => setNuevoSurtidor({...nuevoSurtidor, nombre: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Ej: Surtidor 3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado Inicial
                    </label>
                    <select
                      value={nuevoSurtidor.estado}
                      onChange={(e) => setNuevoSurtidor({...nuevoSurtidor, estado: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="fuera_servicio">Fuera de Servicio</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-2">ℹ️</div>
                    <div className="text-sm text-blue-800">
                      <strong>Nota:</strong> Los precios y stocks de combustibles son globales para todos los surtidores. 
                      Puedes configurarlos usando el botón "Configurar Precios Globales".
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Surtidor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configuración Global de Combustibles */}
      {showGlobalConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Configuración Global de Combustibles</h2>
            <p className="text-sm text-gray-600 mb-6">
              Los precios y stocks configurados aquí se aplicarán a todos los surtidores de la estación.
            </p>
            <form onSubmit={handleGuardarConfiguracionGlobal}>
              <div className="space-y-6">
                {Object.entries(configuracionGlobal).map(([tipo, data]) => (
                  <div key={tipo} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 capitalize mb-4">
                      {tipo}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio por Litro ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={data.precio}
                          onChange={(e) => setConfiguracionGlobal({
                            ...configuracionGlobal,
                            [tipo]: {...data, precio: parseFloat(e.target.value) || 0}
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Total (Litros)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={data.stock_total}
                          onChange={(e) => setConfiguracionGlobal({
                            ...configuracionGlobal,
                            [tipo]: {...data, stock_total: parseFloat(e.target.value) || 0}
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Disponible (Litros)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={data.stock_disponible}
                          onChange={(e) => setConfiguracionGlobal({
                            ...configuracionGlobal,
                            [tipo]: {...data, stock_disponible: parseFloat(e.target.value) || 0}
                          })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGlobalConfigModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Configuración Global'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Control de Ventas
function ControlVentas() {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [ventasDelDia, setVentasDelDia] = useState({
    total: 0,
    transacciones: 0,
    combustibleVendido: 0
  })

  // Función para cargar ventas
  const cargarVentas = async () => {
    try {
      setLoading(true)
      const resultado = await ventasServiceClean.obtenerTodas()
      if (resultado.success) {
        setVentas(resultado.data)
      } else {
        console.error('Error al cargar ventas:', resultado.message)
        setVentas([])
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error)
      setVentas([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar ventas al montar el componente
  useEffect(() => {
    cargarVentas()
  }, [])

  // Calcular estadísticas del día
  useEffect(() => {
    const hoy = new Date()
    const ventasHoy = ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha_venta || venta.fechaHora)
      return fechaVenta.toDateString() === hoy.toDateString()
    })

    const total = ventasHoy.reduce((sum, venta) => sum + (venta.valor_total || 0), 0)
    const transacciones = ventasHoy.length
    const combustibleVendido = ventasHoy.reduce((sum, venta) => sum + (venta.cantidad_litros || venta.cantidad || 0), 0)

    setVentasDelDia({
      total,
      transacciones,
      combustibleVendido
    })
  }, [ventas])

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor)
  }

  // Función para formatear volumen
  const formatearVolumen = (litros) => {
    return `${litros.toFixed(0)}L`
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Función para manejar la edición de ventas
  const handleEdit = (venta) => {
    console.log('Editando venta:', venta)
    alert('Función de editar venta - Por implementar')
  }

  // Función para manejar la eliminación de ventas
  const handleDelete = async (ventaId) => {
    console.log('Eliminando venta con ID:', ventaId)
    
    if (window.confirm('¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.')) {
      try {
        // Usar el servicio de ventas para eliminar
        const resultado = await ventasServiceClean.eliminar(ventaId)
        console.log('Resultado de eliminación:', resultado)
        
        if (resultado.success) {
          alert('Venta eliminada exitosamente')
          // Recargar las ventas
          cargarVentas()
        } else {
          alert('Error al eliminar la venta: ' + resultado.message)
        }
      } catch (error) {
        console.error('Error al eliminar venta:', error)
        alert('Error al eliminar la venta. Por favor, inténtalo de nuevo.')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Control de Ventas</h1>
        <button
          onClick={cargarVentas}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          disabled={loading}
        >
          <span>{loading ? '⏳' : '🔄'}</span>
          <span>Actualizar</span>
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Resumen del Día</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatearMoneda(ventasDelDia.total)}</div>
            <div className="text-sm text-gray-600">Total Vendido</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{ventasDelDia.transacciones}</div>
            <div className="text-sm text-gray-600">Transacciones</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{formatearVolumen(ventasDelDia.combustibleVendido)}</div>
            <div className="text-sm text-gray-600">Combustible Vendido</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Últimas Ventas</h3>
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Cargando ventas...</p>
          </div>
        ) : ventas.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            📊 No hay ventas registradas en el sistema
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surtidor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Combustible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bombero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ventas.slice(0, 10).map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {venta.surtidor_nombre || venta.surtidorNombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {venta.tipo_combustible || venta.tipoCombustible || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {venta.cantidad_litros ? `${venta.cantidad_litros.toFixed(0)}L` : 
                       venta.cantidad ? `${venta.cantidad.toFixed(2)} gal` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearMoneda(venta.valor_total || venta.valorTotal || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {venta.bombero_nombre || venta.bomberoNombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(venta.fecha_venta || venta.fechaHora)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          console.log('Botón Editar clickeado para venta:', venta);
                          handleEdit(venta);
                        }}
                        className="text-yellow-600 hover:text-yellow-900 mr-4 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          console.log('Botón Eliminar clickeado para venta ID:', venta.id);
                          handleDelete(venta.id);
                        }}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Reportes
function Reportes() {
  const [ventas, setVentas] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('hoy')
  const [bomberoSeleccionado, setBomberoSeleccionado] = useState('todos')
  const [reporteActivo, setReporteActivo] = useState('rendimiento')

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Cargar ventas
      const resultadoVentas = await ventasServiceClean.obtenerTodas()
      if (resultadoVentas.success) {
        setVentas(resultadoVentas.data || [])
      }
      
      // Cargar usuarios
      const resultadoUsuarios = await usuariosService.obtenerTodos()
      if (resultadoUsuarios.success) {
        setUsuarios(resultadoUsuarios.data || [])
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para formatear fecha y hora
  const formatearFechaHora = (fechaISO) => {
    if (!fechaISO) return 'Sin fecha'
    
    const fecha = new Date(fechaISO)
    return fecha.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Filtrar ventas por período
  const ventasFiltradas = useMemo(() => {
    if (!ventas.length) return []
    
    const ahora = new Date()
    let fechaInicio = new Date()
    
    switch (periodoSeleccionado) {
      case 'hoy':
        fechaInicio.setHours(0, 0, 0, 0)
        break
      case 'ayer':
        fechaInicio.setDate(ahora.getDate() - 1)
        fechaInicio.setHours(0, 0, 0, 0)
        break
      case 'semana':
        fechaInicio.setDate(ahora.getDate() - 7)
        break
      case 'mes':
        fechaInicio.setMonth(ahora.getMonth() - 1)
        break
      case 'todo':
        fechaInicio = new Date('2020-01-01') // Fecha muy antigua
        break
      default:
        fechaInicio.setHours(0, 0, 0, 0)
    }
    
    return ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha_venta || venta.fechaVenta)
      return fechaVenta >= fechaInicio
    })
  }, [ventas, periodoSeleccionado])

  // Filtrar ventas por bombero específico
  const ventasFiltradasPorBombero = useMemo(() => {
    if (bomberoSeleccionado === 'todos') {
      return ventasFiltradas
    }
    
    return ventasFiltradas.filter(venta => {
      const bomberoId = venta.bombero_id || venta.bomberoId
      return bomberoId === bomberoSeleccionado
    })
  }, [ventasFiltradas, bomberoSeleccionado])

  // Obtener lista única de bomberos para el filtro
  const bomberosDisponibles = useMemo(() => {
    const bomberos = new Map()
    
    ventasFiltradas.forEach(venta => {
      const bomberoId = venta.bombero_id || venta.bomberoId
      const bomberoNombre = venta.bombero_nombre || venta.bomberoNombre
      
      if (!bomberos.has(bomberoId)) {
        bomberos.set(bomberoId, {
          id: bomberoId,
          nombre: bomberoNombre
        })
      }
    })
    
    return Array.from(bomberos.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [ventasFiltradas])

  // Agrupar ventas por bombero
  const ventasPorBombero = useMemo(() => {
    if (!ventasFiltradasPorBombero.length) return []
    
    const agrupadas = {}
    
    ventasFiltradasPorBombero.forEach(venta => {
      const bomberoId = venta.bombero_id || venta.bomberoId
      const bomberoNombre = venta.bombero_nombre || venta.bomberoNombre
      
      if (!agrupadas[bomberoId]) {
        agrupadas[bomberoId] = {
          id: bomberoId,
          nombre: bomberoNombre,
          ventas: [],
          totalLitros: 0,
          totalValor: 0,
          cantidadTransacciones: 0
        }
      }
      
      // Agregar venta individual con formato de fecha/hora
      const ventaFormateada = {
        id: venta.id,
        fecha: venta.fecha_venta || venta.fechaVenta,
        fechaFormateada: formatearFechaHora(venta.fecha_venta || venta.fechaVenta),
        surtidor: venta.surtidor_nombre || venta.surtidorNombre || `Surtidor ${venta.surtidor_id || venta.surtidorId}`,
        combustible: venta.tipo_combustible || venta.tipoCombustible,
        cantidad: parseFloat(venta.cantidad || venta.cantidad_litros || venta.cantidadLitros || 0),
        valor: parseFloat(venta.valor_total || venta.valorTotal || 0),
        precioUnitario: parseFloat(venta.precio_unitario || venta.precioUnitario || 0),
        metodoPago: venta.metodo_pago || venta.metodoPago || 'efectivo'
      }
      
      agrupadas[bomberoId].ventas.push(ventaFormateada)
      agrupadas[bomberoId].totalLitros += ventaFormateada.cantidad
      agrupadas[bomberoId].totalValor += ventaFormateada.valor
      agrupadas[bomberoId].cantidadTransacciones += 1
    })
    
    // Ordenar ventas dentro de cada bombero por fecha (más reciente primero)
    Object.values(agrupadas).forEach(bombero => {
      bombero.ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    })
    
    // Ordenar bomberos por total de ventas (descendente)
    return Object.values(agrupadas).sort((a, b) => b.totalValor - a.totalValor)
  }, [ventasFiltradasPorBombero, formatearFechaHora])

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor)
  }

  const formatearLitros = (litros) => {
    return `${litros.toLocaleString('es-CO')} L`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
        <button
          onClick={cargarDatos}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          disabled={loading}
        >
          <span>{loading ? '⏳' : '🔄'}</span>
          <span>Actualizar</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 flex-1"
            >
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mes</option>
              <option value="todo">Todo el Tiempo</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Bombero:</label>
            <select
              value={bomberoSeleccionado}
              onChange={(e) => setBomberoSeleccionado(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 flex-1"
            >
              <option value="todos">Todos los Bomberos</option>
              {bomberosDisponibles.map((bombero) => (
                <option key={bombero.id} value={bombero.id}>
                  {bombero.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Información de filtros activos */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Filtros activos:</span>
            <span className="ml-2">
              {periodoSeleccionado === 'hoy' ? 'Hoy' :
               periodoSeleccionado === 'ayer' ? 'Ayer' :
               periodoSeleccionado === 'semana' ? 'Última Semana' :
               periodoSeleccionado === 'mes' ? 'Último Mes' :
               'Todo el Tiempo'}
            </span>
            {bomberoSeleccionado !== 'todos' && (
              <span className="ml-2">
                • {bomberosDisponibles.find(b => b.id === bomberoSeleccionado)?.nombre || 'Bombero seleccionado'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navegación de reportes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <button
            onClick={() => setReporteActivo('rendimiento')}
            className={`px-4 py-2 rounded-lg ${
              reporteActivo === 'rendimiento'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👥 Rendimiento por Bombero
          </button>
          <button
            onClick={() => setReporteActivo('ventas')}
            className={`px-4 py-2 rounded-lg ${
              reporteActivo === 'ventas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📈 Ventas por Período
          </button>
          <button
            onClick={() => setReporteActivo('combustible')}
            className={`px-4 py-2 rounded-lg ${
              reporteActivo === 'combustible'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ⛽ Consumo por Combustible
          </button>
        </div>
      </div>

      {/* Contenido del reporte activo */}
      {reporteActivo === 'rendimiento' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">👥 Rendimiento por Bombero</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Cargando datos...</div>
            </div>
          ) : ventasPorBombero.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No hay datos de ventas para el período seleccionado</div>
            </div>
          ) : (
            <div className="space-y-6">
              {ventasPorBombero.map((bombero, index) => (
                <div key={bombero.id} className="border border-gray-200 rounded-lg p-4">
                  {/* Header del bombero */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-gray-900">{bombero.nombre}</div>
                        <div className="text-sm text-gray-500">ID: {bombero.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Resumen</div>
                      <div className="font-semibold text-green-600">{formatearMoneda(bombero.totalValor)}</div>
                      <div className="text-sm text-gray-500">{bombero.cantidadTransacciones} ventas • {formatearLitros(bombero.totalLitros)}</div>
                    </div>
                  </div>

                  {/* Tabla de ventas individuales */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">Fecha y Hora</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">Surtidor</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">Combustible</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-700 text-sm">Cantidad</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-700 text-sm">Precio/L</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">Método de Pago</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-700 text-sm">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bombero.ventas.map((venta) => (
                          <tr key={venta.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2 px-3 text-sm text-gray-900">
                              {venta.fechaFormateada}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-700">
                              {venta.surtidor}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-700 capitalize">
                              {venta.combustible}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-900 text-right">
                              {formatearLitros(venta.cantidad)}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-600 text-right">
                              {formatearMoneda(venta.precioUnitario)}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-700">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                venta.metodoPago === 'efectivo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : venta.metodoPago === 'tarjeta'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {venta.metodoPago === 'efectivo' ? '💰 Efectivo' :
                                 venta.metodoPago === 'tarjeta' ? '💳 Tarjeta' :
                                 venta.metodoPago === 'transferencia' ? '🏦 Transferencia' :
                                 '💵 ' + venta.metodoPago}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-sm font-medium text-green-600 text-right">
                              {formatearMoneda(venta.valor)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {reporteActivo === 'ventas' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📈 Ventas por Período</h2>
          <div className="text-center text-gray-500 py-8">
            Gráfico de ventas por día/semana/mes - Por implementar
          </div>
        </div>
      )}

      {reporteActivo === 'combustible' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">⛽ Consumo por Combustible</h2>
          <div className="text-center text-gray-500 py-8">
            Distribución de ventas por tipo de combustible - Por implementar
          </div>
        </div>
      )}
    </div>
  )
}

// Configuración del Sistema
function ConfiguracionSistema() {
  const [configData, setConfigData] = useState({
    estacion: {
      nombre: "Estación Principal",
      ruc: "12345678-9",
      direccion: "Av. Principal #123"
    },
    precios: {
      extra: 12500,
      corriente: 12000,
      acpm: 11000
    },
    seguridad: {
      confirmacionVentas: true,
      backupAutomatico: true,
      notificacionesEmail: false
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Función para guardar configuración
  const handleGuardarConfiguracion = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      // Actualizar precios globales en la base de datos
      const { configuracionService } = await import('../services/supabaseServiceFinal')
      
      // Actualizar configuración de combustibles
      const preciosActualizados = {
        extra: {
          precio_por_litro: configData.precios.extra,
          activo: true,
          fecha_actualizacion: new Date().toISOString()
        },
        corriente: {
          precio_por_litro: configData.precios.corriente,
          activo: true,
          fecha_actualizacion: new Date().toISOString()
        },
        acpm: {
          precio_por_litro: configData.precios.acpm,
          activo: true,
          fecha_actualizacion: new Date().toISOString()
        }
      }
      
      // Actualizar cada tipo de combustible
      for (const [tipo, data] of Object.entries(preciosActualizados)) {
        const resultado = await configuracionService.actualizar(tipo, data)
        if (!resultado.success) {
          throw new Error(`Error actualizando ${tipo}: ${resultado.message}`)
        }
      }
      
      // Actualizar precios en todos los surtidores
      const { surtidoresService } = await import('../services/supabaseServiceFinal')
      const resultadoPrecios = await surtidoresService.actualizarPrecios({
        extra: configData.precios.extra,
        corriente: configData.precios.corriente,
        acpm: configData.precios.acpm
      })
      
      if (!resultadoPrecios.success) {
        throw new Error(`Error actualizando precios en surtidores: ${resultadoPrecios.message}`)
      }
      
      setMessage('✅ Configuración guardada exitosamente')
      
      // Mostrar mensaje por 3 segundos
      setTimeout(() => {
        setMessage('')
      }, 3000)
      
    } catch (err) {
      setError('❌ Error al guardar configuración: ' + err.message)
      console.error('Error guardando configuración:', err)
    } finally {
      setLoading(false)
    }
  }

  // Función para sincronizar datos
  const handleSincronizarDatos = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      // Simular sincronización
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMessage('✅ Datos sincronizados exitosamente')
      
      setTimeout(() => {
        setMessage('')
      }, 3000)
      
    } catch (err) {
      setError('❌ Error al sincronizar datos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
      
      {/* Mensajes de estado */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleGuardarConfiguracion}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🏪 Información de la Estación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Estación</label>
                <input 
                  type="text" 
                  value={configData.estacion.nombre}
                  onChange={(e) => setConfigData({
                    ...configData,
                    estacion: { ...configData.estacion, nombre: e.target.value }
                  })}
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RUC/NIT</label>
                <input 
                  type="text" 
                  value={configData.estacion.ruc}
                  onChange={(e) => setConfigData({
                    ...configData,
                    estacion: { ...configData.estacion, ruc: e.target.value }
                  })}
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input 
                  type="text" 
                  value={configData.estacion.direccion}
                  onChange={(e) => setConfigData({
                    ...configData,
                    estacion: { ...configData.estacion, direccion: e.target.value }
                  })}
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">💰 Configuración de Precios</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gasolina Extra (por litro)</label>
                <input 
                  type="text" 
                  value={configData.precios.extra}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '') // Solo números
                    setConfigData({
                      ...configData,
                      precios: { ...configData.precios, extra: value === '' ? 0 : parseInt(value) }
                    })
                  }}
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                  placeholder="Ingrese el precio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gasolina Corriente (por litro)</label>
                <input 
                  type="text" 
                  value={configData.precios.corriente}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '') // Solo números
                    setConfigData({
                      ...configData,
                      precios: { ...configData.precios, corriente: value === '' ? 0 : parseInt(value) }
                    })
                  }}
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                  placeholder="Ingrese el precio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ACPM (por litro)</label>
                <input 
                  type="text" 
                  value={configData.precios.acpm}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '') // Solo números
                    setConfigData({
                      ...configData,
                      precios: { ...configData.precios, acpm: value === '' ? 0 : parseInt(value) }
                    })
                  }}
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                  placeholder="Ingrese el precio"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🔐 Configuración de Seguridad</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={configData.seguridad.confirmacionVentas}
                  onChange={(e) => setConfigData({
                    ...configData,
                    seguridad: { ...configData.seguridad, confirmacionVentas: e.target.checked }
                  })}
                  className="mr-2" 
                />
                <label className="text-sm text-gray-700">Requerir confirmación para ventas grandes</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={configData.seguridad.backupAutomatico}
                  onChange={(e) => setConfigData({
                    ...configData,
                    seguridad: { ...configData.seguridad, backupAutomatico: e.target.checked }
                  })}
                  className="mr-2" 
                />
                <label className="text-sm text-gray-700">Backup automático diario</label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={configData.seguridad.notificacionesEmail}
                  onChange={(e) => setConfigData({
                    ...configData,
                    seguridad: { ...configData.seguridad, notificacionesEmail: e.target.checked }
                  })}
                  className="mr-2" 
                />
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
                <span className="text-gray-600">{new Date().toLocaleDateString('es-ES')} {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <button 
                type="button"
                onClick={handleSincronizarDatos}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
              >
                {loading ? '🔄 Sincronizando...' : '🔄 Sincronizar Datos'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? '💾 Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </form>
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
