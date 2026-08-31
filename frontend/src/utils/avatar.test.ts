import { describe, it, expect } from 'vitest';
import { getInitials, getAvatarUrl } from './avatar';

describe('getInitials', () => {
  it('mengambil huruf pertama dari maksimal 2 kata', () => {
    expect(getInitials('Adi Apandi')).toBe('AA');
  });

  it('bekerja untuk nama satu kata', () => {
    expect(getInitials('Administrator')).toBe('A');
  });

  it('mengabaikan kata ketiga dan seterusnya', () => {
    expect(getInitials('Budi Santoso Wijaya')).toBe('BS');
  });
});

describe('getAvatarUrl', () => {
  it('mengembalikan null kalau avatarPath kosong', () => {
    expect(getAvatarUrl(null)).toBeNull();
    expect(getAvatarUrl(undefined)).toBeNull();
  });

  it('menggabungkan base URL API dengan path avatar', () => {
    const result = getAvatarUrl('/uploads/avatars/foo.png');
    expect(result).toContain('/uploads/avatars/foo.png');
    expect(result).not.toContain('/api/uploads');
  });
});
