"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import ProductoModal from "./ProductoModal";
import ProductoConfirmModal from "./ProductoConfirmModal";
import ProductoToolbar from "./ProductoToolbar";

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoriaId: string;
  unidadMedidaId: string;
  activo: boolean;
  categoria: {
    id: string;
    codigo: string;
    nombre: string;
  };
  unidadMedida: {
    id: string;
    codigo: string;
    nombre: string;
    decimalesPermitidos: number;
  };
}

interface ApiResponse {
  ok: boolean;
  data: Producto[];
  message?: string;
}

export default function ProductoTable() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  const [confirmAbierto, setConfirmAbierto] = useState(false);
  const [productoAEliminar, setProductoAEliminar] =
    useState<Producto | null>(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargarProductos() {
    try {
      setCargando(true);
      setError("");

      const response = await fetch("/api/productos");

      if (!response.ok) {
        throw new Error("No se pudieron cargar los productos.");
      }

      const result: ApiResponse = await response.json();

      if (!result.ok) {
        throw new Error(
          result.message || "No se pudieron cargar los productos."
        );
      }

      setProductos(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar los productos."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return productos;
    }

    return productos.filter((producto) => {
      return (
        producto.codigo.toLowerCase().includes(termino) ||
        producto.nombre.toLowerCase().includes(termino) ||
        producto.categoria.nombre.toLowerCase().includes(termino)
      );
    });
  }, [productos, busqueda]);

  function abrirNuevo() {
    setProductoSeleccionado(null);
    setModalAbierto(true);
  }

  function abrirEditar(producto: Producto) {
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  }

  function productoGuardado(producto: Producto) {
    setProductos((actuales) => {
      const existe = actuales.some((item) => item.id === producto.id);

      if (existe) {
        return actuales.map((item) =>
          item.id === producto.id ? producto : item
        );
      }

      return [...actuales, producto];
    });

    cerrarModal();
  }

  function abrirConfirmacion(producto: Producto) {
    setProductoAEliminar(producto);
    setConfirmAbierto(true);
  }

  function cerrarConfirmacion() {
    if (eliminando) return;

    setConfirmAbierto(false);
    setProductoAEliminar(null);
  }

  async function confirmarEliminacion() {
    if (!productoAEliminar) return;

    try {
      setEliminando(true);

      const response = await fetch(
        `/api/productos/${productoAEliminar.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "No se pudo eliminar el producto."
        );
      }

      setProductos((actuales) =>
        actuales.filter(
          (producto) => producto.id !== productoAEliminar.id
        )
      );

      cerrarConfirmacion();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el producto."
      );
    } finally {
      setEliminando(false);
    }
  }

  return (
    <>
      <div className="space-y-5">
        <ProductoToolbar
          cantidad={productos.length}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
        />

        {cargando ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando productos...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-700 to-violet-600">
                    <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      Código
                    </th>

                    <th className="w-[28%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      Producto
                    </th>

                    <th className="w-[25%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      Categoría
                    </th>

                    <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      Unidad
                    </th>

                    <th className="w-32 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white">
                      Estado
                    </th>

                    <th className="w-28 px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm text-slate-500"
                      >
                        {busqueda.trim()
                          ? "No se encontraron productos."
                          : "No hay productos registrados."}
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((producto) => (
                      <tr
                        key={producto.id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-2.5">
                          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-700">
                            {producto.codigo}
                          </span>
                        </td>

                        <td className="px-5 py-2.5">
                          <span className="text-sm font-medium text-slate-800">
                            {producto.nombre}
                          </span>
                        </td>

                        <td className="px-5 py-2.5">
                          <span className="text-sm text-slate-600">
                            {producto.categoria.nombre}
                          </span>
                        </td>

                        <td className="px-5 py-2.5">
                          <span className="inline-flex rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                            {producto.unidadMedida.codigo}
                          </span>
                        </td>

                        <td className="px-5 py-2.5">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        </td>

                        <td className="px-5 py-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => abrirEditar(producto)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                              title="Editar producto"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                abrirConfirmacion(producto)
                              }
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              title="Eliminar producto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={abrirNuevo}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/20 transition-transform hover:scale-105 active:scale-95"
        title="Nuevo producto"
        aria-label="Nuevo producto"
      >
        <Plus className="h-5 w-5" />
      </button>

      <ProductoModal
        abierto={modalAbierto}
        producto={productoSeleccionado}
        onCerrar={cerrarModal}
        onGuardado={productoGuardado}
      />

      <ProductoConfirmModal
        abierto={confirmAbierto}
        nombre={productoAEliminar?.nombre || ""}
        eliminando={eliminando}
        onCerrar={cerrarConfirmacion}
        onConfirmar={confirmarEliminacion}
      />
    </>
  );
}