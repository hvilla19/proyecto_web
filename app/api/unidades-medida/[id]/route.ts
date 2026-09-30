import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "El ID de la unidad de medida no es valido",
        },
        { status: 400 }
      );
    }

    const unidadMedida = await prisma.unidad_medida.findUnique({
      where: {
        id: BigInt(id),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        decimalesPermitidos: true,
        activo: true,
      },
    });

    if (!unidadMedida) {
      return NextResponse.json(
        {
          ok: false,
          message: "Unidad de medida no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...unidadMedida,
        id: unidadMedida.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al consultar unidad de medida:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al consultar unidad de medida",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "El ID de la unidad de medida no es valido",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const codigo = body.codigo?.trim().toUpperCase();
    const nombre = body.nombre?.trim().toUpperCase();
    const decimalesPermitidos = Number(body.decimalesPermitidos);

    if (!codigo || !nombre) {
      return NextResponse.json(
        {
          ok: false,
          message: "El codigo y el nombre son obligatorios",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(decimalesPermitidos) ||
      decimalesPermitidos < 0 ||
      decimalesPermitidos > 6
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Los decimales permitidos deben ser un numero entero entre 0 y 6",
        },
        { status: 400 }
      );
    }

    const unidadMedidaId = BigInt(id);

    const unidadExistente = await prisma.unidad_medida.findUnique({
      where: {
        id: unidadMedidaId,
      },
    });

    if (!unidadExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Unidad de medida no encontrada",
        },
        { status: 404 }
      );
    }

    const codigoExistente = await prisma.unidad_medida.findUnique({
      where: {
        codigo,
      },
    });

    if (codigoExistente && codigoExistente.id !== unidadMedidaId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ya existe una unidad de medida con ese codigo",
        },
        { status: 409 }
      );
    }

    const unidadMedida = await prisma.unidad_medida.update({
      where: {
        id: unidadMedidaId,
      },
      data: {
        codigo,
        nombre,
        decimalesPermitidos,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        decimalesPermitidos: true,
        activo: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...unidadMedida,
        id: unidadMedida.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al actualizar unidad de medida:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al actualizar unidad de medida",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "El ID de la unidad de medida no es valido",
        },
        { status: 400 }
      );
    }

    const unidadMedidaId = BigInt(id);

    const unidadExistente = await prisma.unidad_medida.findUnique({
      where: {
        id: unidadMedidaId,
      },
    });

    if (!unidadExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Unidad de medida no encontrada",
        },
        { status: 404 }
      );
    }

    if (!unidadExistente.activo) {
      return NextResponse.json(
        {
          ok: false,
          message: "La unidad de medida ya esta inactiva",
        },
        { status: 409 }
      );
    }

    const productosAsociados = await prisma.producto.count({
      where: {
        unidadMedidaId,
      },
    });
    console.log("DEBUG unidadMedidaId:", unidadMedidaId.toString());
    console.log("DEBUG productosAsociados:", productosAsociados);

    if (productosAsociados > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No se puede desactivar la unidad de medida porque tiene productos asociados. Debe conservarse para garantizar la integridad y trazabilidad del sistema.",
        },
        { status: 409 }
      );
    }

    const unidadMedida = await prisma.unidad_medida.update({
      where: {
        id: unidadMedidaId,
      },
      data: {
        activo: false,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        decimalesPermitidos: true,
        activo: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...unidadMedida,
        id: unidadMedida.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al eliminar unidad de medida:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al eliminar unidad de medida",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "El ID de la unidad de medida no es valido",
        },
        { status: 400 }
      );
    }

    const unidadMedidaId = BigInt(id);

    const unidadExistente = await prisma.unidad_medida.findUnique({
      where: {
        id: unidadMedidaId,
      },
    });

    if (!unidadExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Unidad de medida no encontrada",
        },
        { status: 404 }
      );
    }

    if (unidadExistente.activo) {
      return NextResponse.json(
        {
          ok: false,
          message: "La unidad de medida ya esta activa",
        },
        { status: 409 }
      );
    }

    const unidadMedida = await prisma.unidad_medida.update({
      where: {
        id: unidadMedidaId,
      },
      data: {
        activo: true,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        decimalesPermitidos: true,
        activo: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...unidadMedida,
        id: unidadMedida.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al reactivar unidad de medida:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al reactivar unidad de medida",
      },
      { status: 500 }
    );
  }
}
