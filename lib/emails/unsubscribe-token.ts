/**
 * An unsubscribe token: the `unsubscribe_token` UUID on a waitlist row,
 * as Postgres writes it. It goes into every email's unsubscribe link and
 * comes back on /unsubscribe, so it is checked on the way out and in.
 */
export function isUnsubscribeToken(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
    value,
  );
}
