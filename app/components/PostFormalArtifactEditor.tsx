'use client';

import { useState } from 'react';
import { getLabById } from '../lib/mockData';
import ClarificationAnnotation, { Clarification } from './ClarificationAnnotation';

interface StructuredAbnormalityData {
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

interface PostFormalArtifactEditorProps {
  structuredData: StructuredAbnormalityData;
  labId: string;
  privacyLevel: 'high' | 'medium' | 'low';
  onDataChange: (data: StructuredAbnormalityData) => void;
  clarifications: Clarification[];
  onClarificationAdd: (section: string, content: string) => void;
  onClarificationRemove: (id: string) => void;
}

export default function PostFormalArtifactEditor({
  structuredData,
  labId,
  privacyLevel,
  onDataChange,
  clarifications,
  onClarificationAdd,
  onClarificationRemove
}: PostFormalArtifactEditorProps) {
  const lab = getLabById(labId);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const urgencyColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };

  const privacyLabels = {
    high: 'High Privacy',
    medium: 'Medium Privacy',
    low: 'Low Privacy'
  };

  const canShowDetails = privacyLevel === 'low';
  const canShowMediumDetails = privacyLevel !== 'high';

  const displayedLocation = canShowMediumDetails && structuredData.specificLocation
    ? structuredData.specificLocation
    : structuredData.location;

  const handleEdit = (section: string, currentValue: string) => {
    setEditingSection(section);
    setEditValue(currentValue);
  };

  const handleSave = (section: string) => {
    const updated = { ...structuredData };
    switch (section) {
      case 'description':
        updated.description = editValue;
        break;
      case 'location':
        updated.location = editValue;
        break;
      case 'timeline':
        updated.timeline = editValue;
        break;
      case 'detectionMethod':
        updated.detectionMethod = editValue;
        break;
      case 'detailedFindings':
        updated.detailedFindings = editValue;
        break;
      case 'specificLocation':
        updated.specificLocation = editValue;
        break;
      case 'sampleCount':
        updated.sampleCount = parseInt(editValue) || undefined;
        break;
      case 'geneticMarkers':
        updated.geneticMarkers = editValue.split(',').map(m => m.trim()).filter(m => m);
        break;
    }
    onDataChange(updated);
    setEditingSection(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditValue('');
  };

  const renderEditableField = (
    section: string,
    label: string,
    value: string | number | string[] | undefined,
    multiline = false
  ) => {
    const displayValue = Array.isArray(value) ? value.join(', ') : (value?.toString() || '');
    const isEditing = editingSection === section;

    if (isEditing) {
      return (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={4}
              className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => handleSave(section)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative">
        <div
          className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded px-1 -mx-1 transition-colors"
          onClick={() => handleEdit(section, displayValue)}
        >
          {displayValue || <span className="text-zinc-400 dark:text-zinc-600 italic">Click to edit</span>}
        </div>
        <ClarificationAnnotation
          section={section}
          clarifications={clarifications}
          onAdd={onClarificationAdd}
          onRemove={onClarificationRemove}
        />
      </div>
    );
  };

  const hasContent = structuredData.description || structuredData.location || structuredData.detectionMethod;

  if (!hasContent) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
        <div className="text-center">
          <p className="text-sm">Preview will appear here</p>
          <p className="text-xs mt-2">Start typing to see how your abnormality bubble will appear to recipients</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <div className="mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Preview: Post-Formal Artifact
          </h2>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${urgencyColors[structuredData.urgency]}`}>
            {structuredData.urgency.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Click any section to edit • This is how recipients will see your abnormality bubble
        </p>
      </div>

      <div className="space-y-6">
        {/* Header section */}
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                {lab?.name || 'Unknown Lab'}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {lab?.location} • {renderEditableField('detectionMethod', 'Detection Method', structuredData.detectionMethod)}
              </p>
            </div>
            <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400">
              {privacyLabels[privacyLevel]}
            </span>
          </div>
        </div>

        {/* Description */}
        {structuredData.description && (
          <div>
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">
              Summary
            </h4>
            {renderEditableField('description', 'Description', structuredData.description, true)}
          </div>
        )}

        {/* Key Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wide">
            Key Information
          </h4>

          {structuredData.location && (
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-[100px]">
                Location:
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                {renderEditableField('location', 'Location', displayedLocation)}
              </span>
            </div>
          )}

          {structuredData.timeline && (
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-[100px]">
                Timeline:
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                {renderEditableField('timeline', 'Timeline', structuredData.timeline)}
              </span>
            </div>
          )}
        </div>

        {/* Detailed Findings */}
        {canShowMediumDetails && structuredData.detailedFindings && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wide">
              Detailed Findings
            </h4>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border-l-4 border-blue-500">
              {renderEditableField('detailedFindings', 'Detailed Findings', structuredData.detailedFindings, true)}
            </div>
          </div>
        )}

        {/* Technical Details */}
        {canShowDetails && (structuredData.sampleCount || structuredData.geneticMarkers?.length) && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wide">
              Technical Details
            </h4>
            <div className="space-y-2">
              {structuredData.sampleCount && (
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-[120px]">
                    Sample Count:
                  </span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                    {renderEditableField('sampleCount', 'Sample Count', structuredData.sampleCount)}
                  </span>
                </div>
              )}
              {structuredData.geneticMarkers && structuredData.geneticMarkers.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-[120px]">
                    Genetic Markers:
                  </span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                    {renderEditableField('geneticMarkers', 'Genetic Markers', structuredData.geneticMarkers)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy metadata */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 mt-6">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
            <p className="font-medium">Privacy Level: {privacyLabels[privacyLevel]}</p>
            {privacyLevel === 'high' && (
              <p>Only essential information is visible to recipients</p>
            )}
            {privacyLevel === 'medium' && (
              <p>Anonymized details and findings are included</p>
            )}
            {privacyLevel === 'low' && (
              <p>Full technical details are shared with recipients</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

