import React from 'react';
import { Target, BrainCircuit, FileUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NextBestActions({ onStartNewAnalysis }) {
  const navigate = useNavigate();
  const actions = [
    {
      title: 'Analyze your 2nd project',
      description: 'Add another repository to deepen your placement readiness.',
      icon: <Target className="w-5 h-5 text-[#111111]" />, // red maybe
      onClick: () => onStartNewAnalysis && onStartNewAnalysis(),
    },
    {
      title: 'Practice 5 viva questions',
      description: 'Boost confidence with targeted interview drills.',
      icon: <BrainCircuit className="w-5 h-5 text-[#111111]" />, // blue
      onClick: () => navigate('/viva-prep'),
    },
    {
      title: 'Tailor resume for a job',
      description: 'Generate a role‑specific resume using AI.',
      icon: <FileUp className="w-5 h-5 text-[#111111]" />, // yellow
      onClick: () => navigate('/resume-vault'),
    },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-black text-[#111111] uppercase font-['Outfit'] mb-4">
        Next Best Actions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            className="bauhaus-card p-5 flex flex-col justify-between bg-white border-2 border-[#111111] shadow-[4px_4px_0_#111111] hover:shadow-[2px_2px_0_#111111] transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              {a.icon}
              <span className="font-bold text-[#111111] uppercase font-['JetBrains_Mono']">
                {a.title}
              </span>
            </div>
            <p className="text-xs text-[#555555] mb-3 font-['JetBrains_Mono']">
              {a.description}
            </p>
            <span className="inline-flex items-center text-xs text-[#1040C0] font-['JetBrains_Mono']">
              <ArrowRight className="w-3 h-3 mr-1" />
              Go
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
