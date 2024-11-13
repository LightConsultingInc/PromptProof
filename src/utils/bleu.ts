import { tokenize } from './tokenizer';

export function calculateBLEU(candidate: string, reference: string): number {
  const candidateTokens = tokenize(candidate);
  const referenceTokens = tokenize(reference);

  // Calculate n-gram precision for n=1 to 4
  const maxN = 4;
  let totalPrecision = 0;

  for (let n = 1; n <= maxN; n++) {
    const candidateNGrams = getNGrams(candidateTokens, n);
    const referenceNGrams = getNGrams(referenceTokens, n);

    const matches = candidateNGrams.filter(ngram => 
      referenceNGrams.includes(ngram)
    ).length;

    const precision = matches / candidateNGrams.length || 0;
    totalPrecision += precision;
  }

  // Calculate brevity penalty
  const brevityPenalty = Math.exp(
    Math.min(0, 1 - referenceTokens.length / candidateTokens.length)
  );

  // Final BLEU score
  return brevityPenalty * (totalPrecision / maxN);
}

function getNGrams(tokens: string[], n: number): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
} 