'use client';

import { MOCK_LABS, Lab } from '../lib/mockData';
import { useRouter } from 'next/navigation';
import { setCurrentLab } from '../lib/storage';
import { PRIMARY_LAB_ID } from '../lib/constants';

export default function LabSelector() {
  const router = useRouter();

  const handleSelectLab = (lab: Lab) => {
    if (lab.id !== PRIMARY_LAB_ID) {
      return;
    }
    setCurrentLab(lab.id);
    router.push(`/lab/${lab.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Live Coordination Infrastructure
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Join as a research lab to coordinate abnormality information while respecting institutional constraints
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_LABS.map((lab) => {
            const isAllowedLab = lab.id === PRIMARY_LAB_ID;
            return (
            <button
              key={lab.id}
              type="button"
              onClick={() => handleSelectLab(lab)}
              disabled={!isAllowedLab}
              aria-disabled={!isAllowedLab}
              className={`bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm text-left border transition-all duration-200 ${
                isAllowedLab
                  ? 'hover:shadow-md border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 group'
                  : 'opacity-60 border-dashed border-zinc-200 dark:border-zinc-700 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lab.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {lab.location}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400">
                  {lab.type}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                  {isAllowedLab ? 'Join →' : 'Unavailable'}
                </span>
              </div>
            </button>
          );
          })}
        </div>
      </div>
    </div>
  );
}

