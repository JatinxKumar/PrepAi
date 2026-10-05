const assert = require("assert");
const { generateEmbedding, generateEmbeddings } = require("./EmbeddingService");
const { cosineSimilarity, rankBySimilarity } = require("./VectorSimilarityService");

const run = async () => {
  console.log("=== Running EmbeddingService Isolated Tests ===");

  const relatedTextA = "React and Node.js backend development";
  const relatedTextB = "Building web applications using JavaScript and Express";
  const unrelatedText = "Accounting and financial auditing";

  const [embeddingA, embeddingB, embeddingC] = await generateEmbeddings([
    relatedTextA,
    relatedTextB,
    unrelatedText,
  ]);

  assert.ok(Array.isArray(embeddingA), "First embedding should be an array");
  assert.ok(Array.isArray(embeddingB), "Second embedding should be an array");
  assert.ok(Array.isArray(embeddingC), "Unrelated embedding should be an array");

  assert.ok(embeddingA.length > 0, "First embedding should be non-empty");
  assert.ok(embeddingB.length > 0, "Second embedding should be non-empty");
  assert.ok(embeddingC.length > 0, "Unrelated embedding should be non-empty");

  assert.ok(embeddingA.every((value) => typeof value === "number"), "First embedding should contain numbers");
  assert.ok(embeddingB.every((value) => typeof value === "number"), "Second embedding should contain numbers");
  assert.ok(embeddingC.every((value) => typeof value === "number"), "Unrelated embedding should contain numbers");

  assert.strictEqual(embeddingA.length, embeddingB.length, "Related embeddings should have matching dimensions");
  assert.strictEqual(embeddingA.length, embeddingC.length, "All embeddings should have matching dimensions");

  const emptyEmbedding = await generateEmbedding("");
  assert.deepStrictEqual(emptyEmbedding, [], "Empty text should return an empty vector");

  const relatedSimilarity = cosineSimilarity(embeddingA, embeddingB);
  const unrelatedSimilarity = cosineSimilarity(embeddingA, embeddingC);

  assert.ok(Number.isFinite(relatedSimilarity), "Related similarity should be a finite number");
  assert.ok(Number.isFinite(unrelatedSimilarity), "Unrelated similarity should be a finite number");
  assert.ok(
    relatedSimilarity > unrelatedSimilarity,
    "Semantically related sentences should rank higher than the unrelated sentence"
  );

  assert.strictEqual(cosineSimilarity([1, 2], [1]), 0, "Dimension mismatch should return 0");
  assert.strictEqual(cosineSimilarity([0, 0], [1, 1]), 0, "Zero vectors should return 0");

  const ranked = rankBySimilarity(embeddingA, [
    { id: "related", embedding: embeddingB },
    { id: "unrelated", embedding: embeddingC },
  ]);

  assert.strictEqual(ranked.length, 2, "Ranking should include both evidence vectors");
  assert.strictEqual(ranked[0].evidenceId, "related", "Related evidence should rank first");
  assert.ok(ranked[0].score >= ranked[1].score, "Ranking should sort descending by similarity");

  console.log(`Embedding dimension: ${embeddingA.length}`);
  console.log(`Related similarity greater than unrelated similarity: ${relatedSimilarity > unrelatedSimilarity}`);
  console.log("ALL EMBEDDING SERVICE TESTS PASSED SUCCESSFULLY");
};

run().catch((error) => {
  console.error("Embedding service test failed:", error.message);
  process.exit(1);
});
