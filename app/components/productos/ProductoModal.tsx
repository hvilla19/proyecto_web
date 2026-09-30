"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";

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

interface Categoria {
  id: string;
  codigo: string;
  nombre: string;
}

interface UnidadMedida {
  id: string;
  codigo: string;
  nombre: string;
  decimalesPermitidos: number;
}

interface ProductoModalProps {
  abierto: boolean;
  producto: Producto | null;
  onCerrar: () => void;
  onGuardado: (producto: Producto) => void;
}

export default function ProductoModal({
  abierto,
  producto,
  onCerrar,
  onGuardado,
}: ProductoModalProps) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [categoriaId, setCategoriaId] = useState("");
  const [unidadMedidaId, setUnidadMedidaId] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);

  const [busquedaCategoria, setBusquedaCategoria] = useState("");
  const [categoriaAbierta, setCategoriaAbierta] = useState(false);

  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const categoriaRef = useRef<HTMLDivElement>(null);

  const esEdicion = producto !== null;

  useEffect(() => {
    if (!abierto) return;

    setError("");

    if (producto) {
      setCodigo(producto.codigo);
      setNombre(producto.nombre);
      setDescripcion(producto.descripcion || "");
      setCategoriaId(producto.categoriaId);
      setUnidadMedidaId(producto.unidadMedidaId);
      setBusquedaCategoria(
        `${producto.categoria.codigo} - ${producto.categoria.nombre}`
      );
    } else {
      setCodigo("");
      setNombre("");
      setDescripcion("");
      setCategoriaId("");
      setUnidadMedidaId("");
      setBusquedaCategoria("");
    }
  }, [abierto, producto]);

  useEffect(() => {
    if (!abierto) return;

    async function cargarCatalogos() {
      try {
        setCargandoCatalogos(true);
        setError("");

        const [categoriasResponse, unidadesResponse] =
          await Promise.all([
            fetch("/api/categorias"),
            fetch("/api/unidades-medida"),
          ]);

        if (!categoriasResponse.ok || !unidadesResponse.ok) {
          throw new Error("No se pudieron cargar los catálogos.");
        }

        const categoriasResult = await categoriasResponse.json();
        const unidadesResult = await unidadesResponse.json();

        if (!categoriasResult.ok || !unidadesResult.ok) {
          throw new Error("No se pudieron cargar los catálogos.");
        }

        setCategorias(categoriasResult.data);
        setUnidades(unidadesResult.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los catálogos."
        );
      } finally {
        setCargandoCatalogos(false);
      }
    }

    cargarCatalogos();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !guardando) {
        onCerrar();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () =>
      document.removeEventListener("keydown", handleEscape);
  }, [abierto, guardando, onCerrar]);

  useEffect(() => {
    if (!categoriaAbierta) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        categoriaRef.current &&
        !categoriaRef.current.contains(event.target as Node)
      ) {
        setCategoriaAbierta(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [categoriaAbierta]);

  if (!abierto) return null;

  const categoriasFiltradas = categorias.filter((categoria) => {
    const termino = busquedaCategoria.trim().toLowerCase();

    if (!termino) return true;

    return (
      categoria.codigo.toLowerCase().includes(termino) ||
      categoria.nombre.toLowerCase().includes(termino)
    );
  });

  const unidadSeleccionada = unidades.find(
    (unidad) => unidad.id === unidadMedidaId
  );

  function seleccionarCategoria(categoria: Categoria) {
    setCategoriaId(categoria.id);
    setBusquedaCategoria(
      `${categoria.codigo} - ${categoria.nombre}`
    );
    setCategoriaAbierta(false);
  }

  async function handleGuardar() {
    try {
      setError("");

      if (!codigo.trim()) {
        setError("El código es obligatorio.");
        return;
      }

      if (!nombre.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }

      if (!categoriaId) {
        setError("Debes seleccionar una categoría.");
        return;
      }

      if (!unidadMedidaId) {
        setError("Debes seleccionar una unidad de medida.");
        return;
      }

      setGuardando(true);

      const payload = {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        categoriaId,
        unidadMedidaId,
      };

      const response = await fetch(
        esEdicion
          ? `/api/productos/${producto.id}`
          : "/api/productos",
        {
          method: esEdicion ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "No se pudo guardar el producto."
        );
      }

      onGuardado(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el producto."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onMouseDown={() => !guardando && onCerrar()}
    >
      <div
        className="relative w-full max-w-2xl overflow-visible rounded-xl border border-slate-200 bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-violet-800">
              {esEdicion ? "Editar producto" : "Nuevo producto"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {esEdicion
                ? "Actualiza la información del producto."
                : "Registra un nuevo producto en tu inventario."}
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
            title="Cerrar"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Código
              </label>

              <input
                type="text"
                value={codigo}
                onChange={(event) => setCodigo(event.target.value)}
                placeholder="Ej. PROD-001"
                disabled={guardando}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nombre
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej. Taladro eléctrico"
                disabled={guardando}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div ref={categoriaRef} className="relative">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Categoría
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={busquedaCategoria}
                  onChange={(event) => {
                    setBusquedaCategoria(event.target.value);
                    setCategoriaId("");
                    setCategoriaAbierta(true);
                  }}
                  onFocus={() => setCategoriaAbierta(true)}
                  placeholder="Buscar categoría..."
                  disabled={guardando || cargandoCatalogos}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
                />

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {categoriaAbierta && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {categoriasFiltradas.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-slate-500">
                      No se encontraron categorías.
                    </div>
                  ) : (
                    categoriasFiltradas.map((categoria) => (
                      <button
                        key={categoria.id}
                        type="button"
                        onClick={() => seleccionarCategoria(categoria)}
                        className="flex w-full flex-col items-start px-3 py-2.5 text-left transition-colors hover:bg-violet-50"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {categoria.nombre}
                        </span>

                        <span className="mt-0.5 font-mono text-xs text-slate-400">
                          {categoria.codigo}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Unidad de medida
              </label>

              <select
                value={unidadMedidaId}
                onChange={(event) =>
                  setUnidadMedidaId(event.target.value)
                }
                disabled={guardando || cargandoCatalogos}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
              >
                <option value="">Seleccionar unidad...</option>

                {unidades.map((unidad) => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.codigo} - {unidad.nombre}
                  </option>
                ))}
              </select>

              {unidadSeleccionada && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Decimales permitidos:{" "}
                  <span className="font-medium text-slate-600">
                    {unidadSeleccionada.decimalesPermitidos}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Descripción
            </label>

            <textarea
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              placeholder="Descripción opcional del producto..."
              rows={3}
              disabled={guardando}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || cargandoCatalogos}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar producto"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}