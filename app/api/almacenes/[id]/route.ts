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
          message: "El ID del almacen no es valido",
        },
        { status: 400 }
      );
    }

    const almacen = await prisma.almacen.findUnique({
      where: {
        id: BigInt(id),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        activo: true,
      },
    });

    if (!almacen) {
      return NextResponse.json(
        {
          ok: false,
          message: "Almacen no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...almacen,
        id: almacen.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al consultar almacen:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al consultar almacen",
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
          message: "El ID del almacen no es valido",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const codigo = body.codigo?.trim().toUpperCase();
    const nombre = body.nombre?.trim().toUpperCase();
    const descripcion = body.descripcion?.trim().toUpperCase() || null;

    if (!codigo || !nombre) {
      return NextResponse.json(
        {
          ok: false,
          message: "El codigo y el nombre son obligatorios",
        },
        { status: 400 }
      );
    }

    const almacenId = BigInt(id);

    const almacenExistente = await prisma.almacen.findUnique({
      where: {
        id: almacenId,
      },
    });

    if (!almacenExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Almacen no encontrado",
        },
        { status: 404 }
      );
    }

    const codigoExistente = await prisma.almacen.findUnique({
      where: {
        codigo,
      },
    });

    if (codigoExistente && codigoExistente.id !== almacenId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ya existe un almacen con ese codigo",
        },
        { status: 409 }
      );
    }

    const almacen = await prisma.almacen.update({
      where: {
        id: almacenId,
      },
      data: {
        codigo,
        nombre,
        descripcion,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        activo: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...almacen,
        id: almacen.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al actualizar almacen:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al actualizar almacen",
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
          message: "El ID del almacen no es valido",
        },
        { status: 400 }
      );
    }

    const almacenId = BigInt(id);

    const almacenExistente = await prisma.almacen.findUnique({
      where: {
        id: almacenId,
      },
    });

    if (!almacenExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Almacen no encontrado",
        },
        { status: 404 }
      );
    }

    if (!almacenExistente.activo) {
      return NextResponse.json(
        {
          ok: false,
          message: "El almacen ya esta inactivo",
        },
        { status: 409 }
      );
    }

    // Validar productos asociados al almacen.
    // Se consideran todos los registros, incluso los inactivos,
    // para conservar la integridad y trazabilidad del sistema.
    const productosAsociados = await prisma.producto_almacen.count({
      where: {
        almacenId,
      },
    });

    if (productosAsociados > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No se puede desactivar el almacen porque tiene productos asociados. Debe conservarse para garantizar la integridad y trazabilidad del sistema.",
        },
        { status: 409 }
      );
    }

    // Validar transferencias donde el almacen participa como origen.
    const transferenciasOrigen = await prisma.transferencia.count({
      where: {
        almacenOrigenId: almacenId,
      },
    });

    if (transferenciasOrigen > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No se puede desactivar el almacen porque tiene transferencias registradas como almacen de origen. Debe conservarse para garantizar la integridad y trazabilidad del sistema.",
        },
        { status: 409 }
      );
    }

    // Validar transferencias donde el almacen participa como destino.
    const transferenciasDestino = await prisma.transferencia.count({
      where: {
        almacenDestinoId: almacenId,
      },
    });

    if (transferenciasDestino > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No se puede desactivar el almacen porque tiene transferencias registradas como almacen de destino. Debe conservarse para garantizar la integridad y trazabilidad del sistema.",
        },
        { status: 409 }
      );
    }

    const almacen = await prisma.almacen.update({
      where: {
        id: almacenId,
      },
      data: {
        activo: false,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        activo: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...almacen,
        id: almacen.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al desactivar almacen:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al desactivar almacen",
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
          message: "El ID del almacen no es valido",
        },
        { status: 400 }
      );
    }

    const almacenId = BigInt(id);

    const almacenExistente = await prisma.almacen.findUnique({
      where: {
        id: almacenId,
      },
    });

    if (!almacenExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Almacen no encontrado",
        },
        { status: 404 }
      );
    }

    if (almacenExistente.activo) {
      return NextResponse.json(
        {
          ok: false,
          message: "El almacen ya esta activo",
        },
        { status: 409 }
      );
    }

    const almacen = await prisma.almacen.update({
      where: {
        id: almacenId,
      },
      data: {
        activo: true,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        activo: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        ...almacen,
        id: almacen.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al reactivar almacen:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al reactivar almacen",
      },
      { status: 500 }
    );
  }
}