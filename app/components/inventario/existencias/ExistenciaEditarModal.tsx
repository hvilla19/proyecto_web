
"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

interface Existencia {
  id: string;
  stockActual: string;
  stockMinimo: string;
  producto: {
    codigo: string;
    nombre: string;
    unidadMedida: {
      codigo: string;
      nombre: string;
      decimalesPermitidos: number;
    };
  };
}

interface Props {
  abierto: boolean;
  existencia: Existencia | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

export default function ExistenciaEditarModal({
  abierto,
  existencia,
  onCerrar,
  onGuardado,
}: Props) {
  const [stockMinimo, setStockMinimo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (abierto && existencia) {
      setStockMinimo(existencia.stockMinimo);
      setError("");
    }
  }, [abierto, existencia]);

  if (!abierto || !existencia) return null;

  const decimales =
    existencia.producto.unidadMedida.decimalesPermitidos;

  const guardarCambios = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const valor = stockMinimo.trim();
    const numero = Number(valor);

    if (valor === "" || !Number.isFinite(numero) || numero < 0) {
      setError("Ingresa un stock mínimo válido, igual o mayor que cero.");
      return;
    }

    const parteDecimal = valor.replace(",", ".").split(".")[1] ?? "";

    if (!/^\d+([.,]\d*)?$/.test(valor)) {
      setError("Ingresa una cantidad numérica válida.");
      return;
    }

    if (parteDecimal.length > decimales) {
      setError(
        `La unidad ${existencia.producto.unidadMedida.codigo} permite como máximo ${decimales} decimales.`
      );
      return;
    }

    try {
      setGuardando(true);

      const response = await fetch(
        `/api/producto-almacen/${existencia.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stockMinimo: valor.replace(",", "."),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "No se pudo actualizar el stock mínimo."
        );
      }

      onGuardado();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al actualizar el stock mínimo."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !guardando) onCerrar();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Editar existencia
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Actualiza el stock mínimo del producto.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={guardarCambios} className="space-y-5 p-6">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Producto
            </p>
            <p className="mt-1 font-semibold text-slate-800">
              {existencia.producto.nombre}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Código: {existencia.producto.codigo}
            </p>
            <p className="text-sm text-slate-500">
              Unidad: {existencia.producto.unidadMedida.codigo} —{" "}
              {existencia.producto.unidadMedida.nombre}
            </p>
          </div>

          <div>
            <label
              htmlFor="stockMinimo"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Stock mínimo
            </label>

            <input
              id="stockMinimo"
              type="text"
              inputMode="decimal"
              autoFocus
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              placeholder="Ej. 5"
              disabled={guardando}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
            />

            <p className="mt-2 text-xs text-slate-500">
              Stock actual: {existencia.stockActual}. Esta edición no modifica
              el stock actual ni genera un movimiento de inventario.
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
              disabled={guardando}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}