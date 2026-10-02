"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  SearchX,
} from "lucide-react";
import AlmacenToolbar from "./AlmacenToolbar";
import AlmacenModal from "./AlmacenModal";
import AlmacenConfirmModal from "./AlmacenConfirmModal";

interface Almacen {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export default function AlmacenTable() {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [almacenSeleccionado, setAlmacenSeleccionado] =
    useState<Almacen | null>(null);

  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [confirmarEliminacion, setConfirmarEliminacion] =
    useState<Almacen | null>(null);

  useEffect(() => {
    async function cargarAlmacenes() {
      try {
        setCargando(true);
        setError("");

        const response = await fetch("/api/almacenes");
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result.message || "No se pudieron cargar los almacenes"
          );
        }

        setAlmacenes(result.data);
      } catch (error) {
        console.error("Error al cargar almacenes:", error);

        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los almacenes"
        );
      } finally {
        setCargando(false);
      }
    }

    cargarAlmacenes();
  }, []);

  const almacenesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return almacenes;
    }

    return almacenes.filter((almacen) => {
      return (
        almacen.codigo.toLowerCase().includes(texto) ||
        almacen.nombre.toLowerCase().includes(texto)
      );
    });
  }, [almacenes, busqueda]);

  function abrirNuevoAlmacen() {
    setAlmacenSeleccionado(null);
    setModalAbierto(true);
  }

  function abrirEditarAlmacen(almacen: Almacen) {
    setAlmacenSeleccionado(almacen);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setAlmacenSeleccionado(null);
  }

  function guardarAlmacen(almacen: Almacen) {
    setAlmacenes((almacenesActuales) => {
      const existe = almacenesActuales.some(
        (item) => item.id === almacen.id
      );

      if (existe) {
        return almacenesActuales.map((item) =>
          item.id === almacen.id ? almacen : item
        );
      }

      return [...almacenesActuales, almacen];
    });

    cerrarModal();
  }

  function abrirConfirmacionEliminacion(almacen: Almacen) {
    setError("");
    setConfirmarEliminacion(almacen);
  }

  function cerrarConfirmacionEliminacion() {
    if (eliminandoId !== null) return;

    setConfirmarEliminacion(null);
  }

  async function eliminarAlmacen() {
    if (!confirmarEliminacion) return;

    const almacen = confirmarEliminacion;

    try {
      setEliminandoId(almacen.id);
      setError("");

      const response = await fetch(`/api/almacenes/${almacen.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "No se pudo eliminar el almacén"
        );
      }

      setAlmacenes((almacenesActuales) =>
        almacenesActuales.filter(
          (item) => item.id !== almacen.id
        )
      );

      setConfirmarEliminacion(null);
    } catch (error) {
      console.error("Error al eliminar almacén:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el almacén"
      );
    } finally {
      setEliminandoId(null);
    }
  }

  const contenidoTabla = () => {
    if (cargando) {
      return (
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Cargando almacenes...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Estamos preparando la información.
            </p>
          </div>
        </div>
      );
    }

    if (almacenesFiltrados.length === 0) {
      return (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <SearchX className="h-5 w-5 text-slate-400" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            No se encontraron almacenes
          </p>

          <p className="mt-1 max-w-sm text-sm text-slate-400">
            {busqueda
              ? "Prueba con otro código o nombre."
              : "Aún no existen almacenes registrados."}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-indigo-300 bg-gradient-to-br from-indigo-700 to-violet-600">
              <th className="w-32 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white">
                Código
              </th>

              <th className="w-56 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white">
                Almacén
              </th>

              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-white">
                Descripción
              </th>

              <th className="w-32 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white">
                Estado
              </th>

              <th className="w-28 px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-white">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {almacenesFiltrados.map((almacen) => (
              <tr
                key={almacen.id}
                className="group transition-colors hover:bg-slate-50/60"
              >
                {/* Código */}
                <td className="px-5 py-2.5">
                  <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                    {almacen.codigo}
                  </span>
                </td>

                {/* Nombre */}
                <td className="px-5 py-2.5">
                  <p
                    className="truncate text-sm font-medium text-slate-800"
                    title={almacen.nombre}
                  >
                    {almacen.nombre}
                  </p>
                </td>

                {/* Descripción */}
                <td className="px-5 py-2.5">
                  <p
                    className="truncate text-sm text-slate-500"
                    title={almacen.descripcion || ""}
                  >
                    {almacen.descripcion || "—"}
                  </p>
                </td>

                {/* Estado */}
                <td className="px-5 py-2.5">
                  {almacen.activo ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Inactivo
                    </span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-5 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => abrirEditarAlmacen(almacen)}
                      title="Editar almacén"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        abrirConfirmacionEliminacion(almacen)
                      }
                      disabled={eliminandoId === almacen.id}
                      title="Eliminar almacén"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
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
      <AlmacenToolbar
        total={almacenesFiltrados.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
      />

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200/80 bg-rose-50/50 px-4 py-3">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />

          <div>
            <p className="text-sm font-medium text-rose-800">
              No se pudo completar la operación
            </p>

            <p className="mt-0.5 text-xs text-rose-600">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.03]">
        {contenidoTabla()}
      </div>

      <AlmacenModal
        abierto={modalAbierto}
        almacen={almacenSeleccionado}
        onCerrar={cerrarModal}
        onGuardar={async (almacen) => {
          guardarAlmacen(almacen);
        }}
      />

      <AlmacenConfirmModal
        abierto={confirmarEliminacion !== null}
        nombre={confirmarEliminacion?.nombre || ""}
        eliminando={eliminandoId !== null}
        onCerrar={cerrarConfirmacionEliminacion}
        onConfirmar={eliminarAlmacen}
      />

      <button
        type="button"
        onClick={abrirNuevoAlmacen}
        title="Nuevo almacén"
        aria-label="Nuevo almacén"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/30 transition hover:scale-105 hover:shadow-xl hover:shadow-violet-500/30 focus:outline-none focus:ring-4 focus:ring-violet-500/20"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}