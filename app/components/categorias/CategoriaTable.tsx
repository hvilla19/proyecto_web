"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  SearchX,
} from "lucide-react";
import CategoriaToolbar from "./CategoriaToolbar";
import CategoriaModal from "./CategoriaModal";

interface Categoria {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export default function CategoriaTable() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);
  const [eliminandoId, seteliminandoId] = useState<string | null>(null);

  useEffect(() => {
    async function cargarCategorias() {
      try {
        setCargando(true);
        setError("");

        const response = await fetch("/api/categorias");
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result.message || "No se pudieron cargar las categorías"
          );
        }

        setCategorias(result.data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);

        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las categorías"
        );
      } finally {
        setCargando(false);
      }
    }

    cargarCategorias();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return categorias;
    }

    return categorias.filter((categoria) => {
      return (
        categoria.codigo.toLowerCase().includes(texto) ||
        categoria.nombre.toLowerCase().includes(texto)
      );
    });
  }, [categorias, busqueda]);

  function abrirNuevaCategoria() {
    setCategoriaSeleccionada(null);
    setModalAbierto(true);
  }

  function abrirEditarCategoria(categoria: Categoria) {
    setCategoriaSeleccionada(categoria);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setCategoriaSeleccionada(null);
  }

  function guardarCategoria(categoria: Categoria) {
    setCategorias((categoriasActuales) => {
      const existe = categoriasActuales.some(
        (item) => item.id === categoria.id
      );

      if (existe) {
        return categoriasActuales.map((item) =>
          item.id === categoria.id ? categoria : item
        );
      }

      return [...categoriasActuales, categoria];
    });

    cerrarModal();
  }

  async function eliminarCategoria(categoria: Categoria) {
    const confirmado = window.confirm(
      `¿Deseas eliminar la categoría "${categoria.nombre}"?`
    );

    if (!confirmado) {
      return;
    }

    try {
      seteliminandoId(categoria.id);
      setError("");

      const response = await fetch(`/api/categorias/${categoria.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "No se pudo eliminar la categoría"
        );
      }

      setCategorias((categoriasActuales) =>
        categoriasActuales.filter((item) => item.id !== categoria.id)
      );
    } catch (error) {
      console.error("Error al desactivar categoría:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo desactivar la categoría"
      );
    } finally {
      seteliminandoId(null);
    }
  }

  const contenidoTabla = () => {
    if (cargando) {
      return (
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-500" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Cargando categorías...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Estamos preparando la información.
            </p>
          </div>
        </div>
      );
    }

    if (categoriasFiltradas.length === 0) {
      return (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <SearchX className="h-5 w-5 text-slate-400" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            No se encontraron categorías
          </p>

          <p className="mt-1 max-w-sm text-sm text-slate-400">
            {busqueda
              ? "Prueba con otro código o nombre."
              : "Aún no existen categorías registradas."}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
        <thead>
          <tr className="border-b border-blue-300">
            <th className="bg-blue-200 px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-blue-900">
              Código
            </th>

            <th className="bg-blue-200 px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-blue-900">
              Categoría
            </th>

            <th className="bg-blue-200 px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-blue-900">
              Descripción
            </th>

            <th className="bg-blue-200 px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-blue-900">
              Estado
            </th>

            <th className="w-28 bg-blue-200 px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-blue-900">
              Acciones
            </th>
          </tr>
        </thead>

          <tbody className="divide-y divide-slate-200/70">
            {categoriasFiltradas.map((categoria) => (
              <tr
                key={categoria.id}
                className="group transition-colors hover:bg-slate-50/70"
              >
                {/* Código */}
                <td className="px-6 py-2">
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[12px] font-medium text-slate-600">
                    {categoria.codigo}
                  </span>
                </td>

                {/* Nombre */}
                <td className="px-6 py-2">                  
                    <p className="text-[12px] text-slate-600">
                      {categoria.nombre}
                    </p>                  
                </td>

                {/* Descripción */}
                <td className="max-w-md px-6 py-2">
                <p
                  className="truncate text-[12px] text-slate-600"
                  title={categoria.descripcion || ""}
                >
                    {categoria.descripcion || "Sin descripción"}
                  </p>
                </td>

                {/* Estado */}
                <td className="px-6 py-2">
                  {categoria.activo ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Inactivo
                    </span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-6 py-2">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => abrirEditarCategoria(categoria)}
                      title="Editar categoría"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-violet-50 hover:text-violet-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => eliminarCategoria(categoria)}
                      disabled={eliminandoId === categoria.id}
                      title={
                        eliminandoId === categoria.id
                          ? "Eliminando..."
                          : "Eliminar categoría"
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <CategoriaToolbar
        total={categoriasFiltradas.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}        
      />

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

          <div>
            <p className="text-sm font-medium text-red-700">
              No se pudo completar la operación
            </p>

            <p className="mt-0.5 text-xs text-red-500">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
        
        {contenidoTabla()}
      </div>

      <CategoriaModal
        abierto={modalAbierto}
        categoria={categoriaSeleccionada}
        onCerrar={cerrarModal}
        onGuardar={async (categoria) => {
          guardarCategoria(categoria);
        }}
      />
      <button
        type="button"
        onClick={abrirNuevaCategoria}
        title="Nueva categoría"
        aria-label="Nueva categoría"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/30 transition hover:scale-105 hover:shadow-xl hover:shadow-violet-500/30 focus:outline-none focus:ring-4 focus:ring-violet-500/20"
      >
        <Plus className="h-5 w-5" />
    </button>
    </div>      
  );
}