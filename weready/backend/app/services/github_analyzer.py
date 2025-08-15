import os
import tempfile
import shutil
import subprocess
from typing import List, Optional
from pathlib import Path
import asyncio
from urllib.parse import urlparse

class GitHubAnalyzer:
    """Analyze GitHub repositories for AI-generated code issues"""
    
    def __init__(self):
        self.supported_extensions = {
            'python': ['.py', '.pyx', '.pyi'],
            'javascript': ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
            'java': ['.java'],
            'go': ['.go'],
            'rust': ['.rs'],
            'cpp': ['.cpp', '.cxx', '.cc', '.hpp', '.h'],
            'c': ['.c', '.h']
        }
        
    def extract_repo_info(self, github_url: str) -> Optional[tuple]:
        """Extract owner/repo from GitHub URL"""
        try:
            parsed = urlparse(github_url)
            if not parsed.hostname or 'github.com' not in parsed.hostname:
                return None
                
            path_parts = parsed.path.strip('/').split('/')
            if len(path_parts) >= 2:
                owner = path_parts[0]
                repo = path_parts[1].replace('.git', '')
                return (owner, repo)
        except Exception:
            pass
        return None
    
    async def analyze_repository(self, github_url: str, language: str = "python") -> dict:
        """Analyze a GitHub repository"""
        repo_info = self.extract_repo_info(github_url)
        if not repo_info:
            return {
                "error": "Invalid GitHub URL format",
                "files_analyzed": 0,
                "code_samples": []
            }
            
        owner, repo = repo_info
        
        # Create temp directory for cloning
        with tempfile.TemporaryDirectory() as temp_dir:
            repo_path = Path(temp_dir) / repo
            
            try:
                # Clone repository
                clone_result = await self._clone_repo(github_url, repo_path)
                if not clone_result:
                    return {
                        "error": "Failed to clone repository. Make sure it's public and accessible.",
                        "files_analyzed": 0,
                        "code_samples": []
                    }
                
                # Analyze repository
                analysis_result = await self._analyze_repo_contents(repo_path, language)
                analysis_result["repo_info"] = {
                    "owner": owner,
                    "name": repo,
                    "url": github_url
                }
                
                return analysis_result
                
            except Exception as e:
                return {
                    "error": f"Analysis failed: {str(e)}",
                    "files_analyzed": 0,
                    "code_samples": []
                }
    
    async def _clone_repo(self, github_url: str, target_path: Path) -> bool:
        """Clone GitHub repository"""
        try:
            # Use shallow clone for performance
            cmd = [
                "git", "clone", 
                "--depth", "1",
                "--quiet",
                github_url,
                str(target_path)
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            return process.returncode == 0
            
        except Exception as e:
            print(f"Clone failed: {e}")
            return False
    
    async def _analyze_repo_contents(self, repo_path: Path, language: str) -> dict:
        """Analyze repository contents for code quality issues"""
        files_analyzed = 0
        code_samples = []
        total_lines = 0
        
        # Get file extensions for the specified language
        extensions = self.supported_extensions.get(language.lower(), ['.py'])
        
        # Walk through repository files
        for root, dirs, files in os.walk(repo_path):
            # Skip common non-source directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in [
                'node_modules', '__pycache__', '.git', 'build', 'dist', 'target', 'vendor'
            ]]
            
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = Path(root) / file
                    
                    try:
                        # Read file content
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                        # Skip very large files (>100KB)
                        if len(content) > 100000:
                            continue
                            
                        lines = content.count('\n') + 1
                        total_lines += lines
                        files_analyzed += 1
                        
                        # Take sample of first 50 lines for analysis
                        lines_list = content.split('\n')
                        sample = '\n'.join(lines_list[:50])
                        
                        relative_path = file_path.relative_to(repo_path)
                        code_samples.append({
                            "file": str(relative_path),
                            "content": sample,
                            "lines": lines,
                            "language": language
                        })
                        
                    except Exception as e:
                        # Skip files that can't be read
                        continue
        
        return {
            "files_analyzed": files_analyzed,
            "total_lines": total_lines,
            "code_samples": code_samples,
            "language": language
        }
    
    def estimate_ai_likelihood(self, code_content: str) -> float:
        """Rough heuristic to estimate if code might be AI-generated"""
        # Simple heuristics for AI-generated code patterns
        ai_indicators = [
            "# AI generated",
            "# Generated by",
            "# This code was generated",
            "# Auto-generated",
            "import artificial_intelligence",
            "import ai_helper",
            "from ai import",
            "import super_ai",
            "import magic_ai",
            "import neural_net_helper",
            "import quantum_",
            "import deepmind_",
            "import openai_secret",
            "import gpt_helper"
        ]
        
        content_lower = code_content.lower()
        matches = sum(1 for indicator in ai_indicators if indicator in content_lower)
        
        # Return rough probability (0-1)
        return min(matches * 0.3, 1.0)
    
    async def get_repo_statistics(self, repo_path: Path) -> dict:
        """Get basic repository statistics"""
        try:
            # Get commit count (last 100 for performance)
            cmd = ["git", "-C", str(repo_path), "rev-list", "--count", "HEAD", "--max-count=100"]
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            commit_count = 0
            if process.returncode == 0:
                commit_count = min(int(stdout.decode().strip()), 100)
                
            return {
                "commit_count": commit_count,
                "has_readme": (repo_path / "README.md").exists() or (repo_path / "readme.md").exists(),
                "has_license": any((repo_path / name).exists() for name in ["LICENSE", "LICENSE.txt", "license.txt"]),
                "has_gitignore": (repo_path / ".gitignore").exists(),
            }
        except Exception:
            return {
                "commit_count": 0,
                "has_readme": False,
                "has_license": False,
                "has_gitignore": False
            }