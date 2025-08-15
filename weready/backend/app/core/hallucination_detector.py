import httpx
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
from tree_sitter import Language, Parser
from typing import Dict, List, Set
from dataclasses import dataclass
import asyncio
import logging

@dataclass
class HallucinationResult:
    score: float
    hallucinated_packages: List[str]
    confidence: float
    details: Dict

class HallucinationDetector:
    def __init__(self):
        self.known_packages = {}
        self._setup_parsers()
        self._setup_standard_libraries()
        
    def _setup_standard_libraries(self):
        """Setup standard library package lists to avoid false positives"""
        # Python standard library packages (partial list of common ones)
        self.python_stdlib = {
            'os', 'sys', 'json', 'collections', 'itertools', 'functools', 
            'pathlib', 'datetime', 'time', 'random', 're', 'math', 'urllib',
            'http', 'socket', 'ssl', 'hashlib', 'hmac', 'base64', 'uuid',
            'pickle', 'csv', 'sqlite3', 'logging', 'threading', 'multiprocessing',
            'subprocess', 'shutil', 'tempfile', 'glob', 'argparse', 'configparser',
            'io', 'typing', 'dataclasses', 'enum', 'abc', 'contextlib',
            'weakref', 'copy', 'operator', 'keyword', 'inspect', 'importlib',
            'pkgutil', 'modulefinder', 'runpy', 'ast', 'dis', 'code', 'codeop',
            'pdb', 'profile', 'pstats', 'timeit', 'trace', 'traceback',
            'warnings', 'gc', 'ctypes', 'struct', 'codecs', 'unicodedata',
            'stringprep', 'readline', 'rlcompleter', 'getopt', 'getpass',
            'platform', 'errno', 'signal', 'mmap', 'select', 'resource',
            'sysconfig', 'site', 'user', 'textwrap', 'string', 'locale',
            'calendar', 'heapq', 'bisect', 'array', 'types', 'numbers',
            'decimal', 'fractions', 'statistics', 'zlib', 'gzip', 'bz2',
            'lzma', 'zipfile', 'tarfile', 'dbm', 'shelve', 'marshal',
            'xdrlib', 'plistlib', 'mailbox', 'mimetypes', 'email', 'mailcap',
            'smtplib', 'poplib', 'imaplib', 'ftplib', 'telnetlib', 'xmlrpc',
            'xml', 'html', 'cgitb', 'wsgiref', 'socketserver'
        }
        
        # JavaScript/Node.js built-in modules  
        self.js_builtins = {
            'fs', 'path', 'os', 'url', 'querystring', 'util', 'events',
            'stream', 'buffer', 'crypto', 'http', 'https', 'net', 'dgram',
            'dns', 'tls', 'cluster', 'child_process', 'readline', 'repl',
            'vm', 'assert', 'string_decoder', 'punycode', 'v8', 'zlib',
            'process', 'console', 'timers', 'module', 'worker_threads'
        }
        
    def _setup_parsers(self):
        """Initialize Tree-sitter parsers for supported languages"""
        self.parsers = {}
        
        # Python parser
        try:
            py_parser = Parser(Language(tspython.language()))
            self.parsers["python"] = py_parser
        except Exception as e:
            logging.error(f"Failed to initialize Python parser: {e}")
            
        # JavaScript parser  
        try:
            js_parser = Parser(Language(tsjavascript.language()))
            self.parsers["javascript"] = js_parser
        except Exception as e:
            logging.error(f"Failed to initialize JavaScript parser: {e}")
        
    async def detect(self, code: str, language: str) -> HallucinationResult:
        """Detect hallucinated packages in code using Tree-sitter AST parsing"""
        packages = self._extract_packages_ast(code, language)
        hallucinated = []
        
        # Check each package against registries
        for pkg in packages:
            if not await self._package_exists(pkg, language):
                hallucinated.append(pkg)
                
        # Calculate confidence based on parsing success and results
        parsing_confidence = 0.95 if language in self.parsers else 0.7
        result_confidence = parsing_confidence * (0.9 if hallucinated else 0.85)
        
        score = len(hallucinated) / max(len(packages), 1)
        
        return HallucinationResult(
            score=score,
            hallucinated_packages=hallucinated,
            confidence=result_confidence,
            details={
                "total_packages": len(packages),
                "hallucinated_count": len(hallucinated),
                "language": language,
                "parsing_method": "tree_sitter" if language in self.parsers else "fallback_regex",
                "packages_found": list(packages)
            }
        )
    
    def _extract_packages_ast(self, code: str, language: str) -> Set[str]:
        """Extract package names using Tree-sitter AST parsing"""
        if language not in self.parsers:
            # Fallback to regex for unsupported languages
            return self._extract_packages_regex(code, language)
            
        parser = self.parsers[language]
        packages = set()
        
        try:
            tree = parser.parse(bytes(code, "utf8"))
            root_node = tree.root_node
            
            if language == "python":
                packages.update(self._extract_python_imports(root_node, code))
            elif language == "javascript":
                packages.update(self._extract_javascript_imports(root_node, code))
                
        except Exception as e:
            logging.error(f"AST parsing failed for {language}: {e}")
            # Fallback to regex if AST parsing fails
            packages.update(self._extract_packages_regex(code, language))
            
        return packages
    
    def _extract_python_imports(self, node, code: str) -> Set[str]:
        """Extract Python import statements from AST"""
        packages = set()
        
        def traverse(node):
            # Handle 'import' statements: import module, import module.submodule
            if node.type == "import_statement":
                for child in node.children:
                    if child.type == "dotted_as_names":
                        # Handle: import module as alias, import module1, module2
                        for subchild in child.children:
                            if subchild.type == "dotted_as_name":
                                # import module as alias
                                for grandchild in subchild.children:
                                    if grandchild.type == "dotted_name":
                                        package_name = code[grandchild.start_byte:grandchild.end_byte].split('.')[0]
                                        packages.add(package_name)
                            elif subchild.type == "dotted_name":
                                package_name = code[subchild.start_byte:subchild.end_byte].split('.')[0]
                                packages.add(package_name)
                    elif child.type == "dotted_name":
                        package_name = code[child.start_byte:child.end_byte].split('.')[0]
                        packages.add(package_name)
                    elif child.type == "aliased_import":
                        # Handle single aliased import
                        for subchild in child.children:
                            if subchild.type == "dotted_name":
                                package_name = code[subchild.start_byte:subchild.end_byte].split('.')[0]
                                packages.add(package_name)
                                
            # Handle 'from' statements: from module import something
            elif node.type == "import_from_statement":
                for child in node.children:
                    if child.type == "dotted_name":
                        package_name = code[child.start_byte:child.end_byte].split('.')[0]
                        packages.add(package_name)
                    elif child.type == "relative_import":
                        # Skip relative imports (they're not external packages)
                        pass
                        
            # Recursively traverse child nodes
            for child in node.children:
                traverse(child)
                
        traverse(node)
        return packages
    
    def _extract_javascript_imports(self, node, code: str) -> Set[str]:
        """Extract JavaScript import/require statements from AST"""
        packages = set()
        
        def traverse(node):
            # Handle ES6 imports: import ... from 'module'
            if node.type == "import_statement":
                for child in node.children:
                    if child.type == "string":
                        # Extract module name from quotes
                        module_text = code[child.start_byte:child.end_byte]
                        module_name = module_text.strip('"\'')
                        # Skip relative imports starting with . or /
                        if not module_name.startswith(('.', '/')):
                            # Take first part before / for scoped packages
                            if module_name.startswith('@'):
                                # Handle scoped packages like @scope/package
                                parts = module_name.split('/')
                                if len(parts) >= 2:
                                    packages.add(f"{parts[0]}/{parts[1]}")
                            else:
                                packages.add(module_name.split('/')[0])
                                
            # Handle require() calls
            elif node.type == "call_expression":
                for child in node.children:
                    if child.type == "identifier" and code[child.start_byte:child.end_byte] == "require":
                        # Look for string argument
                        for arg_child in node.children:
                            if arg_child.type == "arguments":
                                for arg in arg_child.children:
                                    if arg.type == "string":
                                        module_text = code[arg.start_byte:arg.end_byte]
                                        module_name = module_text.strip('"\'')
                                        # Skip relative imports
                                        if not module_name.startswith(('.', '/')):
                                            if module_name.startswith('@'):
                                                parts = module_name.split('/')
                                                if len(parts) >= 2:
                                                    packages.add(f"{parts[0]}/{parts[1]}")
                                            else:
                                                packages.add(module_name.split('/')[0])
                                                
            # Recursively traverse child nodes
            for child in node.children:
                traverse(child)
                
        traverse(node)
        return packages
    
    def _extract_packages_regex(self, code: str, language: str) -> Set[str]:
        """Fallback regex-based extraction for unsupported languages or parsing failures"""
        import re
        packages = set()
        
        if language == "python":
            # Basic Python import patterns
            import_patterns = [
                r'^\s*import\s+([a-zA-Z_][a-zA-Z0-9_]*)',
                r'^\s*from\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+import',
            ]
            for pattern in import_patterns:
                matches = re.findall(pattern, code, re.MULTILINE)
                packages.update(matches)
                
        elif language == "javascript":
            # Basic JavaScript import/require patterns
            import_patterns = [
                r'require\([\'"]([^\'"\)]+)[\'"]\)',
                r'import\s+.*\s+from\s+[\'"]([^\'\"]+)[\'"]',
                r'import\s+[\'"]([^\'\"]+)[\'"]',
            ]
            for pattern in import_patterns:
                matches = re.findall(pattern, code)
                for match in matches:
                    # Skip relative imports
                    if not match.startswith(('.', '/')):
                        if match.startswith('@'):
                            parts = match.split('/')
                            if len(parts) >= 2:
                                packages.add(f"{parts[0]}/{parts[1]}")
                        else:
                            packages.add(match.split('/')[0])
                            
        return packages
    
    async def _package_exists(self, package: str, language: str) -> bool:
        """Check if package exists in appropriate registry"""
        if language == "python":
            # First check if it's a standard library package
            if package in self.python_stdlib:
                return True
            return await self._check_pypi(package)
        elif language == "javascript":
            # First check if it's a Node.js built-in module
            if package in self.js_builtins:
                return True
            return await self._check_npm(package)
        return True
    
    async def _check_pypi(self, package: str) -> bool:
        """Check if Python package exists on PyPI"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"https://pypi.org/pypi/{package}/json")
                return response.status_code == 200
        except Exception as e:
            logging.warning(f"PyPI check failed for {package}: {e}")
            # Return True on network errors to avoid false positives
            return True
    
    async def _check_npm(self, package: str) -> bool:
        """Check if JavaScript package exists on npm registry"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"https://registry.npmjs.org/{package}")
                return response.status_code == 200
        except Exception as e:
            logging.warning(f"npm check failed for {package}: {e}")
            # Return True on network errors to avoid false positives
            return True
