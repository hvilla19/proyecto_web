import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
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
    console.error("Error al consultar categorias:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error al consultar categorias",
      },
      { status: 500 }
    );
  }
}
