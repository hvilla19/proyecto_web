"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

interface Almacen {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

interface AlmacenModalProps {
  abierto: boolean;
  almacen: Almacen | null;
  onCerrar: () => void;
  onGuardar: (almacen: Almacen) => Promise<void>;
}

export default function AlmacenModal({
  abierto,
  almacen,
  onCerrar,
  onGuardar,
}: AlmacenModalProps) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const editando = almacen !== null;

  useEffect(() => {
    if (!abierto) {
      return;
    }

    if (almacen) {
      setCodigo(almacen.codigo);
      setNombre(almacen.nombre);
      setDescripcion(almacen.descripcion || "");
    } else {
      setCodigo("");
      setNombre("");
      setDescripcion("");
    }

    setError("");
    setGuardando(false);
  }, [abierto, almacen]);

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
    const descripcionLimpia = descripcion.trim();

    if (!codigoLimpio || !nombreLimpio) {
      setError("El código y el nombre son obligatorios.");
      return;
    }

    try {
      setGuardando(true);

      const url = editando
        ? `/api/almacenes/${almacen.id}`
        : "/api/almacenes";

      const response = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoLimpio,
          nombre: nombreLimpio,
          descripcion: descripcionLimpia,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ||
            (editando
              ? "No se pudo actualizar el almacén."
              : "No se pudo crear el almacén.")
        );
      }

      await onGuardar(result.data);

      setCodigo("");
      setNombre("");
      setDescripcion("");
      setError("");
    } catch (error) {
      console.error(
        editando
          ? "Error al actualizar almacén:"
          : "Error al crear almacén:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : editando
            ? "No se pudo actualizar el almacén."
            : "No se pudo crear el almacén."
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
    setDescripcion("");
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
              {editando ? "Editar almacén" : "Nuevo almacén"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {editando
                ? "Modifica los datos del almacén."
                : "Registra un nuevo almacén para tu empresa."}
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
                htmlFor="codigo"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Código
              </label>

              <input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                placeholder="Ej. ALM-003"
                disabled={guardando}
                autoFocus
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nombre
              </label>

              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej. Almacén principal"
                disabled={guardando}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Descripción */}
            <div>
              <label
                htmlFor="descripcion"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Descripción
              </label>

              <textarea
                id="descripcion"
                rows={3}
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Descripción del almacén..."
                disabled={guardando}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
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