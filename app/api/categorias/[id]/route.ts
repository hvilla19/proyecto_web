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
          message: "El ID de la categoria no es valido",
        },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.findUnique({
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

    if (!categoria) {
      return NextResponse.json(
        {
          ok: false,
          message: "Categoria no encontrada",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...categoria,
        id: categoria.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al consultar categoria:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al consultar categoria",
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
          message: "El ID de la categoria no es valido",
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

    const categoriaId = BigInt(id);

    const categoriaExistente = await prisma.categoria.findUnique({
      where: {
        id: categoriaId,
      },
    });

    if (!categoriaExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Categoria no encontrada",
        },
        { status: 404 }
      );
    }

    const codigoExistente = await prisma.categoria.findUnique({
      where: {
        codigo,
      },
    });

    if (codigoExistente && codigoExistente.id !== categoriaId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ya existe una categoria con ese codigo",
        },
        { status: 409 }
      );
    }

    const categoria = await prisma.categoria.update({
      where: {
        id: categoriaId,
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
        ...categoria,
        id: categoria.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al actualizar categoria:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al actualizar categoria",
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
          message: "El ID de la categoria no es valido",
        },
        { status: 400 }
      );
    }

    const categoriaId = BigInt(id);

    const categoriaExistente = await prisma.categoria.findUnique({
      where: {
        id: categoriaId,
      },
    });

    if (!categoriaExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Categoria no encontrada",
        },
        { status: 404 }
      );
    }

    if (!categoriaExistente.activo) {
      return NextResponse.json(
        {
          ok: false,
          message: "La categoria ya esta inactiva",
        },
        { status: 409 }
      );
    }

    // Validar dependencias antes de permitir la desactivación.
    // Se consideran todos los productos asociados, incluso los inactivos,
    // para conservar la integridad y trazabilidad del sistema.
    const productosAsociados = await prisma.producto.count({
      where: {
        categoriaId,
      },
    });

    if (productosAsociados > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "No se puede desactivar la categoria porque tiene productos asociados. Debe conservarse para garantizar la integridad y trazabilidad del sistema.",
        },
        { status: 409 }
      );
    }

    const categoria = await prisma.categoria.update({
      where: {
        id: categoriaId,
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
        ...categoria,
        id: categoria.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al desactivar categoria:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al desactivar categoria",
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
          message: "El ID de la categoria no es valido",
        },
        { status: 400 }
      );
    }

    const categoriaId = BigInt(id);

    const categoriaExistente = await prisma.categoria.findUnique({
      where: {
        id: categoriaId,
      },
    });

    if (!categoriaExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Categoria no encontrada",
        },
        { status: 404 }
      );
    }

    if (categoriaExistente.activo) {
      return NextResponse.json(
        {
          ok: false,
          message: "La categoria ya esta activa",
        },
        { status: 409 }
      );
    }

    const categoria = await prisma.categoria.update({
      where: {
        id: categoriaId,
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
        ...categoria,
        id: categoria.id.toString(),
      },
    });
  } catch (error) {
    console.error("Error al reactivar categoria:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al reactivar categoria",
      },
      { status: 500 }
    );
  }
}