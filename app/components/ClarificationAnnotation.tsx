'use client';

import { useState } from 'react';

export interface Clarification {
  id: string;
  section: string;
  content: string;
  createdAt: string;
}

interface ClarificationAnnotationProps {
  section: string;
  clarifications: Clarification[];
  onAdd: (section: string, content: string) => void;
  onRemove: (id: string) => void;
}

export default function ClarificationAnnotation({
  section,
  clarifications,
  onAdd,
  onRemove
}: ClarificationAnnotationProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');

  const sectionClarifications = clarifications.filter(c => c.section === section);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContent.trim()) {
      onAdd(section, newContent.trim());
      setNewContent('');
      setIsAdding(false);
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {sectionClarifications.map((clarification) => (
        <div
          key={clarification.id}
          className="group relative p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs"
        >
          <p className="text-blue-800 dark:text-blue-300">{clarification.content}</p>
          <button
            onClick={() => onRemove(clarification.id)}
            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-opacity"
            title="Remove clarification"
          >
            ×
          </button>
        </div>
      ))}

      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
        >
          <span>+</span>
          <span>Add clarification</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Add a clarification or note..."
            rows={2}
            className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewContent('');
              }}
              className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

