/**
 * Split text into chunks of specified size with overlap
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): string[] {
  if (!text || text.trim().length === 0) return [];
  
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    // Calculate end index for this chunk
    let endIndex = Math.min(startIndex + chunkSize, text.length);
    
    // Adjust end index to the nearest sentence end if possible
    if (endIndex < text.length) {
      const possibleEndPoints = ['.', '!', '?', '\n\n'];
      
      // Look for sentence endings within a reasonable range after the initial end point
      const searchEndIndex = Math.min(endIndex + 100, text.length);
      let bestEndIndex = endIndex;
      
      for (const endChar of possibleEndPoints) {
        const nextEnd = text.indexOf(endChar, endIndex);
        if (nextEnd !== -1 && nextEnd < searchEndIndex) {
          bestEndIndex = nextEnd + 1; // Include the sentence-ending character
          break;
        }
      }
      
      endIndex = bestEndIndex;
    }
    
    // Ensure endIndex is valid
    if (endIndex <= startIndex || endIndex > text.length) {
      endIndex = Math.min(startIndex + chunkSize, text.length);
    }
    
    // Add this chunk to the result
    chunks.push(text.substring(startIndex, endIndex).trim());
    
    // Move start index for the next chunk, with overlap
    startIndex = endIndex - chunkOverlap;
    
    // Ensure we make progress and avoid infinite loops
    if (startIndex <= 0 || startIndex >= text.length - 10 || endIndex === text.length) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Extract most relevant chunks based on query
 * This is a simple implementation - in a real app, use embeddings and vector similarity
 */
export function findRelevantChunks(chunks: string[], query: string, maxChunks: number = 3): string[] {
  if (!chunks || chunks.length === 0 || !query) return [];
  
  // Split query into words, including Vietnamese words
  // Remove diacritics for better matching with Vietnamese text
  const normalizedQuery = removeDiacritics(query.toLowerCase());
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length >= 2);
  
  if (queryWords.length === 0) {
    return chunks.slice(0, maxChunks);
  }
  
  // Score each chunk based on query word occurrences with improved Vietnamese matching
  const scoredChunks = chunks.map((chunk, index) => {
    const normalizedChunk = removeDiacritics(chunk.toLowerCase());
    let score = 0;
    
    queryWords.forEach(word => {
      try {
        const regex = new RegExp(`\\b${escapeRegExp(word)}\\b|${escapeRegExp(word)}`, 'g');
        const matches = normalizedChunk.match(regex);
        
      if (matches) {
          // Weight matches by word length (longer words are more significant)
          score += matches.length * (word.length / 3);
        }
      } catch (e) {
        // Handle regex errors gracefully
        console.warn(`Regex error for word "${word}"`, e);
      }
    });
    
    // Small boost for shorter chunks (usually more focused content)
    if (chunk.length < 500) score += 0.5;
    
    return { chunk, score, index };
  });
  
  // Sort by score (highest first) and take top chunks
  const results = scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks);
  
  return results.map(item => item.chunk);
}

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper function to remove Vietnamese diacritics for more flexible matching
function removeDiacritics(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd').replace(/Đ/g, 'D'); // Handle Vietnamese đ/Đ
} 