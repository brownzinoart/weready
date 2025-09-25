import { CURRENT_BETA_WINDOW_MONTH } from './config';

export type AudienceSegment = 'founder' | 'investor';

type ValueProposition = {
  headline: string;
  subheadline: string;
  proofPoints: string[];
};

type SecondaryTier = 'accelerator' | 'enterprise';

type SecondaryValueSupport = {
  positioning: string;
  supportPoints: string[];
};

type DualSidedNarrative = {
  coreProduct: string;
  technology: string;
  sharedWins: string[];
};

export const coreValuePropositions: Record<AudienceSegment, ValueProposition> = {
  founder: {
    headline: 'WeReady scores turn founder execution into a shared operating system.',
    subheadline:
      'Bailey Intelligence assembles WeReady score reports from traction, product, and market evidence to prescribe the next move.',
    proofPoints: [
      'Founders lift their WeReady Execution Score by an average of 12 points in the first 30 days and turn that lift into confident roadmap decisions.',
      'Bailey Intelligence converts investor diligence questions into weekly product, revenue, and team actions with citation-backed context.',
      'Success spotlight: Atlas Loop aligned their team and secured their seed round once their Bailey report clarified the readiness gaps.',
      'Plus: targeted grant application support when it strengthens the same evidence powering your WeReady score.',
    ],
  },
  investor: {
    headline: 'Bailey gut-checks every deal with WeReady validation in hours.',
    subheadline:
      'Bailey Intelligence packages diligence explainers and portfolio insights so investors align partners, ICs, and LPs fast.',
    proofPoints: [
      'Compress deal screening to 48-hour WeReady reviews without sacrificing evidence or analyst rigor.',
      'Bailey explainers deliver instant “why yes or no” rationales you can forward to partners and LPs.',
      'Portfolio overviews flag execution shifts before board meetings so you steer capital with confidence.',
    ],
  },
};

export const secondaryValueSupports: Record<SecondaryTier, SecondaryValueSupport> = {
  accelerator: {
    positioning: 'Equip cohorts with the Bailey Intelligence founders and investors already trust.',
    supportPoints: [
      'Cohort dashboards reveal readiness gaps by company and theme for focused mentorship tied to WeReady expectations.',
      'Shared WeReady scoring templates keep mentors aligned on evidence-based coaching that feeds investor conversations.',
    ],
  },
  enterprise: {
    positioning: 'Scale innovation, venture, and partnership teams with a verified readiness system.',
    supportPoints: [
      'Private Bailey deployments connect internal data sources to WeReady scoring for dual-sided visibility.',
      'Security reviews, SSO, and data residency controls meet procurement requirements.',
    ],
  },
};

export const dualSidedNarrative: DualSidedNarrative = {
  coreProduct: 'WeReady scores deliver the single readiness signal founders and investors act on together.',
  technology:
    'Bailey Intelligence is the connective tissue translating operating data into founder guidance and investor validation in one motion.',
  sharedWins: [
    'Founders operationalize weekly WeReady sprints that map directly to what investors expect next.',
    'Investors calibrate yes/no rationales to the same Bailey-backed evidence founders are executing against.',
    'Optional grant briefs unlock when they reinforce the execution plan already advancing toward capital readiness.',
  ],
};

export const socialProofMessaging = {
  stats: [
    '78% of founders lifted their WeReady Execution Score within the first 30 days of beta.',
    'Investor partners delivered portfolio feedback 3× faster using Bailey Intelligence dual-sided summaries.',
    'Bailey Intelligence powered 1,200 shared founder–investor readiness reviews during the private beta.',
  ],
  testimonials: [
    {
      quote:
        'Bailey turned our messy traction updates into a clear WeReady score and next sprint plan. Our investors finally saw the same picture we did.',
      author: 'Jamie Alvarez',
      title: 'CEO @ Atlas Loop',
    },
    {
      quote:
        'WeReady gave me a defensible yes/no rationale for IC in one afternoon. The Bailey narrative answered every LP follow-up before they asked.',
      author: 'Marcus Lee',
      title: 'Partner @ Horizon Signal Ventures',
    },
  ],
};

export const urgencyMessaging = {
  banner: `Private beta onboarding is open for matched founder and investor teams through ${CURRENT_BETA_WINDOW_MONTH}.`,
  scarcity: 'We accept 25 founders and 15 investor champions per month to keep Bailey review cycles personal and evidence-rich.',
  guarantee:
    'Lock early access pricing and co-created Bailey playbooks tailored to the founder journey and investor validation workflow you already share.',
};

export const trustSignals = [
  'Bailey Intelligence readiness methodology refined with YC alumni and top-tier operators',
  'WeReady scoring audited by former Sequoia and a16z operating partners for evidence rigor',
  'Citation-backed Bailey explainability so founders and investors trust every recommendation',
  'SOC2 Type II in progress alongside enterprise security reviews',
  'GDPR-aligned data handling, SSO support, and full audit trails',
];

type ObjectionKey = 'pricing' | 'security' | 'accuracy' | 'dualAudience';

