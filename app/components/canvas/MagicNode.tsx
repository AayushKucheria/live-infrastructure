'use client';

import React from 'react';

interface MagicNodeProps {
  id: string;
  isAnalyzing?: boolean;
  onClick: () => void;
}

export default function MagicNode({ id, isAnalyzing = false, onClick }: MagicNodeProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={isAnalyzing}
      className={`
        relative w-32 h-32 rounded-full flex items-center justify-center
        bg-gradient-to-br from-indigo-500 to-purple-600
        shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300
        z-10 group cursor-pointer border-4 border-white dark:border-zinc-800
        ${isAnalyzing ? 'animate-pulse cursor-wait' : ''}
      `}
    >
      <div className="text-center text-white p-4 z-20">
        <div className="font-bold text-sm uppercase tracking-wider shadow-sm">
          {isAnalyzing ? 'Analyzing...' : 'Generate Relevance'}
        </div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500 -z-10"></div>
      
      {/* Ring animation when analyzing */}
      {isAnalyzing && (
        <div className="absolute inset-0 rounded-full border-4 border-indigo-300 opacity-50 animate-ping"></div>
      )}
    </button>
  );
}

