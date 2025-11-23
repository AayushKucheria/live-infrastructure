'use client';

interface AISuggestion {
  text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface AISuggestionBubblesProps {
  suggestions: AISuggestion[];
  onSuggestionClick: (suggestion: string) => void;
}

export default function AISuggestionBubbles({ suggestions, onSuggestionClick }: AISuggestionBubblesProps) {
  if (suggestions.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'medium':
        return 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700';
      case 'low':
        return 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700';
      default:
        return 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700';
    }
  };

  return (
    <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">You might want to consider:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className={`
              px-3 py-1.5 text-xs rounded-full border
              ${getPriorityColor(suggestion.priority)}
              text-zinc-700 dark:text-zinc-300
              hover:shadow-sm hover:scale-105
              transition-all duration-200
              cursor-pointer
            `}
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
}

