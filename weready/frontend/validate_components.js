#!/usr/bin/env node
'use strict';

const path = require('path');
const { JSDOM } = require('jsdom');

// Configure ts-node to transpile Next.js TypeScript components on the fly.
const projectTsConfig = path.join(__dirname, 'tsconfig.json');
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    jsx: 'react-jsx',
    moduleResolution: 'node'
  },
  project: projectTsConfig,
});

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
const { window } = dom;

function copyProps(src, target) {
  Object.getOwnPropertyNames(src).forEach((prop) => {
    if (typeof target[prop] === 'undefined') {
      Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(src, prop));
    }
  });
}

global.window = window;
global.document = window.document;
global.navigator = { userAgent: 'node.js' };
global.HTMLElement = window.HTMLElement;
global.getComputedStyle = window.getComputedStyle;
copyProps(window, global);

// Provide lightweight fetch & ResizeObserver shims for components that expect them.
if (!global.fetch) {
  global.fetch = async () => ({ json: async () => ({}) });
}
if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const React = require('react');
const { render, screen, cleanup } = require('@testing-library/react');
const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');

const BusinessTab = require('./app/components/tabs/BusinessTab').default;
const BusinessIntelligenceTab = require('./app/components/tabs/BusinessIntelligenceTab').default;

const queryClient = new QueryClient();

function renderWithProviders(ui) {
  return render(
    React.createElement(QueryClientProvider, { client: queryClient }, ui)
  );
}

function assertText(label, text) {
  const node = screen.queryByText(text, { exact: false });
  if (!node) {
    throw new Error(`${label}: Expected to find text containing "${text}"`);
  }
}

function buildMockResult() {
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
      top_agencies: [
        { name: 'GSA', award_volume: 120000000, description: 'AI modernization programs.' },
        { name: 'DoD', award_volume: 95000000, description: 'Applied autonomy initiatives.' },
      ],
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
}

(async () => {
  try {
    const mockResult = buildMockResult();

    const businessTab = React.createElement(BusinessTab, { result: mockResult });
    renderWithProviders(businessTab);
    assertText('BusinessTab', 'Enterprise Business Intelligence Suite');
    assertText('BusinessTab', 'Market Opportunity Analysis');
    assertText('BusinessTab', 'Government Procurement Intelligence');
    cleanup();

    renderWithProviders(React.createElement(BusinessIntelligenceTab));
    assertText('BusinessIntelligenceTab', 'Business Intelligence Hub');
    assertText('BusinessIntelligenceTab', 'Technology Trend Monitoring');
    assertText('BusinessIntelligenceTab', 'Government Procurement Intelligence');
    cleanup();

    console.log('Business Intelligence components validated successfully.');
  } catch (error) {
    console.error('Component validation failed:', error instanceof Error ? error.message : error);
    cleanup();
    process.exit(1);
  }
})();
