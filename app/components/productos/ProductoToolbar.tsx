"use client";

import { Search } from "lucide-react";

interface ProductoToolbarProps {
  cantidad: number;
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
}

export default function ProductoToolbar({
  cantidad,
  busqueda,
  onBusquedaChange,
}: ProductoToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-violet-800">
            Productos
          </h1>

          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
            {cantidad} {cantidad === 1 ? "registro" : "registros"}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Administra los productos registrados en tu inventario.
        </p>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type="text"
          value={busqueda}
          onChange={(event) => onBusquedaChange(event.target.value)}
          placeholder="Buscar por código o nombre..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </div>
    </div>
  );
}