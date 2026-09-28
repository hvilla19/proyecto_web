"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

interface UnidadMedida {
  id: string;
  codigo: string;
  nombre: string;
  decimalesPermitidos: number;
  activo: boolean;
}

interface UnidadMedidaModalProps {
  abierto: boolean;
  unidadMedida: UnidadMedida | null;
  onCerrar: () => void;
  onGuardar: (unidadMedida: UnidadMedida) => Promise<void>;
}

export default function UnidadMedidaModal({
  abierto,
  unidadMedida,
  onCerrar,
  onGuardar,
}: UnidadMedidaModalProps) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [decimalesPermitidos, setDecimalesPermitidos] =
    useState("0");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const editando = unidadMedida !== null;

  useEffect(() => {
    if (!abierto) {
      return;
    }

    if (unidadMedida) {
      setCodigo(unidadMedida.codigo);
      setNombre(unidadMedida.nombre);
      setDecimalesPermitidos(
        unidadMedida.decimalesPermitidos.toString()
      );
    } else {
      setCodigo("");
      setNombre("");
      setDecimalesPermitidos("0");
    }

    setError("");
    setGuardando(false);
  }, [abierto, unidadMedida]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !guardando) {
        handleCerrar();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [abierto, guardando]);

  if (!abierto) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const codigoLimpio = codigo.trim();
    const nombreLimpio = nombre.trim();
    const decimales = Number(decimalesPermitidos);

    if (!codigoLimpio || !nombreLimpio) {
      setError("El código y el nombre son obligatorios.");
      return;
    }

    if (
      !Number.isInteger(decimales) ||
      decimales < 0 ||
      decimales > 6
    ) {
      setError(
        "Los decimales permitidos deben ser un número entero entre 0 y 6."
      );
      return;
    }

    try {
      setGuardando(true);

      const url = editando
        ? `/api/unidades-medida/${unidadMedida.id}`
        : "/api/unidades-medida";

      const response = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoLimpio,
          nombre: nombreLimpio,
          decimalesPermitidos: decimales,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ||
            (editando
              ? "No se pudo actualizar la unidad de medida."
              : "No se pudo crear la unidad de medida.")
        );
      }

      await onGuardar(result.data);

      setCodigo("");
      setNombre("");
      setDecimalesPermitidos("0");
      setError("");
    } catch (error) {
      console.error(
        editando
          ? "Error al actualizar unidad de medida:"
          : "Error al crear unidad de medida:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : editando
            ? "No se pudo actualizar la unidad de medida."
            : "No se pudo crear la unidad de medida."
      );
    } finally {
      setGuardando(false);
    }
  }

  function handleCerrar() {
    if (guardando) {
      return;
    }

    setCodigo("");
    setNombre("");
    setDecimalesPermitidos("0");
    setError("");

    onCerrar();
  }

  function handleOverlayClick() {
    if (!guardando) {
      handleCerrar();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/20"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-violet-800">
              {editando
                ? "Editar unidad de medida"
                : "Nueva unidad de medida"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {editando
                ? "Modifica los datos de la unidad de medida."
                : "Registra una nueva unidad de medida para tus productos."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCerrar}
            disabled={guardando}
            title="Cerrar"
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                <p className="text-sm leading-5 text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Código */}
            <div>
              <label
                htmlFor="codigo-unidad-medida"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Código
              </label>

              <input
                id="codigo-unidad-medida"
                type="text"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                placeholder="Ej. UND"
                disabled={guardando}
                autoFocus
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre-unidad-medida"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nombre
              </label>

              <input
                id="nombre-unidad-medida"
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej. Unidad"
                disabled={guardando}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Decimales permitidos */}
            <div>
              <label
                htmlFor="decimales-unidad-medida"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Decimales permitidos
              </label>

              <input
                id="decimales-unidad-medida"
                type="number"
                min={0}
                max={6}
                step={1}
                value={decimalesPermitidos}
                onChange={(event) =>
                  setDecimalesPermitidos(event.target.value)
                }
                disabled={guardando}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Define cuántos decimales puede manejar esta unidad, de 0 a 6.
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <button
              type="button"
              onClick={handleCerrar}
              disabled={guardando}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-violet-500/20 transition hover:shadow-md hover:shadow-violet-500/25 focus:outline-none focus:ring-4 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {guardando && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {guardando
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}