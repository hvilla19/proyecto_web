import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const almacenes = await prisma.almacen.findMany({
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

    const data = almacenes.map((almacen) => ({
      ...almacen,
      id: almacen.id.toString(),
    }));

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Error al listar almacenes:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al listar almacenes",
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

    const almacenExistente = await prisma.almacen.findUnique({
      where: {
        codigo,
      },
    });

    if (almacenExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ya existe un almacen con ese codigo",
        },
        { status: 409 }
      );
    }

    const almacen = await prisma.almacen.create({
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
          ...almacen,
          id: almacen.id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear almacen:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al crear almacen",
      },
      { status: 500 }
    );
  }
}