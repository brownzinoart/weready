export const sourceCategories = [
  {
    key: "government",
    emoji: "🏛️",
    title: "Government Intelligence",
    count: "12+ sources",
    description:
      "Regulatory filings, patent pipelines, and macroeconomic signals to keep you compliant and ahead of policy shifts.",
    gradient: "from-blue-50 via-white to-blue-100",
    sources: [
      { name: "SEC EDGAR Database", credibility: 99 },
      { name: "USPTO Patent Database", credibility: 98 },
      { name: "Federal Reserve Economic Data", credibility: 99 },
      { name: "Small Business Administration", credibility: 96 }
    ]
  },
  {
    key: "academic",
    emoji: "🎓",
    title: "Academic Research",
    count: "10+ sources",
    description:
      "Groundbreaking research from elite institutions translating the latest findings into startup-ready intelligence.",
    gradient: "from-purple-50 via-white to-indigo-100",
    sources: [
      { name: "MIT Startup Research", credibility: 96 },
      { name: "Stanford AI Index", credibility: 95 },
      { name: "Harvard Business Review", credibility: 91 },
      { name: "arXiv Research Database", credibility: 94 }
    ]
  },
  {
    key: "industry",
    emoji: "💼",
    title: "Industry Leaders",
    count: "15+ sources",
    description:
      "Insights from top venture firms and market intelligence leaders to benchmark traction and market timing.",
    gradient: "from-amber-50 via-white to-orange-100",
    sources: [
      { name: "Y Combinator Data", credibility: 95 },
      { name: "Sequoia Capital Guide", credibility: 95 },
      { name: "Andreessen Horowitz", credibility: 92 },
      { name: "CB Insights Unicorn List", credibility: 85 }
    ]
  },
  {
    key: "developer",
    emoji: "📊",
    title: "Developer & Tech Data",
    count: "8+ sources",
    description:
      "Real-time developer sentiment and adoption insights to steer product strategy and technical bets.",
    gradient: "from-green-50 via-white to-emerald-100",
    sources: [
      { name: "GitHub AI Usage Survey", credibility: 87 },
      { name: "Stack Overflow Developer Survey", credibility: 83 },
      { name: "OpenAI Research", credibility: 89 }
    ]
  }
] as const;

export const sourceQualityStandards = [
  "Average source credibility: 92%",
  "Sources updated daily",
  "Government, academic, and industry validation",
  "Transparent methodology for every source"
] as const;

export const sourceCoverageStats = [
  { label: "Authoritative Sources", value: "40+" },
  { label: "Average Credibility", value: "92%" },
  { label: "Daily Refresh", value: "Every day" },
  { label: "Coverage Categories", value: "4" }
] as const;
