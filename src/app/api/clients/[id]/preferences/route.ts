import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.usuario?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const cliente = await prisma.cliente.findUnique({
      where: { id, usuarioId: session.usuario.id },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente not found" }, { status: 404 });
    }

    const preferencia = await prisma.clientPreference.upsert({
      where: { clienteId: id },
      update: data,
      create: {
        clienteId: id,
        ...data,
      },
    });

    return NextResponse.json(preferencia);
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
