import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { Resend } from 'resend';

export const server = {
  sendMessage: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(2).max(80),
      email: z.string().email(),
      message: z.string().min(10).max(2000),
      website: z.string().max(0).optional(), // honeypot
    }),
    handler: async ({ name, email, message }) => {
      const key = import.meta.env.RESEND_API_KEY;
      const to = import.meta.env.CONTACT_EMAIL;
      if (!key || !to) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'El envío aún no está configurado.' });
      const { error } = await new Resend(key).emails.send({
        from: 'Portafolio <onboarding@resend.dev>',
        to,
        replyTo: email,
        subject: `Nuevo mensaje de ${name}`,
        text: `${name} <${email}>\n\n${message}`,
      });
      if (error) throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'No se pudo enviar el mensaje.' });
      return { ok: true };
    },
  }),
};
