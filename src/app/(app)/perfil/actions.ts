"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const perfilSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  telefone: z.string().optional(),
});

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
});

export async function atualizarPerfil(data: { nome: string; telefone?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    const parsed = perfilSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        nome: parsed.data.nome,
        telefone: parsed.data.telefone,
      },
    });

    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { error: "Erro interno ao atualizar perfil" };
  }
}

export async function alterarSenha(data: { senhaAtual: string; novaSenha: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    const parsed = senhaSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
    });

    if (!usuario) {
      return { error: "Usuário não encontrado" };
    }

    if (!usuario.senhaHash) {
      return { error: "Esta conta usa login pelo Google. Defina uma senha nas configurações de segurança da conta Google." };
    }

    const senhaCorreta = await bcrypt.compare(parsed.data.senhaAtual, usuario.senhaHash);
    if (!senhaCorreta) {
      return { error: "Senha atual incorreta" };
    }

    const novaSenhaHash = await bcrypt.hash(parsed.data.novaSenha, 12);

    await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        senhaHash: novaSenhaHash,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return { error: "Erro interno ao alterar senha" };
  }
}

export async function getPerfil() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatarUrl: true,
        criadoEm: true,
        senhaHash: true,
      }
    });

    if (!usuario) return { error: "Usuário não encontrado" };

    const isOAuthOnly = !usuario.senhaHash;
    const { senhaHash, ...usuarioData } = usuario;

    return { success: true, usuario: usuarioData, isOAuthOnly };
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return { error: "Erro interno" };
  }
}

export async function atualizarAvatarUrl(url: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    await prisma.usuario.update({
      where: { id: session.user.id },
      data: { avatarUrl: url },
    });

    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar avatar:", error);
    return { error: "Erro interno ao atualizar avatar" };
  }
}
