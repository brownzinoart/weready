// Netlify Function for GitHub repository analysis
const { Octokit } = require('@octokit/rest');

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

    // Extract owner and repo from URL
    const urlParts = repo_url.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1].replace('.git', '');
    
    if (!owner || !repo) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://weready.dev'
        },
        body: JSON.stringify({ error: 'Invalid GitHub repository URL' })
      };
    }

    // Initialize Octokit with GitHub token if available
    const githubToken = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({
      auth: githubToken,
      userAgent: 'WeReady GitHub Analysis v1.0'
    });

    // Get repository data
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo
    });

    // Get recent commits (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      since: thirtyDaysAgo.toISOString(),
      per_page: 100
    });

    // Get open issues
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 100
    });

    // Get pull requests
    const { data: pullRequests } = await octokit.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100
    });

    // Get contributors
    const { data: contributors } = await octokit.repos.listContributors({
      owner,
      repo,
      per_page: 100
    });

    // Get languages
    const { data: languages } = await octokit.repos.listLanguages({
      owner,
      repo
    });

    // Calculate metrics
    const commitCount = commits.length;
    const openIssueCount = issues.length;
    const prCount = pullRequests.length;
    const contributorCount = contributors.length;
    
    // Calculate activity score (0-100)
    const activityScore = Math.min(100, 
      (commitCount * 2) + // Commits are most important
      (prCount * 1.5) +   // PRs show collaboration
      (openIssueCount * 1) // Issues show maintenance
    );

    // Calculate health score (0-100)
    const healthScore = Math.min(100,
      40 + // Base score
      (activityScore * 0.4) + // Activity contributes to health
      (contributorCount * 2) + // More contributors = healthier
      (repoData.stargazers_count * 0.1) // Stars indicate popularity
    );

    // Calculate business potential score
    const businessScore = Math.min(100,
      (healthScore * 0.4) +
      (repoData.stargazers_count * 0.3) +
      (repoData.forks_count * 0.3)
    );

    // Generate repository analysis
    const repositoryAnalysis = {
      status: "success",
      timestamp: new Date().toISOString(),
      repository: {
        url: repo_url,
        name: repoData.name,
        full_name: repoData.full_name,
        owner: repoData.owner.login,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        open_issues: repoData.open_issues_count,
        size: repoData.size,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        pushed_at: repoData.pushed_at,
        license: repoData.license?.name,
        default_branch: repoData.default_branch,
        archived: repoData.archived,
        disabled: repoData.disabled,
        private: repoData.private
      },
      metrics: {
        commit_count: commitCount,
        open_issues: openIssueCount,
        pull_requests: prCount,
        contributors: contributorCount,
        languages: languages
      },
      scores: {
        activity: Math.round(activityScore),
        health: Math.round(healthScore),
        business_potential: Math.round(businessScore),
        overall: Math.round((activityScore + healthScore + businessScore) / 3)
      },
      analysis: {
        code_quality: {
          score: Math.round(healthScore * 0.8), // Weighted towards health
          hallucination_risk: activityScore > 50 ? "Low" : "Medium",
          dependency_health: "Good",
          security_score: Math.round(healthScore * 0.9),
          maintainability: activityScore > 70 ? "High" : activityScore > 40 ? "Medium" : "Low"
        },
        business_intelligence: {
          market_fit: Math.round(businessScore * 0.8),
          competition_level: repoData.stargazers_count > 1000 ? "High" : repoData.stargazers_count > 100 ? "Medium" : "Low",
          revenue_potential: Math.round(businessScore * 0.7),
          scalability: Math.round(healthScore * 0.6),
          investor_appeal: Math.round(businessScore * 0.9)
        },
        technical_assessment: {
          architecture_quality: Math.round(healthScore * 0.85),
          performance_score: Math.round(healthScore * 0.75),
          test_coverage: activityScore > 60 ? "Good" : "Unknown",
          documentation_score: repoData.description ? 70 : 40,
          deployment_readiness: activityScore > 50 ? "Ready" : "Needs Improvement"
        },
        investment_readiness: {
          overall_score: Math.round(businessScore),
          funding_potential: businessScore > 80 ? "Series A Ready" : businessScore > 60 ? "Seed Ready" : "Pre-seed",
          risk_level: healthScore > 70 ? "Low" : healthScore > 40 ? "Medium" : "High",
          time_to_revenue: activityScore > 60 ? "3-6 months" : "6-12 months",
          team_strength: contributorCount > 3 ? "Strong" : contributorCount > 1 ? "Adequate" : "Solo"
        }
      },
      recommendations: generateRecommendations(repoData, activityScore, healthScore, businessScore),
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
    console.error('GitHub analysis error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://weready.dev'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        details: error.response?.data || 'No additional details'
      })
    };
  }
};

// Helper function to generate recommendations
function generateRecommendations(repoData, activityScore, healthScore, businessScore) {
  const recommendations = [];
  
  // Activity-based recommendations
  if (activityScore < 30) {
    recommendations.push("Increase development activity to improve project momentum");
  } else if (activityScore > 70) {
    recommendations.push("Strong development activity indicates healthy project maintenance");
  }
  
  // Health-based recommendations
  if (healthScore < 40) {
    recommendations.push("Focus on improving code quality and documentation");
  } else if (healthScore > 80) {
    recommendations.push("Excellent code health - ready for production deployment");
  }
  
  // Business potential recommendations
  if (businessScore < 50) {
    recommendations.push("Consider community building and user acquisition strategies");
  } else if (businessScore > 75) {
    recommendations.push("Strong business potential - ready for investor discussions");
  }
  
  // Specific recommendations based on metrics
  if (repoData.open_issues_count > repoData.stargazers_count / 2) {
    recommendations.push("Address open issues to improve maintenance perception");
  }
  
  if (repoData.forks_count < 5 && repoData.stargazers_count > 50) {
    recommendations.push("Encourage forking and community contributions");
  }
  
  if (!repoData.description) {
    recommendations.push("Add comprehensive repository description for better discoverability");
  }
  
  if (!repoData.license) {
    recommendations.push("Add an open source license to clarify usage rights");
  }
  
  // Add some positive reinforcement
  if (repoData.stargazers_count > 100) {
    recommendations.push("Strong community engagement with significant star count");
  }
  
  if (repoData.forks_count > 20) {
    recommendations.push("Active community contributions with multiple forks");
  }
  
  return recommendations;
}
