
"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2, X } from "lucide-react";

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
  categoriaId: string;
  unidadMedidaId: string;
  activo: boolean;
  unidadMedida: UnidadMedida;
}

interface ExistenciaModalProps {
  abierto: boolean;
  almacenId: string;
  onCerrar: () => void;
  onGuardado: () => void;
}

function obtenerFechaLocal(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

export default function ExistenciaModal({
  abierto,
  almacenId,
  onCerrar,
  onGuardado,
}: ExistenciaModalProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoId, setProductoId] = useState("");

  const [stockInicial, setStockInicial] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [fechaOperacion, setFechaOperacion] = useState(obtenerFechaLocal);

  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const cargarProductos = async () => {
      try {
        setCargandoProductos(true);
        setError("");

        const response = await fetch("/api/productos");
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result.error ||
              result.message ||
              "No se pudieron cargar los productos."
          );
        }

        setProductos(result.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los productos."
        );
      } finally {
        setCargandoProductos(false);
      }
    };

    cargarProductos();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const manejarEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !guardando) {
        onCerrar();
      }
    };

    document.addEventListener("keydown", manejarEscape);

    return () => {
      document.removeEventListener("keydown", manejarEscape);
    };
  }, [abierto, guardando, onCerrar]);

  useEffect(() => {
    if (!abierto) {
      setProductoId("");
      setStockInicial("");
      setStockMinimo("");
      setFechaOperacion(obtenerFechaLocal());
      setError("");
    }
  }, [abierto]);

  if (!abierto) {
    return null;
  }

  const productoSeleccionado = productos.find(
    (producto) => producto.id === productoId
  );

  const decimalesPermitidos =
    productoSeleccionado?.unidadMedida.decimalesPermitidos ?? 0;

  const validarCantidad = (
    valor: string,
    nombreCampo: string
  ): string | null => {
    if (!valor.trim()) {
      return `${nombreCampo} es obligatorio.`;
    }

    if (!/^\d+(?:\.\d+)?$/.test(valor)) {
      return `${nombreCampo} debe ser un número válido mayor o igual a cero.`;
    }

    const partes = valor.split(".");
    const cantidadDecimales = partes[1]?.length ?? 0;

    if (cantidadDecimales > 6) {
      return `${nombreCampo} no puede tener más de 6 decimales.`;
    }

    if (cantidadDecimales > decimalesPermitidos) {
      return `${nombreCampo} permite como máximo ${decimalesPermitidos} decimal${
        decimalesPermitidos === 1 ? "" : "es"
      } para esta unidad de medida.`;
    }

    const digitosEnteros = partes[0].length;

    if (digitosEnteros + cantidadDecimales > 18) {
      return `${nombreCampo} excede el máximo permitido.`;
    }

    return null;
  };

  const manejarProductoChange = (valor: string) => {
    setProductoId(valor);
    setStockInicial("");
    setStockMinimo("");
    setError("");
  };

  const manejarGuardar = async () => {
    setError("");

    if (!almacenId) {
      setError("Debe seleccionar un almacén.");
      return;
    }

    if (!productoId) {
      setError("Debe seleccionar un producto.");
      return;
    }

    if (!fechaOperacion) {
      setError("Debe seleccionar la fecha del saldo inicial.");
      return;
    }

    const errorStockInicial = validarCantidad(
      stockInicial,
      "El stock inicial"
    );

    if (errorStockInicial) {
      setError(errorStockInicial);
      return;
    }

    const errorStockMinimo = validarCantidad(
      stockMinimo,
      "El stock mínimo"
    );

    if (errorStockMinimo) {
      setError(errorStockMinimo);
      return;
    }

    try {
      setGuardando(true);

      const response = await fetch("/api/producto-almacen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productoId,
          almacenId,
          stockInicial,
          stockMinimo,
          fechaOperacion,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "No se pudo agregar el producto al almacén."
        );
      }

      onGuardado();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo agregar el producto al almacén."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !guardando) {
          onCerrar();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-indigo-700">
              Agregar producto al almacén
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Registra el saldo inicial, su fecha de operación y el stock mínimo.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="producto"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Producto <span className="text-red-500">*</span>
            </label>

            <select
              id="producto"
              value={productoId}
              onChange={(event) =>
                manejarProductoChange(event.target.value)
              }
              disabled={cargandoProductos || guardando}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">
                {cargandoProductos
                  ? "Cargando productos..."
                  : "Selecciona un producto"}
              </option>

              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.codigo} - {producto.nombre}
                </option>
              ))}
            </select>
          </div>

          {productoSeleccionado && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-indigo-500">
                Unidad de medida
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-700">
                {productoSeleccionado.unidadMedida.codigo} -{" "}
                {productoSeleccionado.unidadMedida.nombre}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Permite hasta {decimalesPermitidos} decimal
                {decimalesPermitidos === 1 ? "" : "es"}.
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="fechaOperacion"
              className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <CalendarDays size={16} className="text-indigo-600" />
              Fecha de saldo inicial{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              id="fechaOperacion"
              type="date"
              value={fechaOperacion}
              onChange={(event) => setFechaOperacion(event.target.value)}
              disabled={guardando}
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Esta fecha aparecerá en el Kardex como fecha de operación.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="stockInicial"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Stock inicial <span className="text-red-500">*</span>
              </label>

              <input
                id="stockInicial"
                type="text"
                inputMode="decimal"
                value={stockInicial}
                onChange={(event) => setStockInicial(event.target.value)}
                disabled={!productoId || guardando}
                placeholder={
                  productoId
                    ? decimalesPermitidos === 0
                      ? "0"
                      : `0.${"0".repeat(decimalesPermitidos)}`
                    : "Selecciona un producto"
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="stockMinimo"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Stock mínimo <span className="text-red-500">*</span>
              </label>

              <input
                id="stockMinimo"
                type="text"
                inputMode="decimal"
                value={stockMinimo}
                onChange={(event) => setStockMinimo(event.target.value)}
                disabled={!productoId || guardando}
                placeholder={
                  productoId
                    ? decimalesPermitidos === 0
                      ? "0"
                      : `0.${"0".repeat(decimalesPermitidos)}`
                    : "Selecciona un producto"
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={manejarGuardar}
            disabled={guardando || cargandoProductos}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando && (
              <Loader2 size={17} className="animate-spin" />
            )}

            {guardando ? "Registrando..." : "Agregar producto"}
          </button>
        </div>
      </div>
    </div>
  );
}