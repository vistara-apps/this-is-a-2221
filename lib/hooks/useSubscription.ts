/**
 * useSubscription Hook
 * 
 * This hook provides functionality for managing user subscriptions
 * and feature access based on subscription tier.
 */

import { useState, useEffect } from 'react';
import { stripeService } from '@/lib/services/stripe';
import { SUBSCRIPTION_LIMITS, FEATURE_FLAGS } from '@/lib/config/api';

interface UseSubscriptionProps {
  userId: string;
  initialTier?: 'free' | 'pro' | 'premium';
  onTierChange?: (tier: 'free' | 'pro' | 'premium') => void;
}

export function useSubscription({
  userId,
  initialTier = 'free',
  onTierChange,
}: UseSubscriptionProps) {
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'premium'>(initialTier);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  
  // Load subscription details on mount
  useEffect(() => {
    if (!FEATURE_FLAGS.enableStripeIntegration) return;
    
    const loadSubscription = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const details = await stripeService.getSubscriptionDetails(userId);
        setSubscriptionDetails(details);
        
        if (details) {
          // Determine tier from plan ID
          if (details.plan.id.includes('premium')) {
            setSubscriptionTier('premium');
          } else if (details.plan.id.includes('pro')) {
            setSubscriptionTier('pro');
          } else {
            setSubscriptionTier('free');
          }
        }
        
        // Load available plans
        const plans = await stripeService.getSubscriptionPlans();
        setAvailablePlans(plans);
      } catch (err: any) {
        setError(err.message || 'Failed to load subscription details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscription();
  }, [userId]);
  
  // Notify parent component when tier changes
  useEffect(() => {
    if (onTierChange) {
      onTierChange(subscriptionTier);
    }
  }, [subscriptionTier, onTierChange]);
  
  /**
   * Upgrade subscription tier
   */
  const upgradeTier = async (tier: 'pro' | 'premium') => {
    if (!FEATURE_FLAGS.enableStripeIntegration) {
      // Mock upgrade for development
      setSubscriptionTier(tier);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the plan for the selected tier
      const plan = availablePlans.find(p => p.name.toLowerCase() === tier);
      
      if (!plan) {
        throw new Error(`No plan found for tier: ${tier}`);
      }
      
      // Create checkout session
      const session = await stripeService.createCheckoutSession(plan.id, userId);
      
      // Redirect to checkout
      await stripeService.redirectToCheckout(session.id);
    } catch (err: any) {
      setError(err.message || `Failed to upgrade to ${tier} tier`);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Downgrade subscription tier
   */
  const downgradeTier = async (tier: 'free' | 'pro') => {
    if (!FEATURE_FLAGS.enableStripeIntegration) {
      // Mock downgrade for development
      setSubscriptionTier(tier);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!subscriptionDetails) {
        throw new Error('No active subscription found');
      }
      
      // Create customer portal session for downgrade
      const session = await stripeService.createCustomerPortalSession(userId);
      
      // Redirect to customer portal
      window.location.href = session.url;
    } catch (err: any) {
      setError(err.message || `Failed to downgrade to ${tier} tier`);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Cancel subscription
   */
  const cancelSubscription = async () => {
    if (!FEATURE_FLAGS.enableStripeIntegration) {
      // Mock cancellation for development
      setSubscriptionTier('free');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!subscriptionDetails) {
        throw new Error('No active subscription found');
      }
      
      // Cancel subscription
      await stripeService.cancelSubscription(subscriptionDetails.id);
      
      // Update local state
      setSubscriptionTier('free');
      setSubscriptionDetails(null);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Check if a feature is available in the current subscription tier
   */
  const isFeatureAvailable = (feature: keyof typeof SUBSCRIPTION_LIMITS.free, count?: number): boolean => {
    const limits = SUBSCRIPTION_LIMITS[subscriptionTier];
    
    if (!(feature in limits)) {
      return false;
    }
    
    if (count !== undefined) {
      return typeof limits[feature] === 'number' 
        ? count <= (limits[feature] as number)
        : true;
    }
    
    return true;
  };
  
  /**
   * Get the limit for a specific feature in the current subscription tier
   */
  const getFeatureLimit = (feature: keyof typeof SUBSCRIPTION_LIMITS.free): number | 'unlimited' | string[] => {
    const limits = SUBSCRIPTION_LIMITS[subscriptionTier];
    
    if (!(feature in limits)) {
      return 0;
    }
    
    return limits[feature];
  };
  
  /**
   * Get subscription expiration date
   */
  const getExpirationDate = (): Date | null => {
    if (!subscriptionDetails) {
      return null;
    }
    
    return new Date(subscriptionDetails.currentPeriodEnd);
  };
  
  /**
   * Check if subscription is active
   */
  const isSubscriptionActive = (): boolean => {
    if (!subscriptionDetails) {
      return subscriptionTier === 'free';
    }
    
    return subscriptionDetails.status === 'active' || subscriptionDetails.status === 'trialing';
  };
  
  return {
    subscriptionTier,
    isLoading,
    error,
    subscriptionDetails,
    availablePlans,
    upgradeTier,
    downgradeTier,
    cancelSubscription,
    isFeatureAvailable,
    getFeatureLimit,
    getExpirationDate,
    isSubscriptionActive,
  };
}
