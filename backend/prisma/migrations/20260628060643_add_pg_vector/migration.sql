-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "DocumentChunk" ADD COLUMN     "embedding" vector(1536);

--Manual
CREATE INDEX chunk_embedding_idx ON "DocumentChunk" USING hnsw ("embedding" vector_cosine_ops);
