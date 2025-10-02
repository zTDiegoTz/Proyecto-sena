import React, { useState } from 'react'
import { useSupabaseGasStation as useGasStation } from '../context/SupabaseGasStationContext'

function Usuarios() {
  const { usuarios, crearUsuario, actualizarUsuario, eliminarUsuario, tienePermiso } = useGasStation()
  
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    email: '',
    rol: 'bombero'
  })

  // Verificar permisos - solo super_admin puede gestionar usuarios
  if (!tienePermiso('todos')) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl font-semibold">
          Acceso Denegado
        </div>
        <p className="text-gray-600 mt-2">
          Solo el Super Administrador puede gestionar usuarios.
        </p>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingUser) {
      actualizarUsuario({ ...formData, id: editingUser.id })
    } else {
      crearUsuario(formData)
    }
    
    resetForm()
    setShowModal(false)
  }

  const handleEdit = (usuario) => {
    setEditingUser(usuario)
    setFormData({
      username: usuario.username,
      password: '',
      nombre: usuario.name,
      email: usuario.email,
      rol: usuario.role
    })
    setShowModal(true)
  }

  const handleDelete = (usuarioId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      eliminarUsuario(usuarioId)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nombre: '',
      email: '',
      rol: 'bombero'
    })
    setEditingUser(null)
  }

  const getRolLabel = (rol) => {
    const roles = {
      super_admin: 'Super Administrador',
      administrador: 'Administrador',
      bombero: 'Bombero'
    }
    return roles[rol] || rol
  }

  const getRolBadge = (rol) => {
    const badges = {
      super_admin: 'bg-purple-100 text-purple-800',
      administrador: 'bg-blue-100 text-blue-800',
      bombero: 'bg-green-100 text-green-800'
    }
    return badges[rol] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          Nuevo Usuario
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
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
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {usuario.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {usuario.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRolBadge(usuario.role)}`}>
                      {getRolLabel(usuario.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Usuario
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña {editingUser && '(dejar vacío para mantener)'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    className="input-field"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <select
                    className="input-field"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="bombero">Bombero</option>
                    <option value="administrador">Administrador</option>
                    <option value="super_admin">Super Administrador</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingUser ? 'Actualizar' : 'Crear'}
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

export default Usuarios
