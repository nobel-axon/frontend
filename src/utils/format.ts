import { config } from '../config';

const DECIMALS = config.tokenDecimals;

/** Convert a wei string to a human-readable number, then compact it. */
export function fromWei(wei: string | undefined): number {
  if (!wei || wei === '0') return 0;
  // Handle large integers that exceed JS precision by manual decimal shift
  const s = wei.replace(/^0+/, '') || '0';
  if (s.length <= DECIMALS) {
    return parseFloat('0.' + s.padStart(DECIMALS, '0'));
  }
  const intPart = s.slice(0, s.length - DECIMALS);
  const fracPart = s.slice(s.length - DECIMALS);
  return parseFloat(`${intPart}.${fracPart}`);
}

/** Convert a human-readable token amount (e.g. "1000") to a wei string. */
export function toWei(amount: string): string {
  if (!amount || amount === '0') return '0';
  const [intPart, fracPart = ''] = amount.split('.');
  const padded = fracPart.padEnd(DECIMALS, '0').slice(0, DECIMALS);
  return (intPart + padded).replace(/^0+/, '') || '0';
}

/** Format a wei string as a compact human-readable value (e.g. 1.2M, 34.5K, 100) with dot thousands. */
export function fmtWei(wei: string | undefined): string {
  return compact(fromWei(wei));
}

/** Compact a number: 1200000 → "1.2M", 45000 → "45K", 123.456 → "123.46", use dots for thousands when no suffix. */
export function compact(n: number | undefined): string {
  if (n == null || isNaN(n) || n === 0) return '0';
  if (n >= 1_000_000) return trimTrailing(`${(n / 1_000_000).toFixed(1)}`) + 'M';
  if (n >= 10_000) return trimTrailing(`${(n / 1_000).toFixed(1)}`) + 'K';
  if (n >= 1_000) return dotSep(Math.round(n));
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function trimTrailing(s: string): string {
  return s.replace(/\.0$/, '');
}

function dotSep(n: number): string {
  return n.toLocaleString('en-US').replace(/,/g, '.');
}
