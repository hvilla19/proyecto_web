"use client";

import { Search, Warehouse } from "lucide-react";

interface Almacen {
  id: string;
  codigo: string;
  nombre: string;
}

interface ExistenciaToolbarProps {
  almacenes: Almacen[];
  almacenSeleccionado: string;
  onAlmacenChange: (almacenId: string) => void;
  total: number;
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
}

export default function ExistenciaToolbar({
  almacenes,
  almacenSeleccionado,
  onAlmacenChange,
  total,
  busqueda,
  onBusquedaChange,
}: ExistenciaToolbarProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">
            Existencias
          </h1>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            {total}
          </span>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Consulta y administra el stock de productos por almacén.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Warehouse
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={almacenSeleccionado}
            onChange={(e) => onAlmacenChange(e.target.value)}
            className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-72"
          >
            <option value="">Selecciona un almacén</option>

            {almacenes.map((almacen) => (
              <option key={almacen.id} value={almacen.id}>
                {almacen.codigo} - {almacen.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar producto..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-72"
          />
        </div>
      </div>
    </div>
  );
}