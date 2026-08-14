import { TicketPriority } from '@prisma/client';

// Semua durasi dalam JAM. Sesuaikan angka ini kalau kebutuhan bisnis beda.
export const SLA_POLICY: Record<TicketPriority, { responseHours: number; resolutionHours: number }> = {
  URGENT: { responseHours: 1, resolutionHours: 4 },
  HIGH: { responseHours: 4, resolutionHours: 24 },
  MEDIUM: { responseHours: 8, resolutionHours: 72 },
  LOW: { responseHours: 24, resolutionHours: 168 }, // 1 minggu
};

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
