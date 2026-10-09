
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validarId(id: string): boolean {
    if (!/^\d+$/.test(id)) {
      return false;
    }
  
    try {
      return BigInt(id) > BigInt(0);
    } catch {
      return false;
    }
  }

/**
 * Valida el stock mínimo según la precisión de la unidad de medida.
 */
function validarStockMinimo(
  value: unknown,
  decimalesPermitidos: number
):
  | { ok: true; value: string }
  | { ok: false; error: string } {
  if (
    value === undefined ||
    value === null ||
    (typeof value !== "string" && typeof value !== "number")
  ) {
    return {
      ok: false,
      error: "El stock mínimo es obligatorio.",
    };
  }

  const valor = String(value).trim();

  if (!/^\d+(?:\.\d+)?$/.test(valor)) {
    return {
      ok: false,
      error: "El stock mínimo debe ser un número mayor o igual a cero.",
    };
  }

  const partes = valor.split(".");
  const parteEntera = partes[0];
  const parteDecimal = partes[1] ?? "";

  if (
    parteEntera.length + parteDecimal.length > 18 ||
    parteDecimal.length > 6
  ) {
    return {
      ok: false,
      error: "El stock mínimo supera la precisión permitida.",
    };
  }

  if (parteDecimal.length > decimalesPermitidos) {
    return {
      ok: false,
      error: `La unidad de medida permite como máximo ${decimalesPermitidos} decimales.`,
    };
  }

  return { ok: true, value: valor };
}

/**
 * PATCH: permite actualizar únicamente el stock mínimo.
 */
export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!validarId(id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "El ID de la existencia no es válido.",
        },
        { status: 400 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message: "La solicitud no contiene datos válidos.",
        },
        { status: 400 }
      );
    }

    const campos = Object.keys(body);

    if (campos.length !== 1 || campos[0] !== "stockMinimo") {
      return NextResponse.json(
        {
          ok: false,
          message: "Solo se permite modificar el stock mínimo.",
        },
        { status: 400 }
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const existenciaId = BigInt(id);

      const filas = await tx.$queryRaw<{ id: bigint }[]>`
        SELECT id
        FROM "producto_almacen"
        WHERE id = ${existenciaId}
        FOR UPDATE
      `;

      if (filas.length === 0) {
        return {
          error: "No se encontró la existencia solicitada.",
          status: 404,
        };
      }

      const existencia = await tx.producto_almacen.findUnique({
        where: { id: existenciaId },
        include: {
          producto: {
            select: {
              activo: true,
              unidad_medida: {
                select: {
                  decimalesPermitidos: true,
                  activo: true,
                },
              },
            },
          },
          almacen: {
            select: {
              activo: true,
            },
          },
        },
      });

      if (!existencia) {
        return {
          error: "No se encontró la existencia solicitada.",
          status: 404,
        };
      }

      if (!existencia.activo) {
        return {
          error: "No se puede editar una existencia que ya fue eliminada.",
          status: 409,
        };
      }

      if (
        !existencia.producto.activo ||
        !existencia.producto.unidad_medida.activo ||
        !existencia.almacen.activo
      ) {
        return {
          error:
            "No se puede editar porque el producto, la unidad de medida o el almacén relacionado no está disponible.",
          status: 409,
        };
      }

      const validacion = validarStockMinimo(
        body.stockMinimo,
        existencia.producto.unidad_medida.decimalesPermitidos
      );

      if (!validacion.ok) {
        return {
          error: validacion.error,
          status: 400,
        };
      }

      const actualizada = await tx.producto_almacen.update({
        where: { id: existenciaId },
        data: {
          stockMinimo: validacion.value,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          productoId: true,
          almacenId: true,
          stockActual: true,
          stockMinimo: true,
          activo: true,
          updatedAt: true,
        },
      });

      return {
        data: {
          id: actualizada.id.toString(),
          productoId: actualizada.productoId.toString(),
          almacenId: actualizada.almacenId.toString(),
          stockActual: actualizada.stockActual.toString(),
          stockMinimo: actualizada.stockMinimo.toString(),
          activo: actualizada.activo,
          updatedAt: actualizada.updatedAt,
        },
      };
    });

    if ("error" in resultado) {
      return NextResponse.json(
        {
          ok: false,
          message: resultado.error,
        },
        { status: resultado.status }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Stock mínimo actualizado correctamente.",
      data: resultado.data,
    });
  } catch (error) {
    console.error("Error al actualizar el stock mínimo:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Ocurrió un error al actualizar el stock mínimo.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE: elimina la existencia desde el punto de vista del usuario.
 * Internamente conserva el registro y su historial.
 */
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!validarId(id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "El ID de la existencia no es válido.",
        },
        { status: 400 }
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const existenciaId = BigInt(id);

      const filas = await tx.$queryRaw<{ id: bigint }[]>`
        SELECT id
        FROM "producto_almacen"
        WHERE id = ${existenciaId}
        FOR UPDATE
      `;

      if (filas.length === 0) {
        return {
          error: "No se encontró la existencia que deseas eliminar.",
          status: 404,
        };
      }

      const existencia = await tx.producto_almacen.findUnique({
        where: { id: existenciaId },
        select: {
          id: true,
          stockActual: true,
          activo: true,
        },
      });

      if (!existencia) {
        return {
          error: "No se encontró la existencia que deseas eliminar.",
          status: 404,
        };
      }

      if (!existencia.activo) {
        return {
          error: "Esta existencia ya fue eliminada.",
          status: 409,
        };
      }

      if (existencia.stockActual.comparedTo(0) !== 0) {
        return {
          error:
            "No puedes eliminar esta existencia porque todavía tiene stock. El stock actual debe ser cero.",
          status: 409,
        };
      }

      const transferenciasPendientes =
        await tx.transferencia_detalle.count({
          where: {
            OR: [
              { productoAlmacenOrigenId: existenciaId },
              { productoAlmacenDestinoId: existenciaId },
            ],
            transferencia: {
              estado: {
                notIn: ["RECIBIDA", "CANCELADA"],
              },
            },
          },
        });

      if (transferenciasPendientes > 0) {
        return {
          error:
            "No puedes eliminar esta existencia porque está relacionada con transferencias pendientes o cuyo estado necesita revisión.",
          status: 409,
        };
      }

      const eliminada = await tx.producto_almacen.update({
        where: { id: existenciaId },
        data: {
          activo: false,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          productoId: true,
          almacenId: true,
          stockActual: true,
          stockMinimo: true,
          activo: true,
        },
      });

      return {
        data: {
          id: eliminada.id.toString(),
          productoId: eliminada.productoId.toString(),
          almacenId: eliminada.almacenId.toString(),
          stockActual: eliminada.stockActual.toString(),
          stockMinimo: eliminada.stockMinimo.toString(),
          activo: eliminada.activo,
        },
      };
    });

    if ("error" in resultado) {
      return NextResponse.json(
        {
          ok: false,
          message: resultado.error,
        },
        { status: resultado.status }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Existencia eliminada correctamente.",
      data: resultado.data,
    });
  } catch (error) {
    console.error("Error al eliminar la existencia:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Ocurrió un error al eliminar la existencia.",
      },
      { status: 500 }
    );
  }
}