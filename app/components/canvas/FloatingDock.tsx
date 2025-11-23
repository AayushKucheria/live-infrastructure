'use client';

import React, { useState, useMemo } from 'react';
import { AbnormalityBubble } from '../../lib/mockData';
import { StoredAbnormalityBubble } from '../../lib/storage';
import DraggableAbnormalityCard from './DraggableAbnormalityCard';
import CompactAbnormalityCard from './CompactAbnormalityCard';
import AbnormalityBubbleCard from '../AbnormalityBubbleCard';
import { useDraggable } from '@dnd-kit/core';
import { applyAllFilters, countActiveFilters, FilterOptions } from '../../lib/filtering';

type AbnormalityBubbleUnion = AbnormalityBubble | StoredAbnormalityBubble;

interface FloatingDockProps {
  abnormalities: AbnormalityBubbleUnion[];
  mainAbnormality?: AbnormalityBubbleUnion; // For geographical filtering context
}

function DraggableCompactCard({ 
  id, 
  bubble, 
  onExpand 
}: { 
  id: string; 
  bubble: AbnormalityBubbleUnion; 
  onExpand: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { bubble }
  });

  const style = {
    opacity: isDragging ? 0 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleClick = (e?: React.MouseEvent) => {
    // Only expand on click, not on drag start
    if (!isDragging) {
      e?.stopPropagation();
      onExpand();
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className="touch-none"
    >
      <div {...listeners}>
        <CompactAbnormalityCard
          bubble={bubble}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

export default function FloatingDock({ abnormalities, mainAbnormality }: FloatingDockProps) {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    geography: undefined,
    urgency: [],
    privacyLevel: [],
    detectionMethod: [],
    dateRange: { type: 'all' },
  });

  // Get unique detection methods from abnormalities
  const uniqueDetectionMethods = useMemo(() => {
    const methods = new Set(abnormalities.map(b => b.detectionMethod));
    return Array.from(methods).sort();
  }, [abnormalities]);

  // Apply filters
  const filteredAbnormalities = useMemo(() => {
    const filterOptions: FilterOptions = {
      ...filters,
      geography: filters.geography ? {
        ...filters.geography,
        referenceLocation: mainAbnormality?.location,
        referenceLabId: mainAbnormality?.labId,
      } : undefined,
    };
    return applyAllFilters(abnormalities, filterOptions);
  }, [abnormalities, filters, mainAbnormality]);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const handleCardClick = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleCloseExpanded = () => {
    setExpandedCardId(null);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleToggleUrgency = (urgency: 'low' | 'medium' | 'high') => {
    setFilters(prev => ({
      ...prev,
      urgency: prev.urgency?.includes(urgency)
        ? prev.urgency.filter(u => u !== urgency)
        : [...(prev.urgency || []), urgency],
    }));
  };

  const handleTogglePrivacy = (privacy: 'low' | 'medium' | 'high') => {
    setFilters(prev => ({
      ...prev,
      privacyLevel: prev.privacyLevel?.includes(privacy)
        ? prev.privacyLevel.filter(p => p !== privacy)
        : [...(prev.privacyLevel || []), privacy],
    }));
  };

  const handleToggleDetectionMethod = (method: string) => {
    setFilters(prev => ({
      ...prev,
      detectionMethod: prev.detectionMethod?.includes(method)
        ? prev.detectionMethod.filter(m => m !== method)
        : [...(prev.detectionMethod || []), method],
    }));
  };

  const handleGeographyChange = (type: 'same-country' | 'same-region' | 'within-distance', distanceKm?: number) => {
    setFilters(prev => ({
      ...prev,
      geography: prev.geography?.type === type ? undefined : { type, distanceKm },
    }));
  };

  const handleDateRangeChange = (type: 'all' | 'last-days' | 'last-weeks' | 'last-months', value?: number) => {
    setFilters(prev => ({
      ...prev,
      dateRange: type === 'all' 
        ? { type: 'all' }
        : type === 'last-days' 
          ? { type, days: value || 7 }
          : type === 'last-weeks'
            ? { type, weeks: value || 1 }
            : { type, months: value || 1 },
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      geography: undefined,
      urgency: [],
      privacyLevel: [],
      detectionMethod: [],
      dateRange: { type: 'all' },
    });
  };

  return (
    <>
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 w-full pointer-events-none transition-transform duration-300 ${
          isCollapsed ? 'translate-y-[calc(100%-48px)]' : 'translate-y-0'
        }`}
      >
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-700 shadow-lg pointer-events-auto">
          {/* Header with toggle */}
          <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleCollapse}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                title={isCollapsed ? 'Expand library' : 'Collapse library'}
              >
                <svg 
                  className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <h3 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Abnormality Library ({filteredAbnormalities.length}{abnormalities.length !== filteredAbnormalities.length ? ` / ${abnormalities.length}` : ''})
              </h3>
              {activeFilterCount > 0 && (
                <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {showFilters && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && !isCollapsed && (
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Geography Filter */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Geography
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleGeographyChange('same-country')}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                        filters.geography?.type === 'same-country'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      Same Country
                    </button>
                    <button
                      onClick={() => handleGeographyChange('same-region')}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                        filters.geography?.type === 'same-region'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      Same Region
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleGeographyChange('within-distance', 1000)}
                        className={`flex-1 text-left text-xs px-2 py-1 rounded transition-colors ${
                          filters.geography?.type === 'within-distance' && filters.geography.distanceKm === 1000
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        &lt;1000km
                      </button>
                      <button
                        onClick={() => handleGeographyChange('within-distance', 5000)}
                        className={`flex-1 text-left text-xs px-2 py-1 rounded transition-colors ${
                          filters.geography?.type === 'within-distance' && filters.geography.distanceKm === 5000
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        &lt;5000km
                      </button>
                    </div>
                  </div>
                </div>

                {/* Urgency Filter */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Urgency
                  </label>
                  <div className="space-y-1.5">
                    {(['low', 'medium', 'high'] as const).map(urgency => (
                      <label key={urgency} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.urgency?.includes(urgency) || false}
                          onChange={() => handleToggleUrgency(urgency)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="capitalize">{urgency}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Privacy Level Filter */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Privacy Level
                  </label>
                  <div className="space-y-1.5">
                    {(['low', 'medium', 'high'] as const).map(privacy => (
                      <label key={privacy} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.privacyLevel?.includes(privacy) || false}
                          onChange={() => handleTogglePrivacy(privacy)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="capitalize">{privacy}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Detection Method Filter */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Detection Method
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {uniqueDetectionMethods.map(method => (
                      <label key={method} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.detectionMethod?.includes(method) || false}
                          onChange={() => handleToggleDetectionMethod(method)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Date Range
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleDateRangeChange('all')}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                        filters.dateRange?.type === 'all'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      All Time
                    </button>
                    <button
                      onClick={() => handleDateRangeChange('last-days', 7)}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                        filters.dateRange?.type === 'last-days' && filters.dateRange.days === 7
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => handleDateRangeChange('last-weeks', 2)}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                        filters.dateRange?.type === 'last-weeks' && filters.dateRange.weeks === 2
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      Last 2 Weeks
                    </button>
                    <button
                      onClick={() => handleDateRangeChange('last-months', 1)}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                        filters.dateRange?.type === 'last-months' && filters.dateRange.months === 1
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      Last Month
                    </button>
                  </div>
                </div>
              </div>
              
              {activeFilterCount > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Abnormality Cards */}
          {!isCollapsed && (
            <div className="px-4 py-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {filteredAbnormalities.length === 0 ? (
                  <div className="w-full text-center py-3 text-zinc-400 text-xs italic">
                    {abnormalities.length === 0 ? 'Library empty' : 'No abnormalities match the filters'}
                  </div>
                ) : (
                  filteredAbnormalities.map((abnormality) => (
                    <div key={abnormality.id} className="min-w-[280px] w-[280px] flex-shrink-0">
                      <DraggableCompactCard
                        id={abnormality.id}
                        bubble={abnormality}
                        onExpand={() => handleCardClick(abnormality.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded card modal/overlay */}
      {expandedCardId && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseExpanded}
        >
          <div 
            className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Abnormality Details
              </h2>
              <button
                onClick={handleCloseExpanded}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const expandedBubble = filteredAbnormalities.find(b => b.id === expandedCardId) || abnormalities.find(b => b.id === expandedCardId);
                return expandedBubble ? (
                  <AbnormalityBubbleCard 
                    bubble={expandedBubble} 
                    showFullDetails={true}
                    disableLink={true}
                  />
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

