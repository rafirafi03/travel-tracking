export function extractTimestamp(input: any): number {
  if (input === null || input === undefined) {
    return 0;
  }
  
  try {
    // If it's already a number, use it directly
    if (typeof input === 'number') {
      return input;
    }
    
    // If it has a getTime method (Date object), use that
    if (typeof input.getTime === 'function') {
      return input.getTime();
    }
    
    // If it's a string, parse it
    if (typeof input === 'string') {
      return new Date(input).getTime();
    }
    
    // If it looks like a MongoDB Date object (check safely)
    if (input && typeof input === 'object') {
      // Handle potential MongoDB date format
      if ('$date' in input) {
        return new Date(input.$date).getTime();
      }
    }
    
    // Last resort: try direct conversion
    return new Date(input).getTime();
  } catch (e) {
    console.error('Error extracting timestamp from:', input);
    return 0;
  }
}

// Format milliseconds into human-readable duration
export function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));
  return `${hours}h ${minutes}m ${seconds}s`;
}