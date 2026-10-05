/**
 * EmbeddingService.js
 * 
 * Local Semantic Embedding Generator using @xenova/transformers
 * Model: Xenova/all-MiniLM-L6-v2 (384 dimensions)
 * 
 * Features:
 * - Lazy model loading (caches pipeline across requests)
 * - Mean pooling & vector normalization for cosine similarity
 * - Zero external API calls / Zero paid dependencies
 * - Privacy-focused (No PII or text logging)
 */

let featureExtractor = null;
let loadingPromise = null;

/**
 * Lazily loads and initializes the ONNX feature extraction pipeline for all-MiniLM-L6-v2.
 */
const getExtractor = async () => {
  if (featureExtractor) {
    return featureExtractor;
  }

  if (!loadingPromise) {
    loadingPromise = (async () => {
      // Dynamic import to support ESM package in CommonJS environment
      const { pipeline } = await import("@xenova/transformers");
      console.log("[EmbeddingService] Initializing local embedding model: Xenova/all-MiniLM-L6-v2...");
      featureExtractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
      console.log("[EmbeddingService] Local embedding model loaded successfully.");
      return featureExtractor;
    })();
  }

  return loadingPromise;
};

/**
 * Generates a normalized 384-dimensional numeric embedding vector for a single text input.
 * 
 * @param {string} text - Raw input text string.
 * @returns {Promise<Array<number>>} Array of floating point numbers representing embedding vector.
 */
const generateEmbedding = async (text) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    return [];
  }

  try {
    const extractor = await getExtractor();
    const output = await extractor(text.trim(), { pooling: "mean", normalize: true });
    
    if (output && output.data) {
      return Array.from(output.data);
    }
    return [];
  } catch (error) {
    console.error("[EmbeddingService] Error generating embedding:", error.message);
    return [];
  }
};

/**
 * Generates normalized numeric embedding vectors for an array of text inputs.
 * 
 * @param {Array<string>} texts - List of input text strings.
 * @returns {Promise<Array<Array<number>>>} Array of embedding vectors.
 */
const generateEmbeddings = async (texts) => {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const results = [];
  for (const text of texts) {
    const vector = await generateEmbedding(text);
    results.push(vector);
  }

  return results;
};

module.exports = {
  generateEmbedding,
  generateEmbeddings,
  getExtractor,
};
