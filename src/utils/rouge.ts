import { tokenize } from './tokenizer';

export function calculateROUGE(candidate: string, reference: string): number {
  const candidateTokens = tokenize(candidate);
  const referenceTokens = tokenize(reference);

  // Calculate ROUGE-L using Longest Common Subsequence
  const lcs = longestCommonSubsequence(candidateTokens, referenceTokens);
  
  // Calculate precision and recall
  const precision = lcs.length / candidateTokens.length;
  const recall = lcs.length / referenceTokens.length;

  // Calculate F1 score
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

function longestCommonSubsequence(tokens1: string[], tokens2: string[]): string[] {
  const dp: number[][] = Array(tokens1.length + 1)
    .fill(0)
    .map(() => Array(tokens2.length + 1).fill(0));

  // Fill the dp table
  for (let i = 1; i <= tokens1.length; i++) {
    for (let j = 1; j <= tokens2.length; j++) {
      if (tokens1[i - 1] === tokens2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Reconstruct the LCS
  const lcs: string[] = [];
  let i = tokens1.length;
  let j = tokens2.length;

  while (i > 0 && j > 0) {
    if (tokens1[i - 1] === tokens2[j - 1]) {
      lcs.unshift(tokens1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
} 