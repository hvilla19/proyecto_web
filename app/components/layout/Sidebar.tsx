"use client";

import Link from "next/link";
import { useState } from "react";

export default function Sidebar() {
  const [maestrosOpen, setMaestrosOpen] = useState(true);
  const [inventarioOpen, setInventarioOpen] = useState(true);

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-lg font-semibold text-gray-900">
          Inventario
        </h1>
      </div>

      <nav className="p-4">
        <div className="mb-6">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-gray-400">
            Navegación
          </p>

          <Link
            href="/"
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>Inicio</span>
          </Link>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setMaestrosOpen(!maestrosOpen)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>Maestros</span>
            <span className="text-xs">
              {maestrosOpen ? "−" : "+"}
            </span>
          </button>

          {maestrosOpen && (
            <div className="mt-1 space-y-1 pl-3">
              <Link
                href="/categorias"
                className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Categorías
              </Link>

              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Productos
              </button>

              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Almacenes
              </button>

              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Proveedores
              </button>

              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Unidades de medida
              </button>
            </div>
          )}
        </div>

        <div className="mb-6 space-y-1">
          <button className="flex w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Compras
          </button>

          <button className="flex w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Ventas
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setInventarioOpen(!inventarioOpen)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>Inventario</span>
            <span className="text-xs">
              {inventarioOpen ? "−" : "+"}
            </span>
          </button>

          {inventarioOpen && (
            <div className="mt-1 space-y-1 pl-3">
              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Existencias
              </button>

              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Ingresos
              </button>

              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Salidas
              </button>

              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Transferencias
              </button>

              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Ajustes
              </button>

              <button className="flex w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                Kardex
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <button className="flex w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Reportes
          </button>

          <button className="flex w-full rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Configuración
          </button>
        </div>
      </nav>
    </aside>
  );
}
