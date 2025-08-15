"use client";
import { Award, Mail, Github, Twitter, Linkedin, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                WeReady
              </span>
            </div>
            <p className="text-slate-300 text-lg mb-6 max-w-md">
              Evidence-based startup intelligence powered by Bailey. Get actionable insights 
              backed by research from YC, MIT, and leading VCs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="mailto:hello@weready.ai" className="text-slate-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  WeReady Score
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Bailey Intelligence
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  API Access
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Enterprise
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Research
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
            <div className="text-sm text-slate-400">
              © 2024 WeReady. All rights reserved.
            </div>
          </div>
        </div>

        {/* Research Credits */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-4">
              Powered by research from leading institutions and organizations
            </p>
            <div className="flex flex-wrap justify-center items-center space-x-6 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>MIT Startup Genome</span>
              </span>
              <span className="flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>Y Combinator Research</span>
              </span>
              <span className="flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>Bessemer Cloud</span>
              </span>
              <span className="flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>First Round Review</span>
              </span>
              <span className="flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>CISQ</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}