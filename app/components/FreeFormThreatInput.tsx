'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface StructuredThreatData {
  description: string;
  location: string;
  detectionMethod: string;
  timeline: string;
  urgency: 'low' | 'medium' | 'high';
  detailedFindings?: string;
  specificLocation?: string;
  sampleCount?: number;
  geneticMarkers?: string[];
}

interface AISuggestion {
  text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface FreeFormThreatInputProps {
  value: string;
  onChange: (value: string) => void;
  onStructuredDataChange: (data: StructuredThreatData) => void;
  onSuggestionsChange: (suggestions: AISuggestion[]) => void;
  privacyLevel: 'high' | 'medium' | 'low';
}

export default function FreeFormThreatInput({
  value,
  onChange,
  onStructuredDataChange,
  onSuggestionsChange,
  privacyLevel
}: FreeFormThreatInputProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounced analysis function
  const analyzeInput = useCallback(async (text: string) => {
    if (!text.trim() || text.length < 20) {
      // Too short to analyze meaningfully
      onStructuredDataChange({
        description: text,
        location: '',
        detectionMethod: '',
        timeline: '',
        urgency: 'medium'
      });
      onSuggestionsChange([]);
      return;
    }

    setIsAnalyzing(true);

    try {
      // Analyze the input
      const analyzeResponse = await fetch('/api/openrouter/analyze-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeformText: text })
      });

      if (analyzeResponse.ok) {
        const analyzeData = await analyzeResponse.json();
        if (analyzeData.success && analyzeData.data) {
          onStructuredDataChange(analyzeData.data);

          // Generate suggestions
          const suggestionsResponse = await fetch('/api/openrouter/generate-suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              freeformText: text,
              structuredData: analyzeData.data
            })
          });

          if (suggestionsResponse.ok) {
            const suggestionsData = await suggestionsResponse.json();
            if (suggestionsData.success && suggestionsData.suggestions) {
              onSuggestionsChange(suggestionsData.suggestions);
            } else {
              onSuggestionsChange([]);
            }
          } else {
            onSuggestionsChange([]);
          }
        }
      }
    } catch (error) {
      console.error('Error analyzing input:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onStructuredDataChange, onSuggestionsChange]);

  // Handle text change with debouncing
  const handleTextChange = (newValue: string) => {
    onChange(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced analysis
    debounceTimerRef.current = setTimeout(() => {
      analyzeInput(newValue);
    }, 1000); // 1 second debounce
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestionText: string) => {
    const currentText = value || '';
    const newText = currentText + (currentText ? ' ' : '') + suggestionText;
    onChange(newText);
    // Trigger analysis immediately
    analyzeInput(newText);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Describe the threat or situation in your own words... 

For example: 'We detected unusual patterns in wastewater samples from Mumbai last week. The genomic sequencing shows markers similar to known pathogens but with some novel variations. We've collected 15 samples so far and are seeing increased hospital admissions in the area.'"
          rows={12}
          className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed"
        />
        {isAnalyzing && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="w-4 h-4 border-2 border-zinc-300 dark:border-zinc-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Analyzing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

