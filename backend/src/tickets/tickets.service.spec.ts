import { TicketsService } from './tickets.service';

describe('TicketsService.isOverdue', () => {
  let service: TicketsService;

  beforeEach(() => {
    // Dependency lain gak dipakai oleh isOverdue, aman di-mock kosong
    service = new TicketsService({} as any, {} as any, {} as any, {} as any, {} as any);
  });

  function callIsOverdue(ticket: any) {
    // isOverdue itu private method, diakses lewat cast (as any) khusus untuk keperluan test
    return (service as any).isOverdue(ticket);
  }

  it('tidak overdue kalau status sudah RESOLVED', () => {
    const result = callIsOverdue({
      status: 'RESOLVED',
      resolutionDueAt: new Date('2020-01-01'),
      slaBreached: false,
    });
    expect(result).toBe(false);
  });

  it('overdue kalau slaBreached true meski status masih OPEN', () => {
    const result = callIsOverdue({
      status: 'OPEN',
      resolutionDueAt: new Date(Date.now() + 100000),
      slaBreached: true,
    });
    expect(result).toBe(true);
  });

  it('overdue kalau resolutionDueAt sudah lewat', () => {
    const result = callIsOverdue({
      status: 'IN_PROGRESS',
      resolutionDueAt: new Date(Date.now() - 100000),
      slaBreached: false,
    });
    expect(result).toBe(true);
  });

  it('tidak overdue kalau resolutionDueAt masih di masa depan', () => {
    const result = callIsOverdue({
      status: 'OPEN',
      resolutionDueAt: new Date(Date.now() + 100000),
      slaBreached: false,
    });
    expect(result).toBe(false);
  });
});
