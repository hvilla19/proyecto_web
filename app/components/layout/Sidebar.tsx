"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  BarChart3,
  Box,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Package,
  Ruler,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tags,
  Truck,
  Warehouse,
} from "lucide-react";

interface SidebarProps {
  abierto: boolean;
  onCerrar: () => void;
}

export default function Sidebar({
  abierto,
  onCerrar,
}: SidebarProps) {
  const pathname = usePathname();

  const [maestrosOpen, setMaestrosOpen] = useState(
    pathname.startsWith("/categorias") ||
    pathname.startsWith("/productos") ||
    pathname.startsWith("/unidades-medida")
  );
  
  const [inventarioOpen, setInventarioOpen] = useState(false);
  
  const categoriasActiva = pathname === "/categorias";
  const productosActiva = pathname === "/productos";
  const unidadesMedidaActiva = pathname === "/unidades-medida";

  const maestrosActivo =
  pathname.startsWith("/categorias") ||
  pathname.startsWith("/productos") ||
  pathname.startsWith("/unidades-medida");

  return (
    <aside
  className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
          abierto
            ? "w-64"
            : "w-0"
        }`}
      >
      <div className="flex min-h-screen w-64 flex-col border-r border-white/5 bg-[#1E1B2E] text-slate-200">

      {/* Marca */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-violet-950/30">
            G
          </div>

          <div>
            <p className="text-sm font-semibold tracking-tight text-white">
              Gestión
            </p>

            <p className="text-xs text-slate-400">
              Sistema empresarial
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCerrar}
          title="Ocultar menú"
          aria-label="Ocultar menú"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {/* Principal */}
        <div className="mb-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Principal
          </p>

          <Link
            href="/"
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/"
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm shadow-indigo-950/20"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard
              className={`h-4 w-4 transition ${
                pathname === "/"
                  ? "text-white"
                  : "text-slate-400 group-hover:text-slate-200"
              }`}
            />

            <span>Dashboard</span>
          </Link>
        </div>

        {/* Maestros */}
        <div className="mb-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Maestros
          </p>

          <button
            type="button"
            onClick={() => setMaestrosOpen(!maestrosOpen)}
            className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              maestrosActivo
                ? "bg-white/5 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3">
              <ClipboardList
                className={`h-4 w-4 transition ${
                  maestrosActivo
                    ? "text-violet-300"
                    : "text-slate-400 group-hover:text-slate-200"
                }`}
              />

              <span>Maestros</span>
            </span>

            {maestrosOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {maestrosOpen && (
            <div className="relative mt-1 space-y-0.5 pl-4">
              <div className="absolute bottom-2 left-2 top-2 w-px bg-white/10" />

              {/* Categorías */}
              <Link
                href="/categorias"
                className={`group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition ${
                  categoriasActiva
                    ? "border-violet-400 bg-violet-500/10 text-violet-200"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Tags
                  className={`h-4 w-4 transition ${
                    categoriasActiva
                      ? "text-violet-300"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />

                <span>Categorías</span>
              </Link>

              {/* Productos */}
              <Link
                href="/productos"
                className={`group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition ${
                  productosActiva
                    ? "border-violet-400 bg-violet-500/10 text-violet-200"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Package
                  className={`h-4 w-4 transition ${
                    productosActiva
                      ? "text-violet-300"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />

                <span>Productos</span>
              </Link>

              {/* Almacenes */}
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                <Warehouse className="h-4 w-4 text-slate-500 transition group-hover:text-slate-300" />

                <span>Almacenes</span>
              </button>

              {/* Proveedores */}
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                <Truck className="h-4 w-4 text-slate-500 transition group-hover:text-slate-300" />

                <span>Proveedores</span>
              </button>

              {/* Unidades de medida */}
              <Link
                href="/unidades-medida"
                className={`group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition ${
                  unidadesMedidaActiva
                    ? "border-violet-400 bg-violet-500/10 text-violet-200"
                    : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Ruler
                  className={`h-4 w-4 transition ${
                    unidadesMedidaActiva
                      ? "text-violet-300"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />

                <span>Unidades de medida</span>
              </Link>
            </div>
          )}
        </div>

        {/* Operaciones */}
        <div className="mb-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Operaciones
          </p>

          <div className="space-y-0.5">
            {/* Compras */}
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <ShoppingCart className="h-4 w-4 text-slate-400 transition group-hover:text-slate-200" />

              <span>Compras</span>
            </button>

            {/* Ventas */}
            <button
              type="button"
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <ShoppingBag className="h-4 w-4 text-slate-400 transition group-hover:text-slate-200" />

              <span>Ventas</span>
            </button>
          </div>
        </div>

        {/* Inventario */}
        <div className="mb-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Inventario
          </p>

          <button
            type="button"
            onClick={() => setInventarioOpen(!inventarioOpen)}
            className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <span className="flex items-center gap-3">
              <Package className="h-4 w-4 text-slate-400 transition group-hover:text-slate-200" />

              <span>Inventario</span>
            </span>

            {inventarioOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {inventarioOpen && (
            <div className="relative mt-1 space-y-0.5 pl-4">
              <div className="absolute bottom-2 left-2 top-2 w-px bg-white/10" />

              {/* Existencias */}
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                <Box className="h-4 w-4 text-slate-500 transition group-hover:text-slate-300" />

                <span>Existencias</span>
              </button>

              {/* Ingresos */}
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                <Truck className="h-4 w-4 text-slate-500 transition group-hover:text-slate-300" />

                <span>Ingresos</span>
              </button>

              {/* Salidas */}
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                <ShoppingBag className="h-4 w-4 text-slate-500 transition group-hover:text-slate-300" />

                <span>Salidas</span>
              </button>

              {/* Transferencias */}
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                <Store className="h-4 w-4 text-slate-500 transition group-hover:text-slate-300" />

                <span>Transferencias</span>
              </button>

              {/* Ajustes */}
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                <ClipboardList className="h-4 w-4 text-slate-500 transition group-hover:text-slate-300" />

                <span>Ajustes</span>
              </button>

              {/* Kardex */}
              <button
                type="button"
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                <BarChart3 className="h-4 w-4 text-slate-500 transition group-hover:text-slate-300" />

                <span>Kardex</span>
              </button>
            </div>
          )}
        </div>

        {/* Análisis */}
        <div className="mb-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Análisis
          </p>

          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <BarChart3 className="h-4 w-4 text-slate-400 transition group-hover:text-slate-200" />

            <span>Reportes</span>
          </button>
        </div>

        {/* Configuración */}
        <div>
          <button
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-4 w-4 text-slate-400 transition group-hover:text-slate-200" />

            <span>Configuración</span>
          </button>
        </div>
      </nav>
      </div>
    </aside>
  );
}
