import React from 'react';
import { ArrowRight } from 'lucide-react';

interface MethodologyCardProps {
  title: string;
  description: string;
  highlights: string[];
  tone: 'blue' | 'green' | 'orange' | 'purple' | 'sky' | 'emerald';
}

export default function MethodologyCard({ title, description, highlights, tone }: MethodologyCardProps) {
  const colorMap: Record<
    'blue' | 'green' | 'orange' | 'purple' | 'sky' | 'emerald',
    { accent: string; container: string }
  > = {
    blue: { accent: 'text-blue-600', container: 'bg-blue-50 border-blue-200' },
    green: { accent: 'text-green-600', container: 'bg-green-50 border-green-200' },
    orange: { accent: 'text-orange-600', container: 'bg-orange-50 border-orange-200' },
    purple: { accent: 'text-purple-600', container: 'bg-purple-50 border-purple-200' },
    sky: { accent: 'text-sky-600', container: 'bg-sky-50 border-sky-200' },
    emerald: { accent: 'text-emerald-600', container: 'bg-emerald-50 border-emerald-200' }
  };

  const { accent, container } = colorMap[tone];

  return (
    <div className={`rounded-lg border p-4 ${container}`}>
      <div className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>{title}</div>
      <p className="text-sm text-slate-600 mt-2">{description}</p>
      <ul className="mt-3 space-y-1 text-xs text-slate-500">
        {highlights.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <ArrowRight className={`w-3 h-3 mt-0.5 ${accent}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}