"use client";

import AdminRow from "./AdminRow";
import { Acreditacion } from "./AdminContext";

interface AdminTableProps {
  filteredAcreditaciones: Acreditacion[];
  AREA_NAMES: Record<string, string>;
  ESTADO_COLORS: Record<string, string>;
  onOpenDetail: (acred: Acreditacion) => void;
}

export default function AdminTable({
  filteredAcreditaciones,
  AREA_NAMES,
  ESTADO_COLORS,
  onOpenDetail,
}: AdminTableProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden mt-16">
      {/* Header de la Tabla */}
      <div className="bg-gradient-to-r from-[#1e5799] to-[#2989d8] px-6 py-5">
        <h2 className="text-xl font-bold text-white flex items-center justify-between">
          <span>Lista de Acreditaciones</span>
          <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
            {filteredAcreditaciones.length} resultado{filteredAcreditaciones.length !== 1 ? 's' : ''}
          </span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">RUT</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Área</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cargo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Credencial</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Zona</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Ver Detalles</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAcreditaciones.map((acred, idx) => (
              <AdminRow
                key={acred.id}
                acreditacion={acred}
                index={idx}
                AREA_NAMES={AREA_NAMES}
                ESTADO_COLORS={ESTADO_COLORS}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredAcreditaciones.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No hay acreditaciones que coincidan con los filtros
        </div>
      )}
    </div>
  );
}