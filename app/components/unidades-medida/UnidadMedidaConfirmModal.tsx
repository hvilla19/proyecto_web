"use client";

import { useEffect } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";

interface UnidadMedidaConfirmModalProps {
  abierto: boolean;
  nombre: string;
  eliminando: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
}

export default function UnidadMedidaConfirmModal({
  abierto,
  nombre,
  eliminando,
  onCerrar,
  onConfirmar,
}: UnidadMedidaConfirmModalProps) {
  useEffect(() => {
    if (!abierto) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !eliminando) {
        onCerrar();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () =>
      document.removeEventListener("keydown", handleEscape);
  }, [abierto, eliminando, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity"
      onMouseDown={() => !eliminando && onCerrar()}
    >
      <div
        className="relative w-full max-w-md transform overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition-all"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Botón Cerrar X */}
        <button
          type="button"
          onClick={onCerrar}
          disabled={eliminando}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
          title="Cerrar"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-base font-semibold text-slate-900">
              ¿Eliminar unidad de medida?
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Estás a punto de eliminar{" "}
              <strong className="font-semibold text-slate-900">
                "{nombre}"
              </strong>
              . Esta unidad de medida se eliminará de manera permanente.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            disabled={eliminando}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={eliminando}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50"
          >
            {eliminando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              "Eliminar unidad de medida"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}