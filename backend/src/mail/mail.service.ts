import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly enabled: boolean;
  private readonly fromAddress: string;
  private readonly appUrl: string;

  constructor() {
    this.enabled = process.env.SMTP_ENABLED === 'true';
    this.fromAddress = process.env.MAIL_FROM || 'Ticketing System <[email protected]>';
    this.appUrl = process.env.APP_URL || 'http://localhost:5173';

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true untuk port 465, false untuk port lain (STARTTLS)
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      this.logger.warn(
        'SMTP_ENABLED=false — email tidak akan benar-benar dikirim, hanya di-log ke console.',
      );
    }
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.enabled || !this.transporter) {
      this.logger.log(`[EMAIL DISABLED] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
      this.logger.log(`Email terkirim ke ${to}: ${subject}`);
    } catch (err) {
      // Kegagalan kirim email tidak boleh membuat request utama (create ticket, dll) gagal
      this.logger.error(`Gagal kirim email ke ${to}: ${err.message}`);
    }
  }

  private wrapTemplate(title: string, bodyHtml: string, ticketId?: string) {
    const ticketLink = ticketId ? `${this.appUrl}/tickets/${ticketId}` : this.appUrl;
    return `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #1e293b;">${title}</h2>
        ${bodyHtml}
        <a href="${ticketLink}"
           style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">
          Buka Ticket
        </a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
          Email otomatis dari Ticketing System — jangan dibalas langsung ke email ini.
        </p>
      </div>
    `;
  }

  async sendTicketCreated(to: string, ticketTitle: string, ticketId: string, requesterName: string) {
    const html = this.wrapTemplate(
      'Ticket Baru Dibuat',
      `<p><strong>${requesterName}</strong> membuat ticket baru:</p>
       <p style="padding: 12px; background: #f1f5f9; border-radius: 6px;">${ticketTitle}</p>`,
      ticketId,
    );
    await this.send(to, `[Ticket Baru] ${ticketTitle}`, html);
  }

  async sendTicketAssigned(to: string, ticketTitle: string, ticketId: string) {
    const html = this.wrapTemplate(
      'Ticket Di-assign ke Kamu',
      `<p>Kamu ditugaskan untuk menangani ticket:</p>
       <p style="padding: 12px; background: #f1f5f9; border-radius: 6px;">${ticketTitle}</p>`,
      ticketId,
    );
    await this.send(to, `[Ticket Assigned] ${ticketTitle}`, html);
  }

  async sendStatusChanged(to: string, ticketTitle: string, ticketId: string, newStatus: string) {
    const html = this.wrapTemplate(
      'Status Ticket Berubah',
      `<p>Status ticket <strong>${ticketTitle}</strong> berubah menjadi:</p>
       <p style="padding: 12px; background: #f1f5f9; border-radius: 6px; font-weight: 600;">${newStatus.replace('_', ' ')}</p>`,
      ticketId,
    );
    await this.send(to, `[Update Status] ${ticketTitle}`, html);
  }

  async sendNewComment(to: string, ticketTitle: string, ticketId: string, authorName: string, commentBody: string) {
    const truncated = commentBody.length > 200 ? commentBody.slice(0, 200) + '...' : commentBody;
    const html = this.wrapTemplate(
      'Balasan Baru di Ticket',
      `<p><strong>${authorName}</strong> membalas ticket <strong>${ticketTitle}</strong>:</p>
       <p style="padding: 12px; background: #f1f5f9; border-radius: 6px;">${truncated}</p>`,
      ticketId,
    );
    await this.send(to, `[Balasan Baru] ${ticketTitle}`, html);
  }
}