export const objectionHandling: Record<ObjectionKey, { response: string; cta?: string }> = {
  pricing: {
    response:
      'A WeReady membership replaces piecemeal consultants for founders and duplicate diligence tools for investors with one Bailey-powered workflow.',
    cta: 'Calculate your first-month score improvement',
  },
  security: {
    response:
      'Enterprise reviews include SOC2-aligned controls, role-based access, audit trails, and dedicated Bailey security support.',
    cta: 'Request a security package',
  },
  accuracy: {
    response:
      'Every Bailey output ships with citations, confidence scoring, and analyst oversight so both sides see the same evidence.',
  },
  dualAudience: {
    response:
      'Founders receive execution guidance while investors get gut-check validation from the same WeReady score, keeping decisions aligned.',
    cta: 'See how we map Bailey insights to each workflow',
  },
};

type MessagingPlaybook = {
  hero: {
    headline: string;
    subheadline: string;
    supportingPoints: string[];
  };
  founder: {
    valueProp: ValueProposition;
    keyMoments: string[];
  };
  investor: {
    valueProp: ValueProposition;
    keyMoments: string[];
  };
  betaLaunch: string;
  referral: string;
  secondarySupport: typeof secondaryValueSupports;
  dualSidedNarrative: typeof dualSidedNarrative;
};

export const messagingPlaybook: MessagingPlaybook = {
  hero: {
    headline: 'One readiness source founders and investors trust.',
    subheadline:
      'Bailey Intelligence powers WeReady scores, tactical guidance for founders, and gut-check validation for investors in a single platform.',
    supportingPoints: [
      'WeReady reports translate Bailey recommendations into weekly execution priorities and evidence-rich updates.',
      'Investors circulate WeReady briefs that answer the inevitable “why yes or no” questions before IC or LP reviews.',
    ],
  },
  founder: {
    valueProp: coreValuePropositions.founder,
    keyMoments: [
      'Use WeReady reports to anchor fundraising updates and team standups around the same execution score investors review.',
      'Share Bailey snapshots with product, revenue, and operations leaders to clarify what matters next and why.',
    ],
  },
  investor: {
    valueProp: coreValuePropositions.investor,
    keyMoments: [
      'Run fast gut-checks before partner meetings to filter deals based on evidence, not hunches.',
      'Package Bailey-backed rationale for LP updates and portfolio reviews without rebuilding the data in spreadsheets.',
    ],
  },
  betaLaunch:
    'Enroll now to connect your founder execution score with your investor decision workflow—paired onboarding ensures both sides act on Bailey intelligence together.',
  referral:
    'Invite the founder or investor you collaborate with and unlock an additional shared Bailey review pack.',
  secondarySupport: secondaryValueSupports,
  dualSidedNarrative: dualSidedNarrative,
};

type EmailSequenceKey = 'welcome' | 'nurture' | 'conversion';

type EmailSequence = {
  subject: string;
  bulletPoints: string[];
};

export const emailSequences: Record<EmailSequenceKey, EmailSequence> = {
  welcome: {
    subject: 'Welcome to WeReady—your Bailey-powered score is next',
    bulletPoints: [
      'Kick off with a baseline WeReady Execution Score and citation-backed report.',
      'Pair with your lead investor or advisor to align on the same Bailey intelligence.',
      'Access weekly sessions turning score insights into immediate roadmap moves.',
    ],
  },
  nurture: {
    subject: 'See how founders and investors stay aligned with Bailey',
    bulletPoints: [
      'Watch how founders run Monday standups from their WeReady reports.',
      'Learn how investors use Bailey insights to prep IC and LP updates in one step.',
      'Explore the shared playbook that connects execution milestones to capital readiness.',
    ],
  },
  conversion: {
    subject: `Secure your dual-sided WeReady seat before the ${CURRENT_BETA_WINDOW_MONTH} beta closes`,
    bulletPoints: [
      'Only a limited number of founder and investor pairs onboard each month to protect analyst quality.',
      'Early members lock in 12 months of Bailey Intelligence enhancements at beta pricing.',
      'Optional grant briefs are available when they accelerate the execution plan you are already running.',
    ],
  },
};

export type MessagingToolkit = {
  coreValuePropositions: typeof coreValuePropositions;
  secondaryValueSupports: typeof secondaryValueSupports;
  socialProofMessaging: typeof socialProofMessaging;
  urgencyMessaging: typeof urgencyMessaging;
  trustSignals: typeof trustSignals;
  objectionHandling: typeof objectionHandling;
  messagingPlaybook: typeof messagingPlaybook;
  emailSequences: typeof emailSequences;
  dualSidedNarrative: typeof dualSidedNarrative;
};

export const messagingToolkit: MessagingToolkit = {
  coreValuePropositions,
  secondaryValueSupports,
  socialProofMessaging,
  urgencyMessaging,
  trustSignals,
  objectionHandling,
  messagingPlaybook,
  emailSequences,
  dualSidedNarrative,
};

export default messagingToolkit;
