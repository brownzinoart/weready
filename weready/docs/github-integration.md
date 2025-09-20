# GitHub Repository Integration

WeReady's Bailey Intelligence now supports real GitHub repository analysis that connects to actual repositories for comprehensive intelligence reporting.

## How It Works

### Architecture
1. **Frontend**: Calls `/github/repository-analysis` endpoint with repository URL
2. **Backend**: Routes to appropriate analysis engine based on environment
3. **Production**: Uses Netlify function for real GitHub API calls
4. **Development**: Falls back to local GitHubIntelligenceEngine

### API Endpoint
```http
GET /github/repository-analysis?repo_url=https://github.com/owner/repo
```

### Response Format
```json
{
  "status": "success",
  "repository": {
    "name": "repository-name",
    "full_name": "owner/repository-name",
    "owner": "owner",
    "description": "Repository description",
    "language": "Primary language",
    "stars": 12345,
    "forks": 678,
    "watchers": 12345,
    "open_issues": 42,
    "created_at": "2022-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "pushed_at": "2024-01-01T00:00:00"
  },
  "intelligence_metrics": {
    "momentum_score": 85.5,
    "credibility_score": 92.3,
    "innovation_score": 78.9,
    "startup_signals": [
      "High star growth rate",
      "Active community engagement",
      "Strong documentation"
    ],
    "risk_factors": [
      "Large dependency tree",
      "Memory-intensive operations"
    ]
  },
  "competitive_advantage": "Real-time GitHub intelligence unavailable to ChatGPT"
}
```

## Environment Configuration

### Development Mode
- Uses local `GitHubIntelligenceEngine` for analysis
- Provides realistic mock data for testing
- No GitHub API rate limits

### Production Mode
- Calls Netlify function: `/github-repository-analysis`
- Uses real GitHub API with proper authentication
- Handles rate limiting and error recovery

## Testing

### Test a Repository
```bash
curl "http://localhost:8000/github/repository-analysis?repo_url=https://github.com/openai/whisper"
```

### Example Test Repositories
- https://github.com/openai/whisper
- https://github.com/vercel/next.js  
- https://github.com/tensorflow/tensorflow
- https://github.com/facebook/react

## Integration Points

### Frontend Components
- `GitHubRepoSelector.tsx` - Repository selection UI
- `bailey-intelligence/page.tsx` - Main analysis interface
- `CodeIntelligenceTab.tsx` - Code analysis results display

### Backend Services
- `github_intelligence.py` - Local analysis engine
- `github_analyzer.py` - Code analysis utilities
- Netlify function - Production API integration

## Error Handling

The system includes comprehensive error handling:
- Fallback to local analysis if Netlify function fails
- Graceful degradation when GitHub API is unavailable
- Proper HTTP status codes and error messages

## Performance Considerations

- Caching of repository data to reduce API calls
- Rate limit management for GitHub API
- Async processing for large repositories
- Progressive loading of analysis results

## Security

- GitHub token management through environment variables
- Input validation for repository URLs
- Rate limiting to prevent abuse
- Secure API communication

## Future Enhancements

- Deeper code analysis with AST parsing
- Dependency vulnerability scanning
- Contributor activity analysis
- License compliance checking
- Integration with CI/CD pipelines
