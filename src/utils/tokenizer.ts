export function tokenize(text: string): string[] {
  // Simple tokenization by splitting on whitespace and punctuation
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0);
} 