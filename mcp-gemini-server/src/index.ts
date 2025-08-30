#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  PromptMessage,
  TextContent,
  ImageContent,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";

const GeminiRequestSchema = z.object({
  prompt: z.string().describe("The prompt to send to Gemini"),
  model: z.string().optional().describe("The Gemini model to use"),
  includeContext: z.boolean().optional().describe("Include all files in context"),
  interactive: z.boolean().optional().describe("Run in interactive mode"),
  sandbox: z.boolean().optional().describe("Run in sandbox mode"),
});

const FileAnalysisSchema = z.object({
  filePath: z.string().describe("Path to the file to analyze"),
  prompt: z.string().describe("Analysis prompt for the file"),
  model: z.string().optional().describe("The Gemini model to use"),
});

const CodeReviewSchema = z.object({
  directory: z.string().describe("Directory to review"),
  reviewType: z.enum(["security", "performance", "best-practices", "all"])
    .optional()
    .describe("Type of code review to perform"),
  model: z.string().optional().describe("The Gemini model to use"),
});

class GeminiMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "mcp-gemini-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async runGeminiCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const gemini = spawn("gemini", args);
      let output = "";
      let error = "";

      gemini.stdout.on("data", (data) => {
        output += data.toString();
      });

      gemini.stderr.on("data", (data) => {
        error += data.toString();
      });

      gemini.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Gemini exited with code ${code}: ${error}`));
        } else {
          resolve(output);
        }
      });

      gemini.on("error", (err) => {
        reject(err);
      });
    });
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "gemini_prompt",
          description: "Send a prompt to Gemini CLI and get a response",
          inputSchema: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "The prompt to send to Gemini",
              },
              model: {
                type: "string",
                description: "The Gemini model to use (optional)",
              },
              includeContext: {
                type: "boolean",
                description: "Include all files in context (optional)",
              },
              interactive: {
                type: "boolean",
                description: "Run in interactive mode (optional)",
              },
              sandbox: {
                type: "boolean",
                description: "Run in sandbox mode (optional)",
              },
            },
            required: ["prompt"],
          },
        },
        {
          name: "gemini_analyze_file",
          description: "Analyze a file using Gemini with a specific prompt",
          inputSchema: {
            type: "object",
            properties: {
              filePath: {
                type: "string",
                description: "Path to the file to analyze",
              },
              prompt: {
                type: "string",
                description: "Analysis prompt for the file",
              },
              model: {
                type: "string",
                description: "The Gemini model to use (optional)",
              },
            },
            required: ["filePath", "prompt"],
          },
        },
        {
          name: "gemini_code_review",
          description: "Perform code review on a directory using Gemini",
          inputSchema: {
            type: "object",
            properties: {
              directory: {
                type: "string",
                description: "Directory to review",
              },
              reviewType: {
                type: "string",
                enum: ["security", "performance", "best-practices", "all"],
                description: "Type of code review to perform (optional)",
              },
              model: {
                type: "string",
                description: "The Gemini model to use (optional)",
              },
            },
            required: ["directory"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "code_explanation",
          description: "Explain code in simple terms",
          arguments: [
            {
              name: "code",
              description: "The code to explain",
              required: true,
            },
            {
              name: "language",
              description: "Programming language of the code",
              required: false,
            },
          ],
        },
        {
          name: "refactor_suggestion",
          description: "Suggest refactoring improvements for code",
          arguments: [
            {
              name: "code",
              description: "The code to refactor",
              required: true,
            },
            {
              name: "goal",
              description: "Refactoring goal (e.g., performance, readability)",
              required: false,
            },
          ],
        },
        {
          name: "bug_analysis",
          description: "Analyze potential bugs in code",
          arguments: [
            {
              name: "code",
              description: "The code to analyze",
              required: true,
            },
            {
              name: "context",
              description: "Additional context about the code",
              required: false,
            },
          ],
        },
      ],
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const promptTemplates: Record<string, (args: any) => PromptMessage[]> = {
        code_explanation: (args) => [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please explain the following ${args.language || "code"} in simple terms:\n\n${args.code}`,
            },
          },
        ],
        refactor_suggestion: (args) => [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please suggest refactoring improvements for the following code${
                args.goal ? ` with a focus on ${args.goal}` : ""
              }:\n\n${args.code}`,
            },
          },
        ],
        bug_analysis: (args) => [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please analyze the following code for potential bugs${
                args.context ? `\n\nContext: ${args.context}` : ""
              }:\n\n${args.code}`,
            },
          },
        ],
      };

      const template = promptTemplates[name];
      if (!template) {
        throw new Error(`Unknown prompt: ${name}`);
      }

      return {
        description: `Prompt template: ${name}`,
        messages: template(args || {}),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "gemini_prompt": {
            const validatedArgs = GeminiRequestSchema.parse(args);
            const commandArgs: string[] = [];

            if (validatedArgs.model) {
              commandArgs.push("-m", validatedArgs.model);
            }

            if (validatedArgs.includeContext) {
              commandArgs.push("-a");
            }

            if (validatedArgs.sandbox) {
              commandArgs.push("-s");
            }

            commandArgs.push("-p", validatedArgs.prompt);

            const result = await this.runGeminiCommand(commandArgs);
            return {
              content: [
                {
                  type: "text",
                  text: result,
                },
              ],
            };
          }

          case "gemini_analyze_file": {
            const validatedArgs = FileAnalysisSchema.parse(args);
            
            // Read the file content
            const fileContent = await fs.readFile(validatedArgs.filePath, "utf-8");
            
            const prompt = `${validatedArgs.prompt}\n\nFile: ${validatedArgs.filePath}\n\n${fileContent}`;
            
            const commandArgs: string[] = [];
            if (validatedArgs.model) {
              commandArgs.push("-m", validatedArgs.model);
            }
            commandArgs.push("-p", prompt);

            const result = await this.runGeminiCommand(commandArgs);
            return {
              content: [
                {
                  type: "text",
                  text: result,
                },
              ],
            };
          }

          case "gemini_code_review": {
            const validatedArgs = CodeReviewSchema.parse(args);
            
            const reviewPrompts: Record<string, string> = {
              security: "Perform a security review of the code in this directory. Look for vulnerabilities, unsafe practices, and potential security issues.",
              performance: "Analyze the code for performance issues, bottlenecks, and optimization opportunities.",
              "best-practices": "Review the code for adherence to best practices, code quality, and maintainability.",
              all: "Perform a comprehensive code review including security, performance, and best practices.",
            };

            const reviewType = validatedArgs.reviewType || "all";
            const prompt = `${reviewPrompts[reviewType]}\n\nDirectory: ${validatedArgs.directory}`;
            
            const commandArgs: string[] = [];
            if (validatedArgs.model) {
              commandArgs.push("-m", validatedArgs.model);
            }
            
            // Include all files in the directory for review
            commandArgs.push("-a");
            commandArgs.push("--include-directories", validatedArgs.directory);
            commandArgs.push("-p", prompt);

            const result = await this.runGeminiCommand(commandArgs);
            return {
              content: [
                {
                  type: "text",
                  text: result,
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing Gemini command: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Gemini MCP Server running on stdio");
  }
}

const server = new GeminiMCPServer();
server.run().catch(console.error);