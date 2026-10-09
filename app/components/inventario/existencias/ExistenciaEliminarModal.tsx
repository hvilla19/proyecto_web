
"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

interface Existencia {
  id: string;
  stockActual: string;
  producto: {
    codigo: string;
    nombre: string;
    unidadMedida: {
      codigo: string;
      decimalesPermitidos: number;
    };
  };
}

interface Props {
  abierto: boolean;
  existencia: Existencia | null;
  onCerrar: () => void;
  onEliminado: () => void;
}

export default function ExistenciaEliminarModal({
  abierto,
  existencia,
  onCerrar,
  onEliminado,
}: Props) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  if (!abierto || !existencia) return null;

  const eliminarExistencia = async () => {
    try {
      setEliminando(true);
      setError("");

      const response = await fetch(
        `/api/producto-almacen/${existencia.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "No se pudo eliminar la existencia."
        );
      }

      onEliminado();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al eliminar la existencia."
      );
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !eliminando) onCerrar();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Eliminar existencia
          </h2>

          <button
            type="button"
            onClick={onCerrar}
            disabled={eliminando}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle
              size={22}
              className="mt-0.5 shrink-0 text-amber-600"
            />
            <div>
              <p className="font-semibold text-amber-900">
                ¿Deseas eliminar esta existencia?
              </p>
              <p className="mt-1 text-sm leading-5 text-amber-800">
                El registro se desactivará y dejará de aparecer en las
                existencias activas. No se borrará físicamente de la base de
                datos.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">
              {existencia.producto.nombre}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Código: {existencia.producto.codigo}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Stock actual: {existencia.stockActual}{" "}
              {existencia.producto.unidadMedida.codigo}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              disabled={eliminando}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={eliminarExistencia}
              disabled={eliminando}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {eliminando ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {eliminando ? "Eliminando..." : "Confirmar eliminación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}