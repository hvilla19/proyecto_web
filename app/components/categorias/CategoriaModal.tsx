"use client";

import { FormEvent, useEffect, useState } from "react";

interface Categoria {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

interface CategoriaModalProps {
  abierto: boolean;
  categoria: Categoria | null;
  onCerrar: () => void;
  onGuardar: (categoria: Categoria) => Promise<void>;
}

export default function CategoriaModal({
  abierto,
  categoria,
  onCerrar,
  onGuardar,
}: CategoriaModalProps) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const editando = categoria !== null;

  useEffect(() => {
    if (!abierto) {
      return;
    }

    if (categoria) {
      setCodigo(categoria.codigo);
      setNombre(categoria.nombre);
      setDescripcion(categoria.descripcion || "");
    } else {
      setCodigo("");
      setNombre("");
      setDescripcion("");
    }

    setError("");
    setGuardando(false);
  }, [abierto, categoria]);

  if (!abierto) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!codigo.trim() || !nombre.trim()) {
      setError("El código y el nombre son obligatorios");
      return;
    }

    try {
      setGuardando(true);

      const url = editando
        ? `/api/categorias/${categoria.id}`
        : "/api/categorias";

      const response = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigo.trim(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ||
            (editando
              ? "No se pudo actualizar la categoría"
              : "No se pudo crear la categoría")
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
          ? "Error al actualizar categoría:"
          : "Error al crear categoría:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : editando
            ? "No se pudo actualizar la categoría"
            : "No se pudo crear la categoría"
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editando ? "Editar categoría" : "Nueva categoría"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editando
                ? "Modifica los datos de la categoría."
                : "Registra una nueva categoría para tus productos."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCerrar}
            disabled={guardando}
            className="rounded-lg px-2 py-1 text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="codigo"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Código
              </label>

              <input
                id="codigo"
                type="text"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                placeholder="Ej. CAT-003"
                disabled={guardando}
                autoFocus
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>

              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej. Herramientas eléctricas"
                disabled={guardando}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="descripcion"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Descripción
              </label>

              <textarea
                id="descripcion"
                rows={3}
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Descripción de la categoría..."
                disabled={guardando}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={handleCerrar}
              disabled={guardando}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
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
