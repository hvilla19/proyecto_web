
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  SearchX,
  Pencil,
  Trash2,
} from "lucide-react";
import ExistenciaToolbar from "./ExistenciaToolbar";
import ExistenciaModal from "./ExistenciaModal";
import ExistenciaEditarModal from "./ExistenciaEditarModal";
import ExistenciaEliminarModal from "./ExistenciaEliminarModal";

interface Almacen {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

interface UnidadMedida {
  id: string;
  codigo: string;
  nombre: string;
  decimalesPermitidos: number;
}

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  unidadMedida: UnidadMedida;
}

interface Existencia {
  id: string;
  productoId: string;
  almacenId: string;
  stockActual: string;
  stockMinimo: string;
  activo: boolean;
  producto: Producto;
}

export default function ExistenciaTable() {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState("");
  const [existencias, setExistencias] = useState<Existencia[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [cargandoAlmacenes, setCargandoAlmacenes] = useState(true);
  const [cargandoExistencias, setCargandoExistencias] = useState(false);
  const [error, setError] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [existenciaEditar, setExistenciaEditar] =
    useState<Existencia | null>(null);
  const [existenciaEliminar, setExistenciaEliminar] =
    useState<Existencia | null>(null);

  const cargarExistencias = async (almacenId: string) => {
    if (!almacenId) {
      setExistencias([]);
      return;
    }

    try {
      setCargandoExistencias(true);
      setError("");

      const response = await fetch(
        `/api/producto-almacen?almacenId=${almacenId}`
      );
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "No se pudieron cargar las existencias."
        );
      }

      setExistencias(result.data.existencias);
    } catch (err) {
      setExistencias([]);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las existencias."
      );
    } finally {
      setCargandoExistencias(false);
    }
  };

  useEffect(() => {
    const cargarAlmacenes = async () => {
      try {
        setCargandoAlmacenes(true);
        setError("");

        const response = await fetch("/api/almacenes");
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result.message || "No se pudieron cargar los almacenes."
          );
        }

        setAlmacenes(result.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los almacenes."
        );
      } finally {
        setCargandoAlmacenes(false);
      }
    };

    cargarAlmacenes();
  }, []);

  useEffect(() => {
    cargarExistencias(almacenSeleccionado);
  }, [almacenSeleccionado]);

  const existenciasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) return existencias;

    return existencias.filter((existencia) => {
      const codigo = existencia.producto.codigo.toLowerCase();
      const nombre = existencia.producto.nombre.toLowerCase();

      return codigo.includes(termino) || nombre.includes(termino);
    });
  }, [existencias, busqueda]);

  const formatearStock = (
    valor: string,
    decimalesPermitidos: number
  ) => {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) return valor;

    return numero.toLocaleString("es-PE", {
      minimumFractionDigits: decimalesPermitidos,
      maximumFractionDigits: decimalesPermitidos,
    });
  };

  const almacenActual = almacenes.find(
    (almacen) => almacen.id === almacenSeleccionado
  );

  const manejarGuardado = async () => {
    setModalAbierto(false);
    setExistenciaEditar(null);
    await cargarExistencias(almacenSeleccionado);
  };

  const manejarEliminado = async () => {
    setExistenciaEliminar(null);
    await cargarExistencias(almacenSeleccionado);
  };

  return (
    <div className="space-y-5">
      <ExistenciaToolbar
        almacenes={almacenes}
        almacenSeleccionado={almacenSeleccionado}
        onAlmacenChange={setAlmacenSeleccionado}
        total={existenciasFiltradas.length}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
      />

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {cargandoAlmacenes ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Cargando almacenes...
          </div>
        </div>
      ) : !almacenSeleccionado ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
            <SearchX size={26} className="text-indigo-500" />
          </div>

          <h2 className="text-base font-semibold text-slate-700">
            Selecciona un almacén
          </h2>

          <p className="mt-1 max-w-md text-sm text-slate-500">
            Selecciona un almacén para consultar los productos y existencias
            registrados.
          </p>
        </div>
      ) : cargandoExistencias ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Cargando existencias...
          </div>
        </div>
      ) : (
        <>
          {almacenActual && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Almacén:</span>
              <span className="font-semibold text-slate-700">
                {almacenActual.codigo} - {almacenActual.nombre}
              </span>
            </div>
          )}

          {existenciasFiltradas.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <SearchX size={26} className="text-slate-400" />
              </div>

              <h2 className="text-base font-semibold text-slate-700">
                {busqueda
                  ? "No se encontraron productos"
                  : "No hay existencias registradas"}
              </h2>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                {busqueda
                  ? "Intenta realizar la búsqueda con otro código o nombre de producto."
                  : "Este almacén todavía no tiene productos asociados."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-700 to-violet-600 text-left text-sm text-white">
                      <th className="px-5 py-3 font-semibold">Código</th>
                      <th className="px-5 py-3 font-semibold">Producto</th>
                      <th className="px-5 py-3 font-semibold">Unidad</th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Stock actual
                      </th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Stock mínimo
                      </th>
                      <th className="px-5 py-3 text-center font-semibold">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {existenciasFiltradas.map((existencia) => {
                      const unidad = existencia.producto.unidadMedida;

                      return (
                        <tr
                          key={existencia.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {existencia.producto.codigo}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-800">
                              {existencia.producto.nombre}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm text-slate-600">
                              {unidad.codigo}
                            </div>
                            <div className="text-xs text-slate-400">
                              {unidad.nombre}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="font-semibold text-slate-700">
                              {formatearStock(
                                existencia.stockActual,
                                unidad.decimalesPermitidos
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="text-sm font-medium text-slate-600">
                              {formatearStock(
                                existencia.stockMinimo,
                                unidad.decimalesPermitidos
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setExistenciaEditar(existencia)
                                }
                                title="Editar stock mínimo"
                                aria-label={`Editar stock mínimo de ${existencia.producto.nombre}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-100 text-indigo-600 transition hover:bg-indigo-50"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setExistenciaEliminar(existencia)
                                }
                                title="Eliminar existencia"
                                aria-label={`Eliminar existencia de ${existencia.producto.nombre}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => setModalAbierto(true)}
        disabled={!almacenSeleccionado}
        title={
          almacenSeleccionado
            ? "Agregar producto al almacén"
            : "Selecciona un almacén primero"
        }
        className="fixed bottom-7 right-7 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 transition hover:scale-105 hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
      >
        <Plus size={25} strokeWidth={2.5} />
      </button>

      <ExistenciaModal
        abierto={modalAbierto}
        almacenId={almacenSeleccionado}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={manejarGuardado}
      />

      <ExistenciaEditarModal
        abierto={existenciaEditar !== null}
        existencia={existenciaEditar}
        onCerrar={() => setExistenciaEditar(null)}
        onGuardado={manejarGuardado}
      />

      <ExistenciaEliminarModal
        abierto={existenciaEliminar !== null}
        existencia={existenciaEliminar}
        onCerrar={() => setExistenciaEliminar(null)}
        onEliminado={manejarEliminado}
      />
    </div>
  );
}