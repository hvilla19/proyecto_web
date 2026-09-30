import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        activo: true,
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
      orderBy: {
        id: "asc",
      },
    });

    const data = productos.map((producto) => ({
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
    }));

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Error al listar productos:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al listar productos",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const productoExistente = await prisma.producto.findUnique({
      where: {
        codigo,
      },
    });

    if (productoExistente) {
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
          message: "La unidad de medida seleccionada esta inactiva",
        },
        { status: 409 }
      );
    }

    const producto = await prisma.producto.create({
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

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear producto:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al crear producto",
      },
      { status: 500 }
    );
  }
}