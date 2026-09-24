"use client";

import { Plus, Search } from "lucide-react";

interface CategoriaToolbarProps {
  total: number;
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  onNuevaCategoria: () => void;
}

export default function CategoriaToolbar({
  total,
  busqueda,
  onBusquedaChange,
  onNuevaCategoria,
}: CategoriaToolbarProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Categorías
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Administra las categorías de tus productos.
          </p>
        </div>

        <button
          type="button"
          onClick={onNuevaCategoria}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva categoría</span>
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={busqueda}
            onChange={(event) => onBusquedaChange(event.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
          />
        </div>

        <div className="whitespace-nowrap text-sm text-gray-500">
          Total: <span className="font-medium text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  );
}
