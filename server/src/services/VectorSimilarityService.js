/**
 * VectorSimilarityService.js
 * 
 * Deterministic Vector Mathematics & Cosine Similarity Service
 * Handles vector dimension validation, dot products, norm calculations, and ranking.
 * 
 * NO LLM Calls / Zero API dependencies.
 */

/**
 * Calculates the cosine similarity between two numeric vectors.
 * 
 * @param {Array<number>} vectorA - First numeric vector.
 * @param {Array<number>} vectorB - Second numeric vector.
 * @returns {number} Cosine similarity score (float between -1.0 and 1.0, or 0 if invalid).
 */
const cosineSimilarity = (vectorA, vectorB) => {
  if (
    !Array.isArray(vectorA) ||
    !Array.isArray(vectorB) ||
    vectorA.length === 0 ||
    vectorB.length === 0 ||
    vectorA.length !== vectorB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    const valA = Number(vectorA[i]) || 0;
    const valB = Number(vectorB[i]) || 0;

    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  
  // Clamp potential precision overflow bounds (-1.0 to 1.0)
  return Math.max(-1.0, Math.min(1.0, similarity));
};

/**
 * Ranks candidate evidence vectors by cosine similarity relative to a target query vector.
 * 
 * @param {Array<number>} queryVector - The target query vector.
 * @param {Array<object|Array<number>>} evidenceItems - List of evidence objects or raw vector arrays.
 * @param {number} [topK=10] - Maximum number of top matches to return.
 * @returns {Array<object>} Ranked evidence items with similarity score and original ID/index.
 */
const rankBySimilarity = (queryVector, evidenceItems, topK = 10) => {
  if (
    !Array.isArray(queryVector) ||
    queryVector.length === 0 ||
    !Array.isArray(evidenceItems) ||
    evidenceItems.length === 0
  ) {
    return [];
  }

  const scoredResults = evidenceItems
    .map((item, index) => {
      const isRawVector = Array.isArray(item);
      const vector = isRawVector ? item : item.embedding || item.vector || item.vectorData;
      const score = cosineSimilarity(queryVector, vector);
      return {
        evidence: item,
        evidenceId: !isRawVector && item.id ? item.id : index,
        index,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  if (topK && typeof topK === "number" && topK > 0) {
    return scoredResults.slice(0, topK);
  }

  return scoredResults;
};

module.exports = {
  cosineSimilarity,
  rankBySimilarity,
};
