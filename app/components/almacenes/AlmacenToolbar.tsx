"use client";

import { Search } from "lucide-react";

interface AlmacenToolbarProps {
  total: number;
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
}

export default function AlmacenToolbar({
  total,
  busqueda,
  onBusquedaChange,
}: AlmacenToolbarProps) {
  return (
    <div className="mb-2">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Información */}
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-violet-800">
              Almacenes
            </h2>

            <span className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
              {total} {total === 1 ? "registro" : "registros"}
            </span>
          </div>

          <p className="mt-0.5 text-sm text-slate-500">
            Organiza y administra los almacenes de tu empresa.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={busqueda}
            onChange={(event) => onBusquedaChange(event.target.value)}
            placeholder="Buscar por código o nombre..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10"
          />
        </div>
      </div>
    </div>
  );
}