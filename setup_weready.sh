#!/bin/bash

# WeReady Automated Setup Script
# Just run: bash setup_weready.sh

echo "🚀 Setting up WeReady MVP..."

# Create project structure
echo "📁 Creating project structure..."
mkdir -p weready/{backend/app/{api,core,models,services,utils},frontend,docs,scripts,extensions/vscode}
cd weready

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
node_modules/
venv/
__pycache__/
*.pyc
.env
.env.local
.next/
dist/
build/
*.egg-info/
*.log
.DS_Store
Thumbs.db
coverage/
.coverage
*.pid
EOF

# Setup Backend
echo "🐍 Setting up Python backend..."
cd backend

# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
httpx==0.25.2
python-multipart==0.0.6
EOF

# Create virtual environment and install
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create __init__.py files
touch app/__init__.py app/{api,core,models,services,utils}/__init__.py

# Create Hallucination Detector
cat > app/core/hallucination_detector.py << 'EOF'
import re
import httpx
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class HallucinationResult:
    score: float
    hallucinated_packages: List[str]
    confidence: float
    details: Dict

class HallucinationDetector:
    def __init__(self):
        self.known_packages = {}
        
    async def detect(self, code: str, language: str) -> HallucinationResult:
        packages = self._extract_packages(code, language)
        hallucinated = []
        for pkg in packages:
            if not await self._package_exists(pkg, language):
                hallucinated.append(pkg)
        score = len(hallucinated) / max(len(packages), 1)
        return HallucinationResult(
            score=score,
            hallucinated_packages=hallucinated,
            confidence=0.95 if hallucinated else 0.8,
            details={
                "total_packages": len(packages),
                "hallucinated_count": len(hallucinated),
                "language": language
            }
        )
    
    def _extract_packages(self, code: str, language: str) -> List[str]:
        packages = []
        if language == "python":
            import_pattern = r'(?:from|import)\s+([a-zA-Z_][a-zA-Z0-9_]*)'
            matches = re.findall(import_pattern, code)
            packages.extend(matches)
        elif language == "javascript":
            require_pattern = r'require\([\'"]([^\'"\)]+)[\'"]\)'
            import_pattern = r'import\s+.*\s+from\s+[\'"]([^\'\"]+)[\'"]'
            packages.extend(re.findall(require_pattern, code))
            packages.extend(re.findall(import_pattern, code))
        return list(set(packages))
    
    async def _package_exists(self, package: str, language: str) -> bool:
        if language == "python":
            return await self._check_pypi(package)
        elif language == "javascript":
            return await self._check_npm(package)
        return True
    
    async def _check_pypi(self, package: str) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"https://pypi.org/pypi/{package}/json")
                return response.status_code == 200
        except:
            return True
    
    async def _check_npm(self, package: str) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"https://registry.npmjs.org/{package}")
                return response.status_code == 200
        except:
            return True
EOF

# Create FastAPI app
cat > app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.core.hallucination_detector import HallucinationDetector

app = FastAPI(title="WeReady API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = HallucinationDetector()

class CodeScanRequest(BaseModel):
    code: str
    language: str = "python"
    repo_url: Optional[str] = None

class QuickCheckResponse(BaseModel):
    hallucination_score: float
    hallucinated_packages: list
    verdict: str
    action_required: str

@app.get("/")
async def root():
    return {
        "status": "alive",
        "message": "WeReady API - 76% of devs use AI, only 33% trust it."
    }

@app.post("/scan/quick", response_model=QuickCheckResponse)
async def quick_scan(request: CodeScanRequest):
    result = await detector.detect(request.code, request.language)
    if result.score > 0.2:
        verdict = "DANGER"
        action = f"Found {len(result.hallucinated_packages)} fake packages!"
    elif result.score > 0.1:
        verdict = "WARNING"
        action = "Some suspicious packages. Review carefully."
    else:
        verdict = "CLEAN"
        action = "No hallucinations detected. Ship it!"
    return QuickCheckResponse(
        hallucination_score=result.score,
        hallucinated_packages=result.hallucinated_packages,
        verdict=verdict,
        action_required=action
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
EOF

# Setup Frontend
echo "⚛️ Setting up Next.js frontend..."
cd ../frontend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "weready-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
EOF

# Install frontend dependencies
npm install

# Create Next.js config
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
EOF

# Create TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create app directory and files
mkdir -p app
cat > app/layout.tsx << 'EOF'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat > app/page.tsx << 'EOF'
"use client";
import { useState } from "react";

export default function Home() {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const scanCode = async () => {
    setScanning(true);
    try {
      const response = await fetch("http://localhost:8000/scan/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python" }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Scan failed:", error);
    }
    setScanning(false);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center">WeReady</h1>
        <p className="text-xl text-gray-400 mb-8 text-center">
          Detect hallucinated packages in AI-generated code
        </p>
        <div className="bg-gray-900 rounded-lg p-6">
          <textarea
            className="w-full h-64 bg-black text-white p-4 rounded border border-gray-700 font-mono text-sm"
            placeholder="Paste your AI-generated code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            onClick={scanCode}
            disabled={!code || scanning}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
          >
            {scanning ? "Scanning..." : "Detect Hallucinations"}
          </button>
        </div>
        {result && (
          <div className={`mt-6 p-4 rounded-lg ${
            result.verdict === "DANGER" ? "bg-red-900" :
            result.verdict === "WARNING" ? "bg-yellow-900" :
            "bg-green-900"
          }`}>
            <h3 className="font-bold text-xl">{result.verdict}</h3>
            <p className="mt-2">{result.action_required}</p>
            {result.hallucinated_packages.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold">Fake packages:</p>
                <ul className="list-disc list-inside">
                  {result.hallucinated_packages.map((pkg: string) => (
                    <li key={pkg}>{pkg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
EOF

# Create run scripts
cd ..
cat > run.sh << 'EOF'
#!/bin/bash
echo "Starting WeReady..."
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload &
cd ../frontend
npm run dev
EOF

chmod +x run.sh

# Create README
cat > README.md << 'EOF'
# WeReady - AI Code Reality Check

## Quick Start
1. Backend: `cd backend && source venv/bin/activate && python -m uvicorn app.main:app --reload`
2. Frontend: `cd frontend && npm run dev`
3. Open http://localhost:3000

## Test with hallucinated code:
```python
import numpy as np
import super_ai_helper  # FAKE!
from quantum_processor import QuantumML  # FAKE!