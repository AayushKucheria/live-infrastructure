'use client';

import { useRouter } from 'next/navigation';
import { saveAbnormalityBubble } from '../lib/storage';
import { StoredAbnormalityBubble } from '../lib/storage';

// Legacy interface - kept for backward compatibility
// This component is replaced by FreeFormAbnormalityInput + PostFormalArtifactEditor
interface AbnormalityBubbleFormData {
  description: string;
  location: string;
  detectionMethod: string;
  timeline: string;
  urgency: 'low' | 'medium' | 'high';
  privacyLevel: 'high' | 'medium' | 'low';
  detailedFindings: string;
  specificLocation: string;
  sampleCount: string;
  geneticMarkers: string;
}

interface AbnormalityBubbleFormProps {
  labId: string;
  formData: AbnormalityBubbleFormData;
  onFormDataChange: (data: AbnormalityBubbleFormData) => void;
  onSuccess?: () => void;
}

export default function AbnormalityBubbleForm({ labId, formData, onFormDataChange, onSuccess }: AbnormalityBubbleFormProps) {
  const router = useRouter();

  const handleFieldChange = (field: keyof AbnormalityBubbleFormData, value: string | 'low' | 'medium' | 'high') => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bubble: StoredAbnormalityBubble = {
      id: `abnormality-${Date.now()}`,
      labId,
      description: formData.description,
      location: formData.location,
      detectionMethod: formData.detectionMethod,
      timeline: formData.timeline,
      urgency: formData.urgency,
      privacyLevel: formData.privacyLevel,
      createdAt: new Date().toISOString(),
      ...(formData.detailedFindings && { detailedFindings: formData.detailedFindings }),
      ...(formData.specificLocation && { specificLocation: formData.specificLocation }),
      ...(formData.sampleCount && { sampleCount: parseInt(formData.sampleCount) }),
      ...(formData.geneticMarkers && { 
        geneticMarkers: formData.geneticMarkers.split(',').map(m => m.trim()).filter(m => m) 
      })
    };

    saveAbnormalityBubble(bubble);
    
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(`/abnormality/${bubble.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Description / Summary *
        </label>
        <textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the abnormality or situation..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Location / Region *
          </label>
          <input
            type="text"
            id="location"
            required
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Mumbai, India"
          />
        </div>

        <div>
          <label htmlFor="detectionMethod" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Detection Method *
          </label>
          <select
            id="detectionMethod"
            required
            value={formData.detectionMethod}
            onChange={(e) => handleFieldChange('detectionMethod', e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select method...</option>
            <option value="Wastewater monitoring">Wastewater monitoring</option>
            <option value="Genomic sequencing">Genomic sequencing</option>
            <option value="Clinical surveillance">Clinical surveillance</option>
            <option value="Airport screening">Airport screening</option>
            <option value="Modeling/forecasting">Modeling/forecasting</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="timeline" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Detection Date *
        </label>
        <input
          type="date"
          id="timeline"
          required
          value={formData.timeline}
          onChange={(e) => handleFieldChange('timeline', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Select the date when the abnormality was detected
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Urgency Level *
          </label>
          <select
            id="urgency"
            required
            value={formData.urgency}
            onChange={(e) => handleFieldChange('urgency', e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="privacyLevel" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Privacy Level *
          </label>
          <select
            id="privacyLevel"
            required
            value={formData.privacyLevel}
            onChange={(e) => handleFieldChange('privacyLevel', e.target.value as 'high' | 'medium' | 'low')}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="high">High (bare minimum)</option>
            <option value="medium">Medium (anonymized details)</option>
            <option value="low">Low (full details)</option>
          </select>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {formData.privacyLevel === 'high' && 'Only essential information will be shared'}
            {formData.privacyLevel === 'medium' && 'Anonymized details will be included'}
            {formData.privacyLevel === 'low' && 'Full details will be shared'}
          </p>
        </div>
      </div>

      {/* Additional fields that appear based on privacy level */}
      {formData.privacyLevel !== 'high' && (
        <>
          <div>
            <label htmlFor="specificLocation" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Specific Location (optional)
            </label>
            <input
              type="text"
              id="specificLocation"
              value={formData.specificLocation}
              onChange={(e) => handleFieldChange('specificLocation', e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Specific hospital or facility"
            />
          </div>

          <div>
            <label htmlFor="detailedFindings" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Detailed Findings (optional)
            </label>
            <textarea
              id="detailedFindings"
              value={formData.detailedFindings}
              onChange={(e) => handleFieldChange('detailedFindings', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional technical details, observations, etc."
            />
          </div>
        </>
      )}

      {formData.privacyLevel === 'low' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sampleCount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Sample Count (optional)
              </label>
              <input
                type="number"
                id="sampleCount"
                value={formData.sampleCount}
                onChange={(e) => handleFieldChange('sampleCount', e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Number of samples"
              />
            </div>

            <div>
              <label htmlFor="geneticMarkers" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Genetic Markers (optional)
              </label>
              <input
                type="text"
                id="geneticMarkers"
                value={formData.geneticMarkers}
                onChange={(e) => handleFieldChange('geneticMarkers', e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Comma-separated, e.g., MUT-2024-001, MUT-2024-002"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Abnormality Bubble
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

