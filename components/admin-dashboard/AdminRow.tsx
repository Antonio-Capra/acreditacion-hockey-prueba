"use client";

import { Acreditacion } from "./AdminContext";

interface AdminRowProps {
  acreditacion: Acreditacion;
  index: number;
  AREA_NAMES: Record<string, string>;
  ESTADO_COLORS: Record<string, string>;
  onOpenDetail: (acred: Acreditacion) => void;
}

export default function AdminRow({
  acreditacion: acred,
  index,
  AREA_NAMES,
  ESTADO_COLORS,
  onOpenDetail,
}: AdminRowProps) {
  return (
    <tr
      className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : ""} hover:bg-blue-50 transition-all`}
    >
      <td className="px-6 py-4 text-sm">
        {acred.nombre} {acred.primer_apellido} {acred.segundo_apellido || ""}
      </td>
      <td className="px-6 py-4 text-sm font-mono">{acred.rut}</td>
      <td className="px-6 py-4 text-sm text-blue-600">{acred.email}</td>
      <td className="px-6 py-4 text-sm">{acred.empresa}</td>
      <td className="px-6 py-4 text-sm font-medium">{AREA_NAMES[acred.area] || acred.area}</td>
      <td className="px-6 py-4 text-sm">{acred.cargo}</td>
      <td className="px-6 py-4 text-sm">
        <div>
          <p className="font-medium">{acred.tipo_credencial}</p>
          {acred.numero_credencial && (
            <p className="text-gray-600 text-xs">#{acred.numero_credencial}</p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm">
        <button
          onClick={() => onOpenDetail(acred)}
          className={`px-3 py-1 text-xs rounded transition-all font-medium ${
            acred.zona_id
              ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
              : "bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"
          }`}
        >
          {acred.zona_id ? `Asignada` : "Asignar Zona"}
        </button>
      </td>
      <td className="px-6 py-4 text-sm">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
            ESTADO_COLORS[acred.status]
          }`}
        >
          {acred.status.charAt(0).toUpperCase() + acred.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {new Date(acred.created_at).toLocaleDateString("es-CL")}
      </td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={() => onOpenDetail(acred)}
          className="px-4 py-2 bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white text-sm rounded-lg hover:shadow-lg transition-all font-semibold hover:scale-105"
        >
          Ver Detalles
        </button>
      </td>
    </tr>
  );
}