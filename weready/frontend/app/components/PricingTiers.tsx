'use client';

import { useState } from 'react';
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react';

interface PricingTiersProps {
  onSelectPlan?: (plan: string) => void;
  showTitle?: boolean;
}

export default function PricingTiers({ onSelectPlan, showTitle = true }: PricingTiersProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const tiers = [
    {
      name: 'Starter',
      description: 'Essential startup health check',
      monthlyPrice: 49,
      annualPrice: 39,
      yearlyDiscount: '20%',
      icon: Zap,
      color: 'from-slate-600 to-slate-700',
      features: [
        '3 full reports per month',
        'Code Quality Analysis (basic)',
        'Business Model Analysis (core)',
        'Investment Readiness Score',
        'Email support',
        '7-day analysis history'
      ],
      limitations: [
        'Basic code analysis only',
        'Limited business insights',
        'No team collaboration'
      ],
      ctaText: 'Start with Starter',
      target: 'Solo founders, early-stage'
    },
    {
      name: 'Growth',
      description: 'Complete startup optimization suite',
      monthlyPrice: 149,
      annualPrice: 119,
      yearlyDiscount: '20%',
      icon: Star,
      color: 'from-violet-600 to-purple-600',
      popular: true,
      features: [
        '10 full reports per month',
        'Complete Code Quality + Security',
        'Full Business Model Analysis',
        'Investment Readiness + Due Diligence',
        'Design/UX Analysis',
        'Priority Support (Email + Chat)',
        '30-day analysis history',
        'Team collaboration (3 users)',
        'Export reports (PDF/CSV)'
      ],
      ctaText: 'Choose Growth',
      target: 'Growing startups, small teams',
      value: 'Most Popular'
    },
    {
      name: 'Scale',
      description: 'Enterprise-grade analysis & insights',
      monthlyPrice: 399,
      annualPrice: 319,
      yearlyDiscount: '20%',
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      features: [
        'Unlimited reports',
        'All Growth features PLUS:',
        'AI-powered custom recommendations',
        'Advanced security compliance',
        'Custom metrics tracking',
        'White-label reports',
        'API access',
        'Dedicated account manager',
        '1-year analysis history',
        'Unlimited team members',
        'Priority phone support'
      ],
      ctaText: 'Scale Up',
      target: 'Series A+ startups, agencies'
    }
  ];

  const handleSelectPlan = (planName: string) => {
    if (onSelectPlan) {
      onSelectPlan(planName.toLowerCase());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Unlock unlimited startup analysis with advanced insights and team collaboration
          </p>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 rounded-xl p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
              billingCycle === 'annual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Annual</span>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
          const originalPrice = billingCycle === 'annual' ? tier.monthlyPrice : undefined;
          
          return (
            <div
              key={tier.name}
              className={`relative bg-white rounded-2xl shadow-xl border-2 p-8 transition-all hover:shadow-2xl ${
                tier.popular 
                  ? 'border-violet-300 scale-105 z-10' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{tier.description}</p>
                <p className="text-xs text-slate-500">{tier.target}</p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-4xl font-bold text-slate-900">${price}</span>
                  <span className="text-slate-500">/month</span>
                </div>
                {originalPrice && (
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <span className="text-slate-400 line-through text-sm">${originalPrice}/month</span>
                    <span className="text-green-600 text-sm font-medium">Save 20%</span>
                  </div>
                )}
                {billingCycle === 'annual' && (
                  <p className="text-xs text-slate-500 mt-2">
                    Billed annually (${price * 12})
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(tier.name)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                  tier.popular
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                <span>{tier.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Value proposition */}
              {tier.name === 'Growth' && (
                <p className="text-center text-xs text-slate-500 mt-3">
                  💡 Best value - Only $15 per report
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Value Proposition */}
      <div className="text-center mt-12 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          💰 Save $50K+ vs Enterprise Solutions
        </h3>
        <p className="text-slate-600 mb-4">
          Get CB Insights-level analysis at Crunchbase pricing, designed specifically for founders
        </p>
        <div className="flex items-center justify-center space-x-8 text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>No credit card for trial</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>14-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}