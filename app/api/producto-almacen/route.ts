
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Convierte BigInt a string para JSON.
 */
function bigintToString(value: bigint) {
  return value.toString();
}

/**
 * Convierte Decimal a string para JSON.
 */
function decimalToString(value: unknown) {
  return value?.toString() ?? "0";
}

/**
 * Valida cantidades respetando los decimales de la unidad.
 */
function validarStock(
  value: unknown,
  nombreCampo: string,
  decimalesPermitidos: number
) {
  if (value === undefined || value === null || value === "") {
    return {
      ok: false as const,
      error: `El campo ${nombreCampo} es obligatorio.`,
    };
  }

  const valor = String(value).trim();

  if (!/^\d+(?:\.\d+)?$/.test(valor)) {
    return {
      ok: false as const,
      error: `El campo ${nombreCampo} debe ser un número mayor o igual a cero.`,
    };
  }

  const partes = valor.split(".");
  const parteEntera = partes[0];
  const parteDecimal = partes[1] ?? "";

  if (parteDecimal.length > 6) {
    return {
      ok: false as const,
      error: `El campo ${nombreCampo} no puede tener más de 6 decimales.`,
    };
  }

  if (parteDecimal.length > decimalesPermitidos) {
    return {
      ok: false as const,
      error: `El campo ${nombreCampo} permite como máximo ${decimalesPermitidos} decimales según la unidad de medida.`,
    };
  }

  const digitosTotales = parteEntera.length + parteDecimal.length;

  if (digitosTotales > 18) {
    return {
      ok: false as const,
      error: `El campo ${nombreCampo} supera el máximo permitido por el sistema.`,
    };
  }

  return {
    ok: true as const,
    value: valor,
  };
}

/**
 * Valida una fecha recibida como YYYY-MM-DD.
 * Se almacena a medianoche UTC para conservar el día seleccionado.
 */
function validarFechaOperacion(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const fecha = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return fecha;
}

/**
 * GET
 * Obtiene las existencias activas de un almacén.
 *
 * GET /api/producto-almacen?almacenId=1
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const almacenIdParam = searchParams.get("almacenId");

    if (!almacenIdParam) {
      return NextResponse.json(
        { ok: false, error: "El parámetro almacenId es obligatorio." },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(almacenIdParam)) {
      return NextResponse.json(
        { ok: false, error: "El almacenId no es válido." },
        { status: 400 }
      );
    }

    const almacenId = BigInt(almacenIdParam);

    const almacen = await prisma.almacen.findFirst({
      where: { id: almacenId, activo: true },
      select: {
        id: true,
        codigo: true,
        nombre: true,
      },
    });

    if (!almacen) {
      return NextResponse.json(
        {
          ok: false,
          error: "El almacén no existe o se encuentra inactivo.",
        },
        { status: 404 }
      );
    }

    const existencias = await prisma.producto_almacen.findMany({
      where: {
        almacenId,
        activo: true,
        producto: { activo: true },
      },
      select: {
        id: true,
        productoId: true,
        almacenId: true,
        stockActual: true,
        stockMinimo: true,
        activo: true,
        producto: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            descripcion: true,
            unidad_medida: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                decimalesPermitidos: true,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const data = existencias.map((existencia) => ({
      id: bigintToString(existencia.id),
      productoId: bigintToString(existencia.productoId),
      almacenId: bigintToString(existencia.almacenId),
      stockActual: decimalToString(existencia.stockActual),
      stockMinimo: decimalToString(existencia.stockMinimo),
      activo: existencia.activo,
      producto: {
        id: bigintToString(existencia.producto.id),
        codigo: existencia.producto.codigo,
        nombre: existencia.producto.nombre,
        descripcion: existencia.producto.descripcion,
        unidadMedida: {
          id: bigintToString(existencia.producto.unidad_medida.id),
          codigo: existencia.producto.unidad_medida.codigo,
          nombre: existencia.producto.unidad_medida.nombre,
          decimalesPermitidos:
            existencia.producto.unidad_medida.decimalesPermitidos,
        },
      },
    }));

    return NextResponse.json({
      ok: true,
      data: {
        almacen: {
          id: bigintToString(almacen.id),
          codigo: almacen.codigo,
          nombre: almacen.nombre,
        },
        existencias: data,
      },
    });
  } catch (error) {
    console.error("Error GET /api/producto-almacen:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "No se pudieron obtener las existencias del almacén.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 *
 * Crea la existencia y su movimiento SALDO_INICIAL
 * dentro de una única transacción.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const productoIdParam = body?.productoId;
    const almacenIdParam = body?.almacenId;
    const stockInicial = body?.stockInicial;
    const stockMinimo = body?.stockMinimo;
    const fechaOperacionParam = body?.fechaOperacion;

    // Validar IDs obligatorios.
    if (
      productoIdParam === undefined ||
      productoIdParam === null ||
      productoIdParam === ""
    ) {
      return NextResponse.json(
        { ok: false, error: "El productoId es obligatorio." },
        { status: 400 }
      );
    }

    if (
      almacenIdParam === undefined ||
      almacenIdParam === null ||
      almacenIdParam === ""
    ) {
      return NextResponse.json(
        { ok: false, error: "El almacenId es obligatorio." },
        { status: 400 }
      );
    }

    const productoIdTexto = String(productoIdParam).trim();
    const almacenIdTexto = String(almacenIdParam).trim();

    if (!/^\d+$/.test(productoIdTexto)) {
      return NextResponse.json(
        { ok: false, error: "El productoId no es válido." },
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(almacenIdTexto)) {
      return NextResponse.json(
        { ok: false, error: "El almacenId no es válido." },
        { status: 400 }
      );
    }

    const productoId = BigInt(productoIdTexto);
    const almacenId = BigInt(almacenIdTexto);

    // Validar fecha de operación.
    const fechaOperacion = validarFechaOperacion(fechaOperacionParam);

    if (!fechaOperacion) {
      return NextResponse.json(
        {
          ok: false,
          error: "La fecha de operación es obligatoria y debe ser válida.",
        },
        { status: 400 }
      );
    }

    // Verificar producto activo y obtener sus datos históricos.
    const producto = await prisma.producto.findFirst({
      where: { id: productoId, activo: true },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        unidad_medida: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            decimalesPermitidos: true,
            activo: true,
          },
        },
      },
    });

    if (!producto) {
      return NextResponse.json(
        {
          ok: false,
          error: "El producto no existe o se encuentra inactivo.",
        },
        { status: 404 }
      );
    }

    if (!producto.unidad_medida.activo) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La unidad de medida del producto se encuentra inactiva. No se puede registrar la existencia.",
        },
        { status: 409 }
      );
    }

    const decimalesPermitidos =
      producto.unidad_medida.decimalesPermitidos;

    // Validar stock inicial.
    const resultadoStockInicial = validarStock(
      stockInicial,
      "stockInicial",
      decimalesPermitidos
    );

    if (!resultadoStockInicial.ok) {
      return NextResponse.json(
        { ok: false, error: resultadoStockInicial.error },
        { status: 400 }
      );
    }

    // Validar stock mínimo.
    const resultadoStockMinimo = validarStock(
      stockMinimo,
      "stockMinimo",
      decimalesPermitidos
    );

    if (!resultadoStockMinimo.ok) {
      return NextResponse.json(
        { ok: false, error: resultadoStockMinimo.error },
        { status: 400 }
      );
    }

    // Verificar almacén activo.
    const almacen = await prisma.almacen.findFirst({
      where: { id: almacenId, activo: true },
      select: {
        id: true,
        codigo: true,
        nombre: true,
      },
    });

    if (!almacen) {
      return NextResponse.json(
        {
          ok: false,
          error: "El almacén no existe o se encuentra inactivo.",
        },
        { status: 404 }
      );
    }

    // Verificar que no exista ya la relación producto + almacén.
    const existenciaActual = await prisma.producto_almacen.findFirst({
      where: { productoId, almacenId },
      select: { id: true },
    });

    if (existenciaActual) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El producto ya está asociado a este almacén. No se puede registrar nuevamente la existencia.",
        },
        { status: 409 }
      );
    }

    // Usuario temporal de pruebas.
    const usuarioId = BigInt(1);

    const usuario = await prisma.usuario.findFirst({
      where: { id: usuarioId, activo: true },
      select: { id: true },
    });

    if (!usuario) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No se puede registrar el movimiento: el usuario de pruebas ID 1 no existe o está inactivo.",
        },
        { status: 409 }
      );
    }

    // Verificar el tipo y motivo de saldo inicial.
    const tipoMovimiento = await prisma.tipo_movimiento.findFirst({
      where: { codigo: "SALDO_INICIAL", activo: true },
      select: { id: true },
    });

    if (!tipoMovimiento) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No está configurado el tipo de movimiento SALDO_INICIAL.",
        },
        { status: 409 }
      );
    }

    const motivoMovimiento = await prisma.motivo_movimiento.findFirst({
      where: {
        tipoMovimientoId: tipoMovimiento.id,
        codigo: "SALDO_INICIAL",
        signo: 1,
        activo: true,
      },
      select: { id: true },
    });

    if (!motivoMovimiento) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No está configurado el motivo SALDO_INICIAL con signo positivo.",
        },
        { status: 409 }
      );
    }

    // Crear existencia y movimiento en una sola transacción.
    const existencia = await prisma.$transaction(async (tx) => {
      // Revalidar duplicado dentro de la transacción.
      const duplicado = await tx.producto_almacen.findFirst({
        where: { productoId, almacenId },
        select: { id: true },
      });

      if (duplicado) {
        throw new Error("EXISTENCIA_DUPLICADA");
      }

      const nuevaExistencia = await tx.producto_almacen.create({
        data: {
          productoId,
          almacenId,
          stockActual: resultadoStockInicial.value,
          stockMinimo: resultadoStockMinimo.value,
          activo: true,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          productoId: true,
          almacenId: true,
          stockActual: true,
          stockMinimo: true,
          activo: true,
          producto: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              unidad_medida: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                  decimalesPermitidos: true,
                },
              },
            },
          },
          almacen: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
        },
      });

      // Cantidad positiva; el signo del motivo determina la dirección.
      await tx.movimiento_inventario.create({
        data: {
          productoAlmacenId: nuevaExistencia.id,
          usuarioId,
          tipoMovimientoId: tipoMovimiento.id,
          motivoMovimientoId: motivoMovimiento.id,
          cantidad: resultadoStockInicial.value,
          fechaOperacion,
          referencia: "SALDO-INICIAL",
          observacion:
            "Registro del saldo inicial al incorporar el producto al almacén.",
          productoCodigoSnapshot: producto.codigo,
          productoNombreSnapshot: producto.nombre,
          unidadCodigoSnapshot: producto.unidad_medida.codigo,
          unidadNombreSnapshot: producto.unidad_medida.nombre,
        },
      });

      return nuevaExistencia;
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: bigintToString(existencia.id),
          productoId: bigintToString(existencia.productoId),
          almacenId: bigintToString(existencia.almacenId),
          stockActual: decimalToString(existencia.stockActual),
          stockMinimo: decimalToString(existencia.stockMinimo),
          activo: existencia.activo,
          producto: {
            id: bigintToString(existencia.producto.id),
            codigo: existencia.producto.codigo,
            nombre: existencia.producto.nombre,
            unidadMedida: {
              id: bigintToString(existencia.producto.unidad_medida.id),
              codigo: existencia.producto.unidad_medida.codigo,
              nombre: existencia.producto.unidad_medida.nombre,
              decimalesPermitidos:
                existencia.producto.unidad_medida.decimalesPermitidos,
            },
          },
          almacen: {
            id: bigintToString(existencia.almacen.id),
            codigo: existencia.almacen.codigo,
            nombre: existencia.almacen.nombre,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /api/producto-almacen:", error);

    if (
      error instanceof Error &&
      error.message === "EXISTENCIA_DUPLICADA"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El producto ya está asociado a este almacén. No se puede registrar nuevamente la existencia.",
        },
        { status: 409 }
      );
    }

    // Prisma P2002: conflicto de restricción única.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El producto ya está asociado a este almacén o existe un registro duplicado.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo registrar el producto y su saldo inicial.",
      },
      { status: 500 }
    );
  }
}