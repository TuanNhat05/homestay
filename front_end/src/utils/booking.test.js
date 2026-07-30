import { describe, expect, test } from 'vitest';
import { getBookingTimeError } from './booking';

describe('getBookingTimeError', () => {
  test('returns a clear error when duration is shorter than 3 hours', () => {
    const error = getBookingTimeError('2026-07-01T08:00', '2026-07-01T10:00');

    expect(error).toBe('Thời gian thuê tối thiểu là 3 tiếng');
  });
});
