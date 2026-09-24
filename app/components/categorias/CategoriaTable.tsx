"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, PowerOff } from "lucide-react";
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
  const [desactivandoId, setDesactivandoId] = useState<string | null>(null);

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

  async function desactivarCategoria(categoria: Categoria) {
    const confirmado = window.confirm(
      `¿Deseas desactivar la categoría "${categoria.nombre}"?`
    );

    if (!confirmado) {
      return;
    }

    try {
      setDesactivandoId(categoria.id);
      setError("");

      const response = await fetch(`/api/categorias/${categoria.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "No se pudo desactivar la categoría"
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
      setDesactivandoId(null);
    }
  }

  if (cargando) {
    return (
      <div>
        <CategoriaToolbar
          total={0}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          onNuevaCategoria={abrirNuevaCategoria}
        />

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            Cargando categorías...
          </p>
        </div>

        <CategoriaModal
          abierto={modalAbierto}
          categoria={categoriaSeleccionada}
          onCerrar={cerrarModal}
          onGuardar={async (categoria) => {
            guardarCategoria(categoria);
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <CategoriaToolbar
          total={categoriasFiltradas.length}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          onNuevaCategoria={abrirNuevaCategoria}
        />

        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Código
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nombre
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Descripción
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {categoriasFiltradas.map((categoria) => (
                <tr key={categoria.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {categoria.codigo}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {categoria.nombre}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {categoria.descripcion || "—"}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEditarCategoria(categoria)}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => desactivarCategoria(categoria)}
                        disabled={desactivandoId === categoria.id}
                        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <PowerOff className="h-4 w-4" />
                        <span>
                          {desactivandoId === categoria.id
                            ? "Desactivando..."
                            : "Desactivar"}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CategoriaModal
          abierto={modalAbierto}
          categoria={categoriaSeleccionada}
          onCerrar={cerrarModal}
          onGuardar={async (categoria) => {
            guardarCategoria(categoria);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <CategoriaToolbar
        total={categoriasFiltradas.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        onNuevaCategoria={abrirNuevaCategoria}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Código
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nombre
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Descripción
              </th>

              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {categoriasFiltradas.map((categoria) => (
              <tr key={categoria.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {categoria.codigo}
                </td>

                <td className="px-6 py-4 text-sm text-gray-700">
                  {categoria.nombre}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {categoria.descripcion || "—"}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEditarCategoria(categoria)}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => desactivarCategoria(categoria)}
                      disabled={desactivandoId === categoria.id}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <PowerOff className="h-4 w-4" />
                      <span>
                        {desactivandoId === categoria.id
                          ? "Desactivando..."
                          : "Desactivar"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {categoriasFiltradas.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No se encontraron categorías.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CategoriaModal
        abierto={modalAbierto}
        categoria={categoriaSeleccionada}
        onCerrar={cerrarModal}
        onGuardar={async (categoria) => {
          guardarCategoria(categoria);
        }}
      />
    </div>
  );
}
