import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const unidadesMedida = await prisma.unidad_medida.findMany({
      where: {
        activo: true,
      },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        decimalesPermitidos: true,
        activo: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const data = unidadesMedida.map((unidad) => ({
      ...unidad,
      id: unidad.id.toString(),
    }));

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Error al listar unidades de medida:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al listar unidades de medida",
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
          message: "Los decimales permitidos deben ser un numero entero entre 0 y 6",
        },
        { status: 400 }
      );
    }

    const unidadExistente = await prisma.unidad_medida.findUnique({
      where: {
        codigo,
      },
    });

    if (unidadExistente) {
      return NextResponse.json(
        {
          ok: false,
          message: "Ya existe una unidad de medida con ese codigo",
        },
        { status: 409 }
      );
    }

    const unidadMedida = await prisma.unidad_medida.create({
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

    return NextResponse.json(
      {
        ok: true,
        data: {
          ...unidadMedida,
          id: unidadMedida.id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear unidad de medida:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al crear unidad de medida",
      },
      { status: 500 }
    );
  }
}