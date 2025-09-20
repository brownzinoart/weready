/// <reference types="jest" />
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import BusinessTab from '../app/components/tabs/BusinessTab';
import BusinessIntelligenceTab from '../app/components/tabs/BusinessIntelligenceTab';

const renderWithQueryClient = (ui: ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

afterEach(() => {
  cleanup();
});

const buildMockResult = () => {
  const now = new Date().toISOString();
  return {
    breakdown: {
      business_model: {
        score: 78,
      },
    },
    brain_recommendations: [
      { category: 'business_model', recommendation: 'Expand go-to-market partnerships.' },
      { category: 'finance', recommendation: 'Tighten burn multiple.' },
    ],
    business_formation_insights: {
      momentum_score: 72.4,
      signals: [
        {
          name: 'Weekly Business Applications',
          current_value: 18340,
          change_percent: 5.2,
          timeframe: 'weekly',
          source_id: 'census_bfs',
          context: 'US aggregate business application submissions',
        },
      ],
      sources: ['census_bfs', 'census_bds', 'census_cbp'],
      last_updated: now,
    },
    international_market_intelligence: {
      opportunity_score: 68.2,
      risk_score: 28.1,
      signals: [
        {
          metric: 'New Business Density',
          value: 4.1,
          delta: 0.3,
          unit: 'registrations per 1k adults',
          source_id: 'world_bank_indicators',
          commentary: 'Entrepreneurial intensity outperforms US median.',
        },
      ],
      last_updated: now,
    },
    procurement_intelligence: {
      top_agencies: ['GSA', 'DoD'],
      opportunities: [
        { title: 'AI Automation BPA', agency: 'GSA', value: 12000000 },
      ],
      last_updated: now,
    },
    technology_trend_intelligence: {
      adoption_index: 81.5,
      trends: [
        {
          label: 'AI Agents',
          score: 91.2,
          change_percent: 18.3,
          source_id: 'product_hunt',
          evidence: 'Spike in Product Hunt launches (+18%).',
          timestamp: now,
        },
        {
          label: 'Developer Tools',
          score: 74,
          change_percent: 6.1,
          source_id: 'stack_exchange',
          evidence: 'StackOverflow tagging up 6%.',
          timestamp: now,
        },
      ],
      last_updated: now,
    },
    economic_context: {
      timing_index: 66.1,
      inflation_trend: 'cooling',
      credit_availability: 'moderate',
    },
  };
};

describe('Business intelligence component validation', () => {
  test('BusinessTab renders key sections', () => {
    const mockResult = buildMockResult();
    renderWithQueryClient(<BusinessTab result={mockResult} />);

    expect(screen.getByText(/Enterprise Business Intelligence Suite/i)).toBeInTheDocument();
    expect(screen.getByText(/Market Opportunity Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Government Pipeline/i)).toBeInTheDocument();
  });

  test('BusinessIntelligenceTab renders intelligence overview', () => {
    renderWithQueryClient(<BusinessIntelligenceTab />);

    expect(screen.getByText(/Business Intelligence Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Technology Trend Monitoring/i)).toBeInTheDocument();
    expect(screen.getByText(/Government Procurement Intelligence/i)).toBeInTheDocument();
  });
});
