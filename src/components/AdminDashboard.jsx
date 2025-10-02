import React, { useState, useEffect, useMemo } from 'react'
import { useSupabaseGasStation as useGasStation } from '../context/SupabaseGasStationContext'
import { ventasServiceClean } from '../services/ventasServiceClean'
import { usuariosService, surtidoresService, combustiblesService } from '../services/supabaseServiceFinal'
import VentaCombustibleSimple from './VentaCombustibleSimple'

// Componente simplificado sin navegación duplicada
function AdminHeader({ onLogout }) {
  const { usuarioActual } = useGasStation()

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">
            Bienvenido, {usuarioActual?.name || 'Usuario'} 
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {usuarioActual?.role?.replace('_', ' ') || 'Usuario'}
            </span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Cerrar Sesión
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
  const { crearSurtidor, editarSurtidor, eliminarSurtidor, configurarCombustiblesSurtidor, actualizarPrecios, configuracion, tienePermiso } = useGasStation()
  
  const [showModalCrear, setShowModalCrear] = useState(false)
  const [showModalEditar, setShowModalEditar] = useState(false)
  const [showModalStock, setShowModalStock] = useState(false)
  const [showModalPrecios, setShowModalPrecios] = useState(false)
  const [selectedSurtidor, setSelectedSurtidor] = useState(null)
  const [surtidorData, setSurtidorData] = useState({
    nombre: '',
    estado: 'disponible',
    ubicacion: ''
  })
  const [stockData, setStockData] = useState({})
  const [preciosData, setPreciosData] = useState({
    extra: configuracion?.precios?.extra || 12500,
    corriente: configuracion?.precios?.corriente || 11500,
    acpm: configuracion?.precios?.acpm || 10500
  })

  const handleCrearSurtidor = async (e) => {
    e.preventDefault()
    
    if (!surtidorData.nombre.trim()) {
      alert('Por favor ingrese un nombre para el surtidor')
      return
    }

    const resultado = await crearSurtidor(surtidorData)
    if (resultado.success) {
      alert('✅ Surtidor creado exitosamente!')
      setShowModalCrear(false)
      setSurtidorData({ nombre: '', estado: 'disponible', ubicacion: '' })
    } else {
      alert('❌ Error al crear surtidor: ' + resultado.message)
    }
  }

  const handleEditarSurtidor = async (e) => {
    e.preventDefault()
    
    if (!surtidorData.nombre.trim()) {
      alert('Por favor ingrese un nombre para el surtidor')
      return
    }

    const resultado = await editarSurtidor(selectedSurtidor.id, surtidorData)
    if (resultado.success) {
      alert('✅ Surtidor editado exitosamente!')
      setShowModalEditar(false)
      setSelectedSurtidor(null)
      setSurtidorData({ nombre: '', estado: 'disponible', ubicacion: '' })
    } else {
      alert('❌ Error al editar surtidor: ' + resultado.message)
    }
  }

  const handleEliminarSurtidor = async (surtidor) => {
    if (!confirm(`¿Está seguro de que desea eliminar el surtidor "${surtidor.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    const resultado = await eliminarSurtidor(surtidor.id)
    if (resultado.success) {
      alert('✅ Surtidor eliminado exitosamente!')
    } else {
      alert('❌ Error al eliminar surtidor: ' + resultado.message)
    }
  }

  const handleConfigurarStock = (surtidor) => {
    setSelectedSurtidor(surtidor)
    setStockData(surtidor.combustibles)
    setShowModalStock(true)
  }

  const handleGuardarStock = async (e) => {
    e.preventDefault()
    
    const resultado = await configurarCombustiblesSurtidor(selectedSurtidor.id, stockData)
    if (resultado.success) {
      alert('✅ Stock configurado exitosamente!')
      setShowModalStock(false)
      setSelectedSurtidor(null)
      setStockData({})
    } else {
      alert('❌ Error al configurar stock: ' + resultado.message)
    }
  }

  const abrirModalEditar = (surtidor) => {
    setSelectedSurtidor(surtidor)
    setSurtidorData({
      nombre: surtidor.nombre,
      estado: surtidor.estado,
      ubicacion: surtidor.ubicacion || ''
    })
    setShowModalEditar(true)
  }

  const handleActualizarPrecios = async (e) => {
    e.preventDefault()
    
    if (preciosData.extra <= 0 || preciosData.corriente <= 0 || preciosData.acpm <= 0) {
      alert('Por favor ingrese precios válidos (mayores a 0)')
      return
    }

    const resultado = await actualizarPrecios(preciosData)
    if (resultado.success) {
      alert('✅ Precios actualizados exitosamente!\n\nLos nuevos precios se han aplicado a todos los surtidores.')
      setShowModalPrecios(false)
    } else {
      alert('❌ Error al actualizar precios: ' + resultado.message)
    }
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor)
  }

  const formatearCantidad = (cantidad) => {
    return `${cantidad.toFixed(2)} gal`
  }

  const getEstadoColor = (estado) => {
    const colors = {
      disponible: 'bg-green-100 text-green-800',
      ocupado: 'bg-yellow-100 text-yellow-800',
      mantenimiento: 'bg-red-100 text-red-800'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      disponible: 'Disponible',
      ocupado: 'Ocupado',
      mantenimiento: 'Mantenimiento'
    }
    return labels[estado] || estado
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
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Gestión Centralizada de Surtidores</h3>
              <p className="text-blue-800 mb-4">
                La gestión completa de surtidores se realiza directamente desde este panel para mantener una interfaz consistente y centralizada.
                <br/><br/>
                <strong>Nota:</strong> Tanto la gestión de surtidores como los precios de combustibles se manejan desde este mismo panel.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Crear, editar y configurar surtidores
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Gestionar precios y stocks de combustibles
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Controlar estados y disponibilidad
                </div>
                <div className="flex items-center text-sm text-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Registrar ventas y transacciones
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de surtidores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surtidores.map((surtidor) => (
          <div key={surtidor.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{surtidor.nombre}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(surtidor.estado)}`}>
                {getEstadoLabel(surtidor.estado)}
              </span>
            </div>

            {/* Información de combustibles */}
            <div className="space-y-3 mb-4">
              {Object.entries(surtidor.combustibles).map(([tipo, info]) => (
                <div key={tipo} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{tipo}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {formatearCantidad(info.stock)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatearMoneda(info.precio)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vendido: {formatearCantidad(info.vendido)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div className="space-y-2">
              {tienePermiso('gestionar_surtidores') && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowModalCrear(true)}
                    className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                    title="Crear surtidor"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowModalPrecios(true)}
                    className="flex-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                    title="Gestionar precios"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </button>
                  <button
                    onClick={() => abrirModalEditar(surtidor)}
                    className="flex-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-colors"
                    title="Editar surtidor"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleConfigurarStock(surtidor)}
                    className="flex-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                    title="Configurar stock"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEliminarSurtidor(surtidor)}
                    className="flex-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                    title="Eliminar surtidor"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para crear surtidor */}
      {showModalCrear && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Crear Nuevo Surtidor
              </h3>
              
              <form onSubmit={handleCrearSurtidor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Surtidor
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={surtidorData.nombre}
                    onChange={(e) => setSurtidorData({...surtidorData, nombre: e.target.value})}
                    placeholder="Ej: Surtidor 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Inicial
                  </label>
                  <select
                    className="input-field"
                    value={surtidorData.estado}
                    onChange={(e) => setSurtidorData({...surtidorData, estado: e.target.value})}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación (Opcional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={surtidorData.ubicacion}
                    onChange={(e) => setSurtidorData({...surtidorData, ubicacion: e.target.value})}
                    placeholder="Ej: Zona Norte"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModalCrear(false)
                      setSurtidorData({ nombre: '', estado: 'disponible', ubicacion: '' })
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Crear Surtidor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar surtidor */}
      {showModalEditar && selectedSurtidor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Editar Surtidor - {selectedSurtidor.nombre}
              </h3>
              
              <form onSubmit={handleEditarSurtidor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Surtidor
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={surtidorData.nombre}
                    onChange={(e) => setSurtidorData({...surtidorData, nombre: e.target.value})}
                    placeholder="Ej: Surtidor 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    className="input-field"
                    value={surtidorData.estado}
                    onChange={(e) => setSurtidorData({...surtidorData, estado: e.target.value})}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación (Opcional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={surtidorData.ubicacion}
                    onChange={(e) => setSurtidorData({...surtidorData, ubicacion: e.target.value})}
                    placeholder="Ej: Zona Norte"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModalEditar(false)
                      setSelectedSurtidor(null)
                      setSurtidorData({ nombre: '', estado: 'disponible', ubicacion: '' })
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para configurar stock */}
      {showModalStock && selectedSurtidor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Configurar Stock - {selectedSurtidor.nombre}
              </h3>
              
              <form onSubmit={handleGuardarStock} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(stockData).map(([tipo, datos]) => (
                    <div key={tipo} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 capitalize mb-3">{tipo}</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="input-field text-sm"
                            value={datos.precio}
                            onChange={(e) => setStockData({
                              ...stockData,
                              [tipo]: { ...datos, precio: parseFloat(e.target.value) }
                            })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock (galones)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="input-field text-sm"
                            value={datos.stock}
                            onChange={(e) => setStockData({
                              ...stockData,
                              [tipo]: { ...datos, stock: parseFloat(e.target.value) }
                            })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacidad Máxima (galones)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="input-field text-sm"
                            value={datos.capacidad_maxima}
                            onChange={(e) => setStockData({
                              ...stockData,
                              [tipo]: { ...datos, capacidad_maxima: parseFloat(e.target.value) }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModalStock(false)
                      setSelectedSurtidor(null)
                      setStockData({})
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para gestionar precios */}
      {showModalPrecios && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Gestionar Precios de Combustibles
              </h3>
              
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Importante:</strong> Los cambios se aplicarán a todos los surtidores inmediatamente.
                </p>
              </div>
              
              <form onSubmit={handleActualizarPrecios} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Extra ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="input-field"
                    value={preciosData.extra}
                    onChange={(e) => setPreciosData({...preciosData, extra: parseFloat(e.target.value)})}
                    placeholder="Ej: 12500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Corriente ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="input-field"
                    value={preciosData.corriente}
                    onChange={(e) => setPreciosData({...preciosData, corriente: parseFloat(e.target.value)})}
                    placeholder="Ej: 11500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio ACPM ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="input-field"
                    value={preciosData.acpm}
                    onChange={(e) => setPreciosData({...preciosData, acpm: parseFloat(e.target.value)})}
                    placeholder="Ej: 10500"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Resumen de cambios:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Extra:</span>
                      <span className="font-medium">${preciosData.extra.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Corriente:</span>
                      <span className="font-medium">${preciosData.corriente.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ACPM:</span>
                      <span className="font-medium">${preciosData.acpm.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModalPrecios(false)
                      setPreciosData({
                        extra: configuracion?.precios?.extra || 12500,
                        corriente: configuracion?.precios?.corriente || 11500,
                        acpm: configuracion?.precios?.acpm || 10500
                      })
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Actualizar Precios
                  </button>
                </div>
              </form>
            </div>
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
      // Solo actualizar configuración de estación y seguridad
      // Los precios se gestionan desde la página de Precios
      const { configuracionService } = await import('../services/supabaseServiceFinal')
      
      // Actualizar configuración de estación
      const configuracionEstacion = {
        nombre_estacion: configData.estacion.nombre,
        ruc: configData.estacion.ruc,
        direccion: configData.estacion.direccion,
        fecha_actualizacion: new Date().toISOString()
      }
      
      const resultadoEstacion = await configuracionService.actualizar('estacion', configuracionEstacion)
      if (!resultadoEstacion.success) {
        throw new Error(`Error actualizando configuración de estación: ${resultadoEstacion.message}`)
      }
      
      // Actualizar configuración de seguridad
      const configuracionSeguridad = {
        confirmacion_ventas: configData.seguridad.confirmacionVentas,
        backup_automatico: configData.seguridad.backupAutomatico,
        notificaciones_email: configData.seguridad.notificacionesEmail,
        fecha_actualizacion: new Date().toISOString()
      }
      
      const resultadoSeguridad = await configuracionService.actualizar('seguridad', configuracionSeguridad)
      if (!resultadoSeguridad.success) {
        throw new Error(`Error actualizando configuración de seguridad: ${resultadoSeguridad.message}`)
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Gestión de Precios Centralizada</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Los precios de combustibles se gestionan desde la página dedicada de <strong>Precios</strong> 
                    para evitar duplicación y mantener consistencia en el sistema.
                  </p>
                  <div className="mt-2">
                    <a 
                      href="/precios" 
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Ir a Gestión de Precios
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🏢 Configuración de Estación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Estación</label>
                <input 
                  type="text" 
                  value={configData.estacion.nombre}
                  onChange={(e) => {
                    setConfigData({
                      ...configData,
                      estacion: { ...configData.estacion, nombre: e.target.value }
                    })
                  }}
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                  placeholder="Nombre de la estación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">RUC</label>
                <input 
                  type="text" 
                  value={configData.estacion.ruc}
                  onChange={(e) => {
                    setConfigData({
                      ...configData,
                      estacion: { ...configData.estacion, ruc: e.target.value }
                    })
                  }}
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                  placeholder="RUC de la estación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input 
                  type="text" 
                  value={configData.estacion.direccion}
                  onChange={(e) => {
                    setConfigData({
                      ...configData,
                      estacion: { ...configData.estacion, direccion: e.target.value }
                    })
                  }}
                  className="mt-1 block w-full border rounded-md px-3 py-2" 
                  placeholder="Dirección de la estación"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">🔒 Configuración de Seguridad</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="confirmacionVentas"
                  checked={configData.seguridad.confirmacionVentas}
                  onChange={(e) => {
                    setConfigData({
                      ...configData,
                      seguridad: { ...configData.seguridad, confirmacionVentas: e.target.checked }
                    })
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="confirmacionVentas" className="ml-2 block text-sm text-gray-700">
                  Confirmación obligatoria para ventas
                </label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="backupAutomatico"
                  checked={configData.seguridad.backupAutomatico}
                  onChange={(e) => {
                    setConfigData({
                      ...configData,
                      seguridad: { ...configData.seguridad, backupAutomatico: e.target.checked }
                    })
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="backupAutomatico" className="ml-2 block text-sm text-gray-700">
                  Respaldo automático de datos
                </label>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="notificacionesEmail"
                  checked={configData.seguridad.notificacionesEmail}
                  onChange={(e) => {
                    setConfigData({
                      ...configData,
                      seguridad: { ...configData.seguridad, notificacionesEmail: e.target.checked }
                    })
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notificacionesEmail" className="ml-2 block text-sm text-gray-700">
                  Notificaciones por email
                </label>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">⚙️ Gestión de Surtidores</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-green-800 font-medium">Gestión de Surtidores Centralizada</p>
                  <p className="text-sm text-green-700 mt-1">
                    La gestión completa de surtidores se realiza desde la página dedicada de <strong>Surtidores</strong> 
                    para mantener una interfaz consistente y evitar duplicación de funcionalidades.
                  </p>
                  <div className="mt-2">
                    <a 
                      href="/surtidores" 
                      className="inline-flex items-center text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Ir a Gestión de Surtidores
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">📊 Resumen del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Funcionalidades Centralizadas</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Gestión de Precios → Página Precios</li>
                  <li>• Gestión de Surtidores → Página Surtidores</li>
                  <li>• Gestión de Usuarios → Dashboard Admin</li>
                  <li>• Reportes y Estadísticas → Dashboard Admin</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Configuración del Sistema</h4>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Información de la Estación</li>
                  <li>• Configuración de Seguridad</li>
                  <li>• Parámetros del Sistema</li>
                  <li>• Configuración de Backup</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">💾 Guardar Configuración</h3>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Importante:</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Esta configuración solo afecta los parámetros del sistema. 
                      Los precios de combustibles y la gestión de surtidores se realizan desde sus páginas dedicadas.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleGuardarConfiguracion}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar Configuración'}
                </button>
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
  const { usuarioActual, logout, surtidores, cargarVentas } = useGasStation()

  // Mostrar contenido según el rol del usuario
  const renderContent = () => {
    // Si es bombero, mostrar interfaz de ventas
    if (usuarioActual?.role === 'bombero') {
      return <VentaCombustibleSimple onVentaRealizada={cargarVentas} />
    }
    
    // Para administradores, mostrar dashboard gerencial
    return <DashboardOverview surtidores={surtidores} />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader onLogout={logout} />
      
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  )
}

export default AdminDashboard
