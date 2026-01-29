"use client";

interface AdminStatsProps {
  acreditaciones: Array<{ status: string }>;
}

export default function AdminStats({ acreditaciones }: AdminStatsProps) {
  const total = acreditaciones.length;
  const pendientes = acreditaciones.filter(a => a.status === 'pendiente').length;
  const aprobadas = acreditaciones.filter(a => a.status === 'aprobado').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Acreditaciones</p>
            <p className="text-4xl font-bold text-black mt-2">{total}</p>
          </div>
          <div className="text-5xl">
            📋
          </div>
        </div>
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Pendientes</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{pendientes}</p>
          </div>
          <div className="text-5xl">
            ⏳
          </div>
        </div>
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Aprobadas</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{aprobadas}</p>
          </div>
          <div className="text-5xl ">
            ✅
          </div>
        </div>
      </div>
    </div>
  );
}