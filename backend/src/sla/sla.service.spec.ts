import { SlaService } from './sla.service';

describe('SlaService', () => {
  let service: SlaService;

  beforeEach(() => {
    // PrismaService/NotificationsService/MailService gak dipakai oleh computeDueDates,
    // jadi aman di-mock sebagai objek kosong untuk unit test ini.
    service = new SlaService({} as any, {} as any, {} as any);
  });

  it('menghitung due date URGENT dengan benar (respons 1 jam, resolusi 4 jam)', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const { firstResponseDueAt, resolutionDueAt } = service.computeDueDates('URGENT', from);

    expect(firstResponseDueAt.toISOString()).toBe('2026-01-01T01:00:00.000Z');
    expect(resolutionDueAt.toISOString()).toBe('2026-01-01T04:00:00.000Z');
  });

  it('menghitung due date LOW dengan benar (respons 24 jam, resolusi 7 hari)', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const { firstResponseDueAt, resolutionDueAt } = service.computeDueDates('LOW', from);

    expect(firstResponseDueAt.toISOString()).toBe('2026-01-02T00:00:00.000Z');
    expect(resolutionDueAt.toISOString()).toBe('2026-01-08T00:00:00.000Z');
  });

  it('MEDIUM harus punya due date lebih longgar dari HIGH', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    const medium = service.computeDueDates('MEDIUM', from);
    const high = service.computeDueDates('HIGH', from);

    expect(medium.resolutionDueAt.getTime()).toBeGreaterThan(high.resolutionDueAt.getTime());
  });
});
