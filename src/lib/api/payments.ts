import { api } from "./client";

export interface DonationIntent {
  clientSecret: string;
  donationId: string;
  paymentIntentId?: string;
  message?: string;
}

export interface ConfirmedDonation {
  success: boolean;
  message: string;
  donation: {
    id: string;
    amount: number;
    requestId: string;
  };
}

export interface Donation {
  id: string;
  amount: number | null;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
  donor: {
    name: string;
    avatarUrl?: string;
  };
}

export const paymentsApi = {
  createDonationIntent: async (
    requestId: string,
    amount: number,
    message?: string,
    isAnonymous?: boolean,
  ): Promise<DonationIntent> => {
    return api.post<DonationIntent>("/api/payments/create-donation-intent", {
      requestId,
      amount,
      message,
      isAnonymous,
    });
  },

  confirmDonation: async (
    donationId: string,
    paymentIntentId?: string,
  ): Promise<ConfirmedDonation> => {
    return api.post<ConfirmedDonation>("/api/payments/confirm-donation", {
      donationId,
      paymentIntentId,
    });
  },

  getDonations: async (
    requestId: string,
  ): Promise<{ donations: Donation[] }> => {
    return api.get(`/api/payments/donations/${requestId}`);
  },
};

interface StripePaymentResult {
  error?: { message: string };
  paymentIntent?: { status: string };
}

interface StripeInstance {
  confirmCardPayment: (secret: string) => Promise<StripePaymentResult>;
}

declare global {
  interface Window {
    Stripe?: (key: string) => StripeInstance;
  }
}

export async function processDonation(
  requestId: string,
  amount: number,
  message?: string,
  isAnonymous?: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const intent = await paymentsApi.createDonationIntent(
      requestId,
      amount,
      message,
      isAnonymous,
    );

    if (intent.clientSecret === "demo_mode") {
      return { success: true };
    }

    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey || !window.Stripe) {
      return { success: true };
    }

    const stripe = window.Stripe(publishableKey);
    if (!stripe) {
      return { success: false, error: "Failed to initialize payment" };
    }

    const result = await stripe.confirmCardPayment(intent.clientSecret);

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
      await paymentsApi.confirmDonation(
        intent.donationId,
        intent.paymentIntentId,
      );
      return { success: true };
    }

    return { success: false, error: "Payment not completed" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment failed";
    return { success: false, error: message };
  }
}
