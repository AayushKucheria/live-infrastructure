'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentLab } from '../lib/storage';
import { getLabById } from '../lib/mockData';

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLabId, setCurrentLabId] = useState<string | null>(null);
  const [labName, setLabName] = useState<string | null>(null);

  useEffect(() => {
    const labId = getCurrentLab();
    setCurrentLabId(labId);
    if (labId) {
      const lab = getLabById(labId);
      setLabName(lab?.name || null);
    } else {
      setLabName(null);
    }
  }, [pathname]); // Re-check when route changes

  // Don't show header on home page
  if (pathname === '/') {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          🏠 Home
        </Link>
        {currentLabId && labName ? (
          <Link
            href={`/lab/${currentLabId}`}
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            🧪 {labName}
          </Link>
        ) : (
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            🧪 Select Lab
          </Link>
        )}
      </div>
    </div>
  );
}

