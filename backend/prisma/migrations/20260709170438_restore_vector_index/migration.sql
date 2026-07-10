-- CreateIndex
CREATE INDEX "chunk_embedding_idx" ON "DocumentChunk" 
USING hnsw (embedding vector_cosine_ops);