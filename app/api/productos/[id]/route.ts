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
          message: "El ID del producto no es valido",
        },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.findUnique({
      where: {
        id: BigInt(id),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        categoriaId: true,
        unidadMedidaId: true,
        activo: true,
        categoria: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            activo: true,
          },
        },
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
          message: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: producto.id.toString(),
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoriaId: producto.categoriaId.toString(),
        unidadMedidaId: producto.unidadMedidaId.toString(),
        activo: producto.activo,

        categoria: {
          id: producto.categoria.id.toString(),
          codigo: producto.categoria.codigo,
          nombre: producto.categoria.nombre,
          activo: producto.categoria.activo,
        },

        unidadMedida: {
          id: producto.unidad_medida.id.toString(),
          codigo: producto.unidad_medida.codigo,
          nombre: producto.unidad_medida.nombre,
          decimalesPermitidos:
            producto.unidad_medida.decimalesPermitidos,
          activo: producto.unidad_medida.activo,
        },
      },
    });
  } catch (error) {
    console.error("Error al consultar producto:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al consultar producto",
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
          message: "El ID del producto no es valido",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const codigo = body.codigo?.trim().toUpperCase();
    const nombre = body.nombre?.trim().toUpperCase();
    const descripcion = body.descripcion?.trim() || null;

    const categoriaId = body.categoriaId;
    const unidadMedidaId = body.unidadMedidaId;

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
      categoriaId === undefined ||
      categoriaId === null ||
      categoriaId === "" ||
      !/^\d+$/.test(String(categoriaId))
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "La categoria es obligatoria",
        },
        { status: 400 }
      );
    }

    if (
      unidadMedidaId === undefined ||
      unidadMedidaId === null ||
      unidadMedidaId === "" ||
      !/^\d+$/.test(String(unidadMedidaId))
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "La unidad de medida es obligatoria",
        },
        { status: 400 }
      );
    }

    const productoId = BigInt(id);

    const productoExistente = await prisma.producto.findUnique({
      where: {
        id: productoId,
      },
    });

    if (!productoExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    const codigoExistente = await prisma.producto.findUnique({
      where: {
        codigo,
      },
    });

    if (
      codigoExistente &&
      codigoExistente.id !== productoId
    ) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ya existe un producto con ese codigo",
        },
        { status: 409 }
      );
    }

    const categoria = await prisma.categoria.findUnique({
      where: {
        id: BigInt(String(categoriaId)),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        activo: true,
      },
    });

    if (!categoria) {
      return NextResponse.json(
        {
          ok: false,
          message: "La categoria no existe",
        },
        { status: 404 }
      );
    }

    if (!categoria.activo) {
      return NextResponse.json(
        {
          ok: false,
          message: "La categoria seleccionada esta inactiva",
        },
        { status: 409 }
      );
    }

    const unidadMedida = await prisma.unidad_medida.findUnique({
      where: {
        id: BigInt(String(unidadMedidaId)),
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
          message: "La unidad de medida no existe",
        },
        { status: 404 }
      );
    }

    if (!unidadMedida.activo) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La unidad de medida seleccionada esta inactiva",
        },
        { status: 409 }
      );
    }

    const producto = await prisma.producto.update({
      where: {
        id: productoId,
      },
      data: {
        codigo,
        nombre,
        descripcion,
        categoriaId: categoria.id,
        unidadMedidaId: unidadMedida.id,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        categoriaId: true,
        unidadMedidaId: true,
        activo: true,
        categoria: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        unidad_medida: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            decimalesPermitidos: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: producto.id.toString(),
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoriaId: producto.categoriaId.toString(),
        unidadMedidaId: producto.unidadMedidaId.toString(),
        activo: producto.activo,

        categoria: {
          id: producto.categoria.id.toString(),
          codigo: producto.categoria.codigo,
          nombre: producto.categoria.nombre,
        },

        unidadMedida: {
          id: producto.unidad_medida.id.toString(),
          codigo: producto.unidad_medida.codigo,
          nombre: producto.unidad_medida.nombre,
          decimalesPermitidos:
            producto.unidad_medida.decimalesPermitidos,
        },
      },
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al actualizar producto",
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
          message: "El ID del producto no es valido",
        },
        { status: 400 }
      );
    }

    const productoId = BigInt(id);

    const productoExistente = await prisma.producto.findUnique({
      where: {
        id: productoId,
      },
    });

    if (!productoExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    if (!productoExistente.activo) {
      return NextResponse.json(
        {
          ok: false,
          message: "El producto ya esta inactivo",
        },
        { status: 409 }
      );
    }

    const producto = await prisma.producto.update({
      where: {
        id: productoId,
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
        categoriaId: true,
        unidadMedidaId: true,
        activo: true,
        categoria: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        unidad_medida: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            decimalesPermitidos: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: producto.id.toString(),
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoriaId: producto.categoriaId.toString(),
        unidadMedidaId: producto.unidadMedidaId.toString(),
        activo: producto.activo,

        categoria: {
          id: producto.categoria.id.toString(),
          codigo: producto.categoria.codigo,
          nombre: producto.categoria.nombre,
        },

        unidadMedida: {
          id: producto.unidad_medida.id.toString(),
          codigo: producto.unidad_medida.codigo,
          nombre: producto.unidad_medida.nombre,
          decimalesPermitidos:
            producto.unidad_medida.decimalesPermitidos,
        },
      },
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al eliminar producto",
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
          message: "El ID del producto no es valido",
        },
        { status: 400 }
      );
    }

    const productoId = BigInt(id);

    const productoExistente = await prisma.producto.findUnique({
      where: {
        id: productoId,
      },
    });

    if (!productoExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Producto no encontrado",
        },
        { status: 404 }
      );
    }

    if (productoExistente.activo) {
      return NextResponse.json(
        {
          ok: false,
          message: "El producto ya esta activo",
        },
        { status: 409 }
      );
    }

    const producto = await prisma.producto.update({
      where: {
        id: productoId,
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
        categoriaId: true,
        unidadMedidaId: true,
        activo: true,
        categoria: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        unidad_medida: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            decimalesPermitidos: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        id: producto.id.toString(),
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoriaId: producto.categoriaId.toString(),
        unidadMedidaId: producto.unidadMedidaId.toString(),
        activo: producto.activo,

        categoria: {
          id: producto.categoria.id.toString(),
          codigo: producto.categoria.codigo,
          nombre: producto.categoria.nombre,
        },

        unidadMedida: {
          id: producto.unidad_medida.id.toString(),
          codigo: producto.unidad_medida.codigo,
          nombre: producto.unidad_medida.nombre,
          decimalesPermitidos:
            producto.unidad_medida.decimalesPermitidos,
        },
      },
    });
  } catch (error) {
    console.error("Error al reactivar producto:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al reactivar producto",
      },
      { status: 500 }
    );
  }
}