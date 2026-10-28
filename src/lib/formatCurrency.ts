export function formatCurrency(amount: number): string {
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export const CURRENCY_SYMBOL = '₹';
