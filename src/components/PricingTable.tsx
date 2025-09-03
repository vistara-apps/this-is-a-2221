import React from 'react';
import { Check, Crown, Star } from 'lucide-react';
import { SubscriptionTier } from '../types';
import { useApp } from '../contexts/AppContext';

interface PricingTableProps {
  onSelectTier: (tier: SubscriptionTier) => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onSelectTier }) => {
  const { subscriptionTiers, user } = useApp();

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'premium':
        return <Crown className="w-5 h-5 text-accent" />;
      case 'pro':
        return <Star className="w-5 h-5 text-primary" />;
      default:
        return null;
    }
  };

  const isCurrentTier = (tierName: string) => {
    return user?.subscriptionTier === tierName.toLowerCase();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {subscriptionTiers.map((tier, index) => (
        <div
          key={tier.name}
          className={`
            card relative transition-all duration-200
            ${tier.name === 'Pro' ? 'ring-2 ring-primary scale-105' : ''}
            ${isCurrentTier(tier.name) ? 'bg-primary/5 border-primary' : 'hover:shadow-lg'}
          `}
        >
          {tier.name === 'Pro' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              {getTierIcon(tier.name)}
              <h3 className="text-xl font-bold text-text-primary">{tier.name}</h3>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-text-primary">
                ${tier.price}
              </span>
              {tier.price > 0 && (
                <span className="text-text-secondary">/month</span>
              )}
            </div>
          </div>

          <ul className="space-y-3 mb-8">
            {tier.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Monthly searches:</span>
              <span className="font-medium text-text-primary">
                {tier.limits.searches === 'unlimited' ? 'Unlimited' : tier.limits.searches}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Projects:</span>
              <span className="font-medium text-text-primary">
                {tier.limits.projects === 'unlimited' ? 'Unlimited' : tier.limits.projects}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectTier(tier)}
            disabled={isCurrentTier(tier.name)}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200
              ${isCurrentTier(tier.name)
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : tier.name === 'Pro'
                  ? 'btn-primary'
                  : 'btn-secondary hover:bg-gray-50'
              }
            `}
          >
            {isCurrentTier(tier.name) ? 'Current Plan' : `Get ${tier.name}`}
          </button>
        </div>
      ))}
    </div>
  );
};