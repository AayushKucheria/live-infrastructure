/**
 * Formats a date string as a relative timeline string
 * @param dateString - ISO date string (YYYY-MM-DD) or legacy text format
 * @returns Formatted relative time string (e.g., "Detected today", "Detected 3 days ago")
 */
export function formatRelativeTimeline(dateString: string): string {
  // Handle backward compatibility: if it's not a date string, return as-is
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString || '';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

  const detectionDate = new Date(dateString + 'T00:00:00');
  detectionDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - detectionDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Detected today';
  } else if (diffDays === 1) {
    return 'Detected yesterday';
  } else if (diffDays < 7) {
    return `Detected ${diffDays} days ago`;
  } else if (diffDays < 14) {
    return `Detected 1 week ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Detected ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Detected ${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `Detected ${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

