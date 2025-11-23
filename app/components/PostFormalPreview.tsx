'use client';

import { getLabById } from '../lib/mockData';
import { ThreatBubbleFormData } from '../lab/[labId]/create-threat/page';

interface PostFormalPreviewProps {
  formData: ThreatBubbleFormData;
  labId: string;
}

export default function PostFormalPreview({ formData, labId }: PostFormalPreviewProps) {
  const lab = getLabById(labId);

  // Apply privacy filtering logic (matching ThreatBubbleCard)
  const canShowDetails = formData.privacyLevel === 'low';
  const canShowMediumDetails = formData.privacyLevel !== 'high';

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

  // Determine displayed location
  const displayedLocation = canShowMediumDetails && formData.specificLocation 
    ? formData.specificLocation 
    : formData.location;

  // Parse genetic markers if provided
  const geneticMarkersArray = formData.geneticMarkers
    ? formData.geneticMarkers.split(',').map(m => m.trim()).filter(m => m)
    : [];

  // Check if form has any content
  const hasContent = formData.description || formData.location || formData.detectionMethod;

  if (!hasContent) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600">
        <div className="text-center">
          <p className="text-sm">Preview will appear here</p>
          <p className="text-xs mt-2">Start filling out the form to see how your threat bubble will appear to recipients</p>
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
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${urgencyColors[formData.urgency]}`}>
            {formData.urgency.toUpperCase()}
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          This is how recipients will see your threat bubble
        </p>
      </div>

      {/* Document-style preview */}
      <div className="space-y-6">
        {/* Header section */}
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                {lab?.name || 'Unknown Lab'}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {lab?.location} • {formData.detectionMethod || 'Detection method not specified'}
              </p>
            </div>
            <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-zinc-600 dark:text-zinc-400">
              {privacyLabels[formData.privacyLevel]}
            </span>
          </div>
        </div>

        {/* Description */}
        {formData.description && (
          <div>
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">
              Summary
            </h4>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {formData.description}
            </p>
          </div>
        )}

        {/* Key Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wide">
            Key Information
          </h4>
          
          {formData.location && (
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-[100px]">
                Location:
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                {displayedLocation}
              </span>
            </div>
          )}

          {formData.timeline && (
            <div className="flex items-start gap-3">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-[100px]">
                Timeline:
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                {formData.timeline}
              </span>
            </div>
          )}
        </div>

        {/* Detailed Findings (medium/low privacy) */}
        {canShowMediumDetails && formData.detailedFindings && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wide">
              Detailed Findings
            </h4>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {formData.detailedFindings}
              </p>
            </div>
          </div>
        )}

        {/* Technical Details (low privacy only) */}
        {canShowDetails && (formData.sampleCount || geneticMarkersArray.length > 0) && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 uppercase tracking-wide">
              Technical Details
            </h4>
            <div className="space-y-2">
              {formData.sampleCount && (
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-[120px]">
                    Sample Count:
                  </span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                    {formData.sampleCount}
                  </span>
                </div>
              )}
              {geneticMarkersArray.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 min-w-[120px]">
                    Genetic Markers:
                  </span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">
                    {geneticMarkersArray.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Privacy metadata indicator */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 mt-6">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
            <p className="font-medium">Privacy Level: {privacyLabels[formData.privacyLevel]}</p>
            {formData.privacyLevel === 'high' && (
              <p>Only essential information is visible to recipients</p>
            )}
            {formData.privacyLevel === 'medium' && (
              <p>Anonymized details and findings are included</p>
            )}
            {formData.privacyLevel === 'low' && (
              <p>Full technical details are shared with recipients</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

