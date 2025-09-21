import React, { useState, useMemo } from 'react'
import { useSupabaseGasStation as useGasStation } from '../context/SupabaseGasStationContext'

function Turnos() {
  const { 
    turnos, 
    usuarios, 
    iniciarTurno, 
    finalizarTurno, 
    usuarioActual, 
    tienePermiso 
  } = useGasStation()
  
  const [filtroBombero, setFiltroBombero] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  // Verificar permisos
  if (!tienePermiso('gestionar_turnos') && !tienePermiso('gestionar_turno_propio')) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl font-semibold">
          Acceso Denegado
        </div>
        <p className="text-gray-600 mt-2">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    )
  }

  // Filtrar turnos según permisos y filtros
  const turnosFiltrados = useMemo(() => {
    let filtrados = turnos

    // Si es bombero, solo ver sus propios turnos
    if (usuarioActual?.rol === 'bombero') {
      filtrados = turnos.filter(turno => turno.bomberoId === usuarioActual.id)
    }

    // Aplicar filtros
    if (filtroBombero) {
      filtrados = filtrados.filter(turno => 
        turno.bomberoNombre.toLowerCase().includes(filtroBombero.toLowerCase())
      )
    }

    if (filtroEstado !== 'todos') {
      filtrados = filtrados.filter(turno => 
        filtroEstado === 'activos' ? turno.activo : !turno.activo
      )
    }

    return filtrados.sort((a, b) => new Date(b.horaEntrada) - new Date(a.horaEntrada))
  }, [turnos, filtroBombero, filtroEstado, usuarioActual])

  // Obtener bomberos disponibles
  const bomberos = usuarios.filter(usuario => usuario.rol === 'bombero' && usuario.activo)

  // Verificar si el usuario actual tiene un turno activo
  const turnoActivo = turnos.find(turno => 
    turno.bomberoId === usuarioActual?.id && turno.activo
  )

  const handleIniciarTurno = () => {
    if (usuarioActual) {
      iniciarTurno(usuarioActual.id, usuarioActual.nombre)
    }
  }

  const handleFinalizarTurno = (turnoId) => {
    finalizarTurno(turnoId)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calcularDuracion = (entrada, salida) => {
    const inicio = new Date(entrada)
    const fin = salida ? new Date(salida) : new Date()
    const duracion = fin - inicio
    
    const horas = Math.floor(duracion / (1000 * 60 * 60))
    const minutos = Math.floor((duracion % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${horas}h ${minutos}m`
  }

  const getEstadisticas = () => {
    const hoy = new Date().toDateString()
    const turnosHoy = turnosFiltrados.filter(turno => 
      new Date(turno.horaEntrada).toDateString() === hoy
    )
    
    const activos = turnosHoy.filter(turno => turno.activo).length
    const completados = turnosHoy.filter(turno => !turno.activo).length
    
    return { activos, completados, total: turnosHoy.length }
  }

  const estadisticas = getEstadisticas()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Control de Turnos</h1>
        
        {/* Botón para iniciar/finalizar turno propio */}
        {usuarioActual?.rol === 'bombero' && (
          <div className="flex space-x-3">
            {!turnoActivo ? (
              <button
                onClick={handleIniciarTurno}
                className="btn-primary"
              >
                Iniciar Turno
              </button>
            ) : (
              <button
                onClick={() => handleFinalizarTurno(turnoActivo.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Finalizar Turno
              </button>
            )}
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Turnos Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{estadisticas.activos}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completados Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{estadisticas.completados}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{estadisticas.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Bombero
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por nombre..."
              value={filtroBombero}
              onChange={(e) => setFiltroBombero(e.target.value)}
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              className="input-field"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="completados">Completados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de turnos */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bombero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora Salida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
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
              {turnosFiltrados.map((turno) => (
                <tr key={turno.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {turno.bomberoNombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatearFecha(turno.horaEntrada)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {turno.horaSalida ? formatearFecha(turno.horaSalida) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {calcularDuracion(turno.horaEntrada, turno.horaSalida)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      turno.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {turno.activo ? 'Activo' : 'Completado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {turno.activo && (
                      <button
                        onClick={() => handleFinalizarTurno(turno.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Finalizar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {turnosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron turnos</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Turnos










