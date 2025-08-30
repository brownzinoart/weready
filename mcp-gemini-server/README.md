# MCP Gemini Server

This is an MCP (Model Context Protocol) server that wraps the Gemini CLI, allowing you to use Gemini's capabilities through the MCP protocol.

## Features

### Tools
- **gemini_prompt**: Send prompts to Gemini and get responses
- **gemini_analyze_file**: Analyze specific files with custom prompts
- **gemini_code_review**: Perform comprehensive code reviews on directories

### Prompts
- **code_explanation**: Explain code in simple terms
- **refactor_suggestion**: Get refactoring suggestions
- **bug_analysis**: Analyze code for potential bugs

## Installation

1. Install dependencies:
```bash
cd mcp-gemini-server
npm install
```

2. Build the server:
```bash
npm run build
```

## Usage

### Option 1: Add to Gemini CLI

You can add this MCP server to your Gemini CLI:

```bash
# Add the server
gemini mcp add gemini-server node /path/to/mcp-gemini-server/build/index.js

# List servers to verify
gemini mcp list

# Use Gemini with MCP server enabled
gemini --allowed-mcp-server-names gemini-server
```

### Option 2: Use with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["/Users/wallymo/weready/mcp-gemini-server/build/index.js"]
    }
  }
}
```

### Option 3: Use with other MCP clients

The server communicates via stdio, so you can integrate it with any MCP-compatible client:

```bash
node /path/to/mcp-gemini-server/build/index.js
```

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

## Examples

### Using with MCP client libraries

```typescript
// Example using gemini_prompt tool
await client.callTool("gemini_prompt", {
  prompt: "Explain quantum computing",
  model: "gemini-pro"
});

// Example using gemini_analyze_file tool
await client.callTool("gemini_analyze_file", {
  filePath: "./src/app.ts",
  prompt: "Find potential security issues in this code"
});

// Example using gemini_code_review tool
await client.callTool("gemini_code_review", {
  directory: "./src",
  reviewType: "security"
});
```

## Configuration Options

### Tool Parameters

#### gemini_prompt
- `prompt` (required): The prompt to send to Gemini
- `model` (optional): Gemini model to use
- `includeContext` (optional): Include all files in context
- `interactive` (optional): Run in interactive mode
- `sandbox` (optional): Run in sandbox mode

#### gemini_analyze_file
- `filePath` (required): Path to the file to analyze
- `prompt` (required): Analysis prompt
- `model` (optional): Gemini model to use

#### gemini_code_review
- `directory` (required): Directory to review
- `reviewType` (optional): "security", "performance", "best-practices", or "all"
- `model` (optional): Gemini model to use

## License

MIT