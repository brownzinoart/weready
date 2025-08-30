// Netlify Function for GitHub repository analysis
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://weready.dev',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
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
    // Extract repo_url from query parameters
    const { repo_url } = event.queryStringParameters || {};
    
    if (!repo_url) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://weready.dev'
        },
        body: JSON.stringify({ error: 'repo_url parameter is required' })
      };
    }

    // Mock repository analysis based on URL
    const repoName = repo_url.split('/').pop() || 'unknown-repo';
    
    const repositoryAnalysis = {
      status: "success",
      timestamp: new Date().toISOString(),
      repository: {
        url: repo_url,
        name: repoName,
        analysis_date: new Date().toISOString()
      },
      analysis: {
        code_quality: {
          score: 82.5,
          hallucination_risk: "Low",
          dependency_health: "Good",
          security_score: 87.2,
          maintainability: "High"
        },
        business_intelligence: {
          market_fit: 78.3,
          competition_level: "Medium",
          revenue_potential: "High",
          scalability: 85.1,
          investor_appeal: 79.8
        },
        technical_assessment: {
          architecture_quality: 84.7,
          performance_score: 81.2,
          test_coverage: 73.5,
          documentation_score: 69.8,
          deployment_readiness: 88.3
        },
        investment_readiness: {
          overall_score: 80.2,
          funding_potential: "Series A Ready",
          risk_level: "Medium-Low",
          time_to_revenue: "6-9 months",
          team_strength: "Strong"
        }
      },
      recommendations: [
        "Improve test coverage to reach 85%+ for better investor confidence",
        "Enhance documentation for better developer onboarding",
        "Consider adding enterprise features for revenue scaling",
        "Strong technical foundation ready for Series A discussions"
      ],
      next_steps: [
        "Schedule technical due diligence",
        "Prepare pitch deck with technical metrics",
        "Identify key enterprise prospects",
        "Plan scaling infrastructure"
      ]
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://weready.dev',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(repositoryAnalysis)
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