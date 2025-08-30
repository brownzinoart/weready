// Netlify Function for GitHub trending intelligence
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://weready.dev',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://weready.dev'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Mock trending intelligence data
    const trendingIntelligence = {
      status: "success",
      timestamp: new Date().toISOString(),
      intelligence: {
        trending_topics: [
          {
            topic: "AI/ML Infrastructure",
            growth_rate: 45.2,
            repositories: 1247,
            key_technologies: ["PyTorch", "TensorFlow", "MLOps"],
            market_potential: "High",
            investment_readiness: 8.5
          },
          {
            topic: "Blockchain Development",
            growth_rate: 32.1,
            repositories: 892,
            key_technologies: ["Solidity", "Web3", "DeFi"],
            market_potential: "Medium-High",
            investment_readiness: 7.2
          },
          {
            topic: "Edge Computing",
            growth_rate: 28.7,
            repositories: 634,
            key_technologies: ["WebAssembly", "IoT", "5G"],
            market_potential: "High",
            investment_readiness: 8.1
          }
        ],
        market_analysis: {
          total_active_repos: 2773,
          funding_activity: "$1.2B in Q3 2024",
          investor_interest: "Very High",
          technical_complexity: "Medium-High",
          time_to_market: "6-12 months"
        },
        recommendations: [
          "Focus on AI infrastructure with strong MLOps capabilities",
          "Consider blockchain projects with real-world utility",
          "Edge computing presents significant scaling opportunities"
        ]
      }
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://weready.dev',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify(trendingIntelligence)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://weready.dev'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};