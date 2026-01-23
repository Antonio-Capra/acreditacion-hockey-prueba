"use client";

interface AdminFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  estadoFilter: string;
  setEstadoFilter: (filter: string) => void;
  onRefresh: () => void;
}

export default function AdminFilters({
  searchTerm,
  setSearchTerm,
  estadoFilter,
  setEstadoFilter,
  onRefresh,
}: AdminFiltersProps) {
  return (
    <div className="mb-6">
      {/* Encabezado del Panel */}
      <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl px-6 py-4 shadow-lg">
        <h2 className="text-lg font-bold text-[#1e5799]">
          Filtros y Búsqueda
        </h2>
      </div>

      {/* Contenido del Panel */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-b-2xl shadow-lg">
        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, email, RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1e5799] focus:ring-2 focus:ring-[#1e5799]/20 focus:outline-none transition-all shadow-sm"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={onRefresh}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}