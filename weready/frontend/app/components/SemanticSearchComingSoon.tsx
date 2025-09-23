"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Loader2,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";

interface InterestResponse {
  message?: string;
}

export default function SemanticSearchComingSoon() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const featureHighlights = [
    {
      icon: <Search className="h-5 w-5 text-indigo-500" />,
      title: "Ask like you speak",
      description: "Search naturally across 40+ trusted sources without memorizing keywords."
    },
    {
      icon: <Brain className="h-5 w-5 text-indigo-500" />,
      title: "AI synthesis",
      description: "Get Bailey's AI to act as your research analyst and return concise, source-linked briefs."
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-indigo-500" />,
      title: "Credibility engine",
      description: "Every answer is verified against the Bailey credibility engine before it reaches you."
    }
  ];

  const capabilityCards = [
    {
      heading: "Natural language questions",
      body: "Ask complex multi-part questions the way you would brief an analyst. Bailey interprets intent automatically."
    },
    {
      heading: "Real-time intelligence",
      body: "Track regulatory filings, funding updates, news and market chatter as it happens—no manual refresh required."
    },
    {
      heading: "Cross-source validation",
      body: "Results are validated across primary sources, industry databases and expert commentary to eliminate guesswork."
    }
  ];

  const previewQuestions = [
    "How are regulators approaching AI safety in fintech right now?",
    "Show me the latest competitive moves from Stripe in LATAM",
    "Summarize new venture activity in carbon capture over the last 90 days"
  ];

  const isValidEmail = (value: string) => {
    return /.+@.+\..+/.test(value.trim());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        "http://localhost:8000/api/notifications/semantic-search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() })
        }
      );

      if (!response.ok) {
        const data: InterestResponse = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to save your interest right now");
      }

      setIsSubmitted(true);
    } catch (submitError: any) {
      setError(submitError.message || "Something went wrong. Try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[680px] rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-[1px] shadow-2xl">
      <div className="h-full w-full rounded-[calc(theme(borderRadius.3xl)-1px)] bg-white/95 p-8 md:p-12">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" />
              Semantic Search is almost here
            </div>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Ask Bailey anything. Get mission-critical answers instantly.
            </h2>
            <p className="text-lg text-slate-600">
              We're putting the Bailey credibility engine behind natural language search so you can surface trustworthy intelligence across 40+ premium sources without the research slog.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-100/80 bg-white/70 p-4 shadow-sm backdrop-blur"
                >
                  <div className="mb-3 inline-flex rounded-full bg-indigo-50 p-2">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
            {!isSubmitted ? (
              <>
                <div className="mb-6 space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900">Be first when we go live</h3>
                  <p className="text-sm text-slate-600">
                    We’ll notify you the moment semantic search is available for your workspace.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="semantic-search-email" className="text-sm font-medium text-slate-700">
                      Work email
                    </label>
                    <div className="mt-2 flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="semantic-search-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@company.com"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          aria-invalid={error ? "true" : "false"}
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            Notify me
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                    {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
                  </div>
                </form>
                <div className="flex items-center gap-2 rounded-xl bg-indigo-50/80 p-3 text-sm text-indigo-700">
                  <ShieldCheck className="h-4 w-4" />
                  No spam—just a launch-day alert from the Bailey team.
                </div>
              </>
            ) : (
              <div className="flex flex-col items-start gap-4 text-left">
                <div className="flex items-center gap-3 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  You’re on the list!
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    We’ll let you know the moment semantic search launches.
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Until then, keep exploring Bailey Intelligence. We’re polishing the experience so it feels like your personal research analyst on demand.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("");
                    setIsSubmitted(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Join with another email
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/10">
                <Zap className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-indigo-600">Preview the experience</p>
                <h3 className="text-lg font-semibold text-slate-900">What semantic search will feel like</h3>
              </div>
            </div>
            <div className="space-y-4">
              {previewQuestions.map((question) => (
                <div key={question} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">{question}</p>
                  <p className="mt-3 text-sm text-slate-600">
                    Bailey is already mapping the data sources, expert commentary, and credibility signals to deliver precise, trusted insights the moment you ask.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600">
                    <Sparkles className="h-3.5 w-3.5" />
                    Sample response arrives in seconds with cited sources
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-500 p-[1px] shadow-xl">
            <div className="h-full rounded-[calc(theme(borderRadius.3xl)-1px)] bg-slate-900/95 p-8">
              <div className="flex items-center gap-3 text-indigo-200">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm uppercase tracking-widest">Why it matters</span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-white">
                Built on Bailey’s credibility engine
              </h3>
              <p className="mt-3 text-sm text-indigo-100">
                Semantic search taps into our multi-source validation layer so every answer is backed by auditable, cross-checked evidence. No hallucinations. No guesswork.
              </p>
              <div className="mt-8 space-y-4">
                {capabilityCards.map((card) => (
                  <div key={card.heading} className="rounded-2xl border border-indigo-500/30 bg-slate-900/70 p-4">
                    <h4 className="text-base font-semibold text-white">{card.heading}</h4>
                    <p className="mt-2 text-sm text-indigo-100/80">{card.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
