/**
 * Stripe Service
 * 
 * This service handles integration with the Stripe API for subscription
 * management and payment processing.
 */

import { API_CONFIG, FEATURE_FLAGS } from '../config/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

interface CheckoutSession {
  id: string;
  url: string;
}

interface SubscriptionDetails {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | 'unpaid';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: {
    id: string;
    name: string;
    amount: number;
    interval: 'month' | 'year';
  };
}

interface CustomerPortalSession {
  url: string;
}

class StripeService {
  private publishableKey: string;
  
  constructor() {
    this.publishableKey = API_CONFIG.stripe.publishableKey;
    this.loadStripe();
  }
  
  /**
   * Load the Stripe.js script
   */
  private async loadStripe(): Promise<any> {
    if (typeof window === 'undefined') return null;
    
    if ((window as any).Stripe) {
      return (window as any).Stripe(this.publishableKey);
    }
    
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        const stripe = (window as any).Stripe(this.publishableKey);
        resolve(stripe);
      };
      document.body.appendChild(script);
    });
  }
  
  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // In a real implementation, this would fetch plans from the Stripe API
    // For now, we'll return mock data
    return [
      {
        id: 'price_free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: ['3 sample searches per month', 'Basic risk assessment', 'Community support'],
      },
      {
        id: 'price_pro_monthly',
        name: 'Pro',
        price: 29,
        interval: 'month',
        features: ['Unlimited searches', 'Advanced analytics', 'Negotiation templates', 'Email support'],
      },
      {
        id: 'price_premium_monthly',
        name: 'Premium',
        price: 79,
        interval: 'month',
        features: ['Everything in Pro', 'Priority support', 'Custom integrations', 'Phone support'],
      },
    ];
  }
  
  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(priceId: string, customerId?: string): Promise<CheckoutSession> {
    if (!FEATURE_FLAGS.enableStripeIntegration) {
      // Return mock data if integration is disabled
      return {
        id: 'cs_test_mock',
        url: 'https://checkout.stripe.com/mock-session',
      };
    }
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }
  
  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!FEATURE_FLAGS.enableStripeIntegration) {
      alert('Stripe integration is disabled. In production, this would redirect to Stripe checkout.');
      return;
    }
    
    try {
      const stripe = await this.loadStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }
  
  /**
   * Get customer subscription details
   */
  async getSubscriptionDetails(customerId: string): Promise<SubscriptionDetails | null> {
    if (!FEATURE_FLAGS.enableStripeIntegration) {
      // Return mock data if integration is disabled
      return {
        id: 'sub_mock',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        plan: {
          id: 'price_pro_monthly',
          name: 'Pro',
          amount: 2900, // in cents
          interval: 'month',
        },
      };
    }
    
    try {
      const response = await fetch(`/api/subscription?customerId=${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No subscription found
        }
        throw new Error('Failed to get subscription details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting subscription details:', error);
      throw error;
    }
  }
  
  /**
   * Create a customer portal session
   */
  async createCustomerPortalSession(customerId: string): Promise<CustomerPortalSession> {
    if (!FEATURE_FLAGS.enableStripeIntegration) {
      // Return mock data if integration is disabled
      return {
        url: 'https://billing.stripe.com/mock-portal',
      };
    }
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create customer portal session');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw error;
    }
  }
  
  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (!FEATURE_FLAGS.enableStripeIntegration) {
      alert('Stripe integration is disabled. In production, this would cancel your subscription.');
      return;
    }
    
    try {
      const response = await fetch(`/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();

