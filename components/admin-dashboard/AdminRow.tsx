"use client";

import { useState, useEffect, useRef } from "react";
import { Acreditacion } from "./AdminContext";
import { useAdmin } from "./AdminContext";

interface AdminRowProps {
  acreditacion: Acreditacion;
  index: number;
  AREA_NAMES: Record<string, string>;
  ESTADO_COLORS: Record<string, string>;
  onOpenDetail: (acred: Acreditacion) => void;
  onConfirmAction: (type: "aprobado" | "rechazado", message: string, onConfirm: () => void) => void;
}

export default function AdminRow({
  acreditacion: acred,
  index,
  AREA_NAMES,
  ESTADO_COLORS,
  onOpenDetail,
  onConfirmAction,
}: AdminRowProps) {
  const { zonas, assignZonaDirect, updateEstadoDirect } = useAdmin();
  const [showZonaDropdown, setShowZonaDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowZonaDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleZonaSelect = (zonaId: number | null) => {
    assignZonaDirect(acred, zonaId);
    setShowZonaDropdown(false);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowZonaDropdown(!showZonaDropdown);
  };

  const handleZonaOptionClick = (e: React.MouseEvent, zonaId: number | null) => {
    e.preventDefault();
    e.stopPropagation();
    handleZonaSelect(zonaId);
  };

  const handleApproveClick = () => {
    onConfirmAction("aprobado", `¿Estás seguro de que quieres aprobar la acreditación de ${acred.nombre} ${acred.primer_apellido} de ${acred.empresa}?`, () => updateEstadoDirect(acred, "aprobado"));
  };

  const handleRejectClick = () => {
    onConfirmAction("rechazado", `¿Estás seguro de que quieres rechazar la acreditación de ${acred.nombre} ${acred.primer_apellido} de ${acred.empresa}?`, () => updateEstadoDirect(acred, "rechazado"));
  };

  const currentZonaName = acred.zona_id 
    ? zonas.find(z => z.id === acred.zona_id)?.nombre || "Desconocida" 
    : "Sin asignar";

  return (
    <tr
      className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : ""} hover:bg-blue-50 transition-all ${
        acred.status === "aprobado" ? "bg-green-100" : acred.status === "rechazado" ? "bg-red-100" : ""
      }`}
    >
      <td className="px-6 py-4 text-sm">
        {acred.nombre} {acred.primer_apellido} {acred.segundo_apellido || ""}
      </td>
      <td className="px-6 py-4 text-sm font-mono">{acred.rut}</td>
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
      <td className="px-6 py-4 text-sm relative">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={handleDropdownToggle}
            className={`px-3 py-1 text-xs rounded transition-all font-medium flex items-center gap-1 ${
              acred.zona_id
                ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"
            }`}
          >
            {currentZonaName}
            <svg className={`w-3 h-3 transition-transform ${showZonaDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showZonaDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button
                  type="button"
                  onClick={(e) => handleZonaOptionClick(e, null)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                >
                  Sin asignar
                </button>
                {zonas.map((zona) => (
                  <button
                    key={zona.id}
                    type="button"
                    onClick={(e) => handleZonaOptionClick(e, zona.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  >
                    {zona.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
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
      <td className="px-6 py-4 text-center">
        <button
          type="button"
          onClick={() => onOpenDetail(acred)}
          className="px-3 py-1 bg-gradient-to-r from-[#1e5799] to-[#2989d8] text-white text-xs rounded-lg hover:shadow-lg transition-all font-semibold hover:scale-105"
        >
          Ver Detalles
        </button>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex gap-1 justify-center">
          <button
            type="button"
            title="Aprobar solicitud"
            onClick={handleApproveClick}
            disabled={acred.status === "aprobado"}
            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓
          </button>
          <button
            type="button"
            title="Rechazar solicitud"
            onClick={handleRejectClick}
            disabled={acred.status === "rechazado"}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  );
}