import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where: {
        activo: true,
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        activo: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const data = categorias.map((categoria) => ({
      ...categoria,
      id: categoria.id.toString(),
    }));

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Error al listar categorias:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al listar categorias",
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

    const categoriaExistente = await prisma.categoria.findUnique({
      where: {
        codigo,
      },
    });

    if (categoriaExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ya existe una categoria con ese codigo",
        },
        { status: 409 }
      );
    }

    const categoria = await prisma.categoria.create({
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

    return NextResponse.json(
      {
        ok: true,
        data: {
          ...categoria,
          id: categoria.id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear categoria:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al crear categoria",
      },
      { status: 500 }
    );
  }
}

