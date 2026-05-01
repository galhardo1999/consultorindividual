import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const urlBase = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const enviarEmailRecuperacaoSenha = async (
  emailDestino: string,
  nomeUsuario: string,
  token: string
): Promise<void> => {
  const linkRecuperacao = `${urlBase}/redefinir-senha/${token}`;

  await resend.emails.send({
    from: "Prime Realty CRM <onboarding@resend.dev>",
    to: emailDestino,
    subject: "Recuperação de senha — Prime Realty CRM",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recuperação de Senha</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:16px;border:1px solid #22222f;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4347cc,#6470f3);padding:32px;text-align:center;">
              <p style="margin:0;font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.5px;">🏠 Prime Realty CRM</p>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.75);">Recuperação de senha</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 36px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#e8e8f0;">Olá, ${nomeUsuario}!</p>
              <p style="margin:12px 0 28px;font-size:15px;color:#9494ae;line-height:1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta no Prime Realty CRM.
                Clique no botão abaixo para criar uma nova senha. O link expira em <strong style="color:#c2c2d4;">1 hora</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${linkRecuperacao}"
                       style="display:inline-block;background:linear-gradient(135deg,#5158e8,#6470f3);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
                      Redefinir minha senha
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;font-size:13px;color:#6b6b8a;line-height:1.6;">
                Se você não solicitou a recuperação de senha, ignore este e-mail — sua senha permanece a mesma.<br/>
                Por segurança, nunca compartilhe este link com ninguém.
              </p>
              <hr style="border:none;border-top:1px solid #22222f;margin:28px 0;" />
              <p style="margin:0;font-size:12px;color:#4d4d68;">
                Ou copie e cole este link no navegador:<br/>
                <span style="color:#8193f9;word-break:break-all;">${linkRecuperacao}</span>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0a0a0f;padding:20px 36px;border-top:1px solid #22222f;text-align:center;">
              <p style="margin:0;font-size:12px;color:#4d4d68;">© ${new Date().getFullYear()} Prime Realty CRM · Todos os direitos reservados</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
};
