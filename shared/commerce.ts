export interface CheckoutConfig {
  enabled: boolean;
  mode: 'off' | 'test' | 'live';
  unitAmount: number;
  shippingAmount: number;
  countries: string[];
  automaticTax: boolean;
  dispatchNote: string;
  returnsPolicy: string;
}
export interface OrderConfirmation {
  status: 'paid' | 'pending' | 'expired' | 'refunded';
  reference?: string;
  quantity?: number;
  amountTotal?: number;
  currency?: string;
  test?: boolean;
}
export const money = (cents: number, currency = 'usd') => new Intl.NumberFormat('en-US', {style:'currency',currency}).format(cents / 100);
