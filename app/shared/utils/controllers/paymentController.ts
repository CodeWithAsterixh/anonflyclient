import { getAPIBaseURL } from "../../constants/api";

export interface PaymentIntent {
  provider: 'monero' | 'lightning' | 'stripe';
  amount: number;
  address?: string;
  invoice?: string;
  checkoutUrl?: string;
}

export interface RedemptionResult {
  success: boolean;
  features: string[];
}

/**
 * Creates a payment intent for upgrading to premium.
 */
export const createPaymentIntent = async (
  token: string,
  provider: 'monero' | 'lightning' | 'stripe',
  amount: number
): Promise<PaymentIntent> => {
  const response = await fetch(`${getAPIBaseURL()}/payments/create-intent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ provider, amount })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create payment intent');

  return data.data;
};

/**
 * Redeems a premium voucher code.
 */
export const redeemVoucher = async (
  token: string,
  code: string
): Promise<RedemptionResult> => {
  const response = await fetch(`${getAPIBaseURL()}/payments/redeem-voucher`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to redeem voucher');

  return data.data;
};
