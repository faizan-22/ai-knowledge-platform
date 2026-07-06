# AI Knowledge Platform

AI Knowledge Platform is a full-stack RAG application for uploading PDF documents, indexing their content with OpenAI embeddings, and asking document-grounded questions with source citations from retrieved chunks.

The project combines a Next.js dashboard and chat experience with a NestJS API, PostgreSQL, Prisma, and pgvector-backed semantic search.

## Screenshots / Demo Preview

### Demo
https://ai-knowledge-platform-ruby.vercel.app/

### Login

![Login screen](docs/screenshots/login.png)

### Signup

![Signup screen](docs/screenshots/signup.png)

### Dashboard

![Dashboard screen](docs/screenshots/dashboard.png)

### Upload PDF Dialog

![Upload PDF dialog](docs/screenshots/upload-dialog.png)

### Document Chat

![Document chat screen](docs/screenshots/chat.png)

### Swagger Docs

![Swagger API docs](docs/screenshots/swagger.png)

## Features

- User signup and login with JWT-protected backend routes
- PDF upload with title, file validation, and per-user document ownership
- Document status lifecycle: `UPLOADED`, `PROCESSING`, `READY`, and `FAILED`
- Automatic PDF text extraction and page-aware chunking
- OpenAI embedding generation for every document chunk
- pgvector similarity search for retrieving the most relevant chunks
- One-document chat flow using `POST /chat/:documentId`
- Context-aware answer generation with page/chunk citations
- Dashboard for listing, renaming, deleting, uploading, and opening documents in chat
- Swagger API documentation in development mode

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn-style components, lucide-react, Sonner |
| State/Data Flow | Zustand, Axios, controller/service structure |
| Backend | NestJS 11, TypeScript |
| Database | PostgreSQL with pgvector, Prisma ORM |
| AI | OpenAI `text-embedding-3-small`, OpenAI chat completions |
| PDF Processing | `pdf-parse-new` |
| Auth | JWT, bcrypt |
| API Docs | Swagger via `@nestjs/swagger` |

## Why This Project

This project was built to understand and implement a RAG system from scratch without relying on LangChain or LlamaIndex. The goal was to learn the complete flow: document ingestion, chunking, embeddings, vector search, grounded answer generation, and citation mapping.

## Architecture Overview

```text
frontend/
  app/                 Next.js App Router pages
  components/          Dashboard, chat, auth, sidebar, and UI components
  controllers/         UI-facing orchestration layer
  services/            Axios API calls
  stores/              Zustand stores for user/session and documents
  constants/           Routes, API endpoints, app constants

backend/
  src/auth/            Signup, login, JWT guard
  src/documents/       PDF upload and document CRUD
  src/document-processing/
                       PDF parsing, text chunking, embedding persistence
  src/retrieval/       Query embedding and pgvector similarity search
  src/chat/            RAG answer generation and citation mapping
  src/open-ai/         OpenAI embeddings and answer generation
  src/database/        Prisma service
  prisma/schema.prisma User, Document, and DocumentChunk models
```

High-level request flow:

```text
Browser UI
  -> Next.js component
  -> controller
  -> service
  -> Axios client
  -> NestJS API
  -> Prisma/PostgreSQL + OpenAI
```

## RAG Pipeline

This is the core of the application. A PDF becomes a searchable knowledge source through a retrieval-augmented generation pipeline.

```text
PDF Upload
  |
  v
File Validation and Storage
  |
  v
Document Status: PROCESSING
  |
  v
PDF Text Extraction
  |
  v
Page-Aware Text Chunking
  |
  v
Chunking with Overlap
  |
  v
OpenAI Embeddings
  |
  v
Vector Storage in PostgreSQL pgvector
  |
  v
Document Status: READY
  |
  v
User Question
  |
  v
Question Embedding
  |
  v
pgvector Similarity Search
  |
  v
Top-K Relevant Chunks
  |
  v
Context-Aware Answer Generation
  |
  v
Citations from Retrieved Chunks
```

### 1. PDF Upload

Users upload a PDF through the frontend dashboard. The backend accepts multipart form data at `POST /documents` with:

- `file`: PDF file, max 5 MB
- `title`: display title for the uploaded document

The file is saved to the backend `uploads/` directory and a `Document` record is created for the authenticated user.

### 2. Text Extraction

`PdfParserService` reads the uploaded PDF and extracts text page by page using `pdf-parse-new`. Each extracted page is stored as:

```ts
{
  page: number;
  text: string;
}
```

Keeping page numbers attached to extracted text allows the final answer to cite where the retrieved context came from.

### 3. Chunking with Overlap

`TextChunkerService` splits each page into overlapping text chunks:

- Chunk size: `900` characters
- Overlap: `200` characters
- Step size: `700` characters

Overlap helps preserve context across chunk boundaries, which improves retrieval quality when an answer depends on text near the edge of a chunk.

### 4. Embedding Generation

Every chunk is sent to OpenAI using the `text-embedding-3-small` embedding model. The returned 1536-dimensional vector is stored with the chunk.

```text
DocumentChunk
  content
  chunkIndex
  pageNumber
  documentId
  embedding vector(1536)
```

### 5. pgvector Similarity Search

When a user asks a question, the backend embeds the query and compares it against stored chunk embeddings with pgvector distance search:

```sql
ORDER BY "embedding" <=> query_embedding
LIMIT topK
```

The chat flow uses `TOP_K` from the environment, falling back to `3` when the value is missing or invalid.

### 6. Context-Aware Answer Generation

The retrieved chunks are formatted into a source-labeled context block:

```text
[Source 1 - Page 2]
...

[Source 2 - Page 5]
...
```

The answer model is instructed to use only the provided document context. If the answer is not stated or directly implied by the context, it should respond that the information could not be found in the document.

### 7. Citations from Retrieved Chunks

The generated answer includes source markers such as `[1]` and `[2]`. The backend maps those source numbers back to the retrieved chunks and returns citation metadata:

```json
{
  "answer": "The answer with source markers [1].",
  "sources": [
    {
      "id": 1,
      "chunkIndex": 0,
      "pageNumber": 2
    }
  ]
}
```

## How to Run Locally

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database with the `vector` extension enabled
- OpenAI API key

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd ai-knowledge-platform

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure backend environment

Create `backend/.env`:

```env
SECRET="replace-with-a-jwt-secret"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
OPENAI_API_KEY="replace-with-openai-api-key"
NODE_ENV="dev"
TOP_K=3
PORT=4000
```

### 3. Configure frontend environment

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 4. Prepare the database

From `backend/`:

```bash
npx prisma generate
npx prisma migrate dev
```

Make sure the PostgreSQL database supports pgvector. The Prisma schema uses:

```prisma
extensions = [vector]
```

### 5. Start the backend

From `backend/`:

```bash
npm run start:dev
```

Backend runs on `http://localhost:4000` when `PORT=4000`.

Swagger docs are available in development mode at:

```text
http://localhost:4000/docs
```

### 6. Start the frontend

From `frontend/`:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `SECRET` | Yes | JWT signing secret used by the auth flow |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | API key used for embeddings and answer generation |
| `NODE_ENV` | Yes | Use `dev` to enable Swagger and module graph logging |
| `TOP_K` | No | Number of chunks retrieved for chat answers; defaults to `3` |
| `PORT` | No | Backend port; defaults to Nest's fallback when unset |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for the NestJS API |

## API Overview

Most application routes return data through the backend's global transform interceptor. Protected routes require a bearer token.

### Global Response Shape

Successful API responses are wrapped by the transform interceptor:

```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "timeStamp": "7/5/2026, 6:30:00 PM",
  "path": "/documents"
}
```

Error responses follow the global exception filter shape:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid file type",
  "path": "/documents",
  "timestamp": "..."
}
```

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create a new user |
| `POST` | `/auth/login` | Login and receive auth data/token |
| `POST` | `/auth/swagger-login` | Swagger OAuth helper route, hidden from normal docs |

### Documents

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/documents` | Upload and process a PDF |
| `GET` | `/documents` | List current user's documents |
| `GET` | `/documents/:id` | Get one document |
| `GET` | `/documents/:id/chunks` | Get chunks for a document |
| `PATCH` | `/documents/title/:id` | Rename a document |
| `DELETE` | `/documents/:id` | Delete a document |

### Chat

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/chat/:documentId` | Ask a question against one ready document |

Request body:

```json
{
  "query": "What does this document say about the refund policy?"
}
```

Response shape:

```json
{
  "answer": "The document says ... [1]",
  "sources": [
    {
      "id": 1,
      "chunkIndex": 4,
      "pageNumber": 2
    }
  ]
}
```

## Future Improvements

- Background job queue for document processing instead of synchronous upload processing
- Chat history and multi-turn conversations
- Multi-document search and cross-document answers
- Streaming chat responses
- Better citation UI with source previews and highlighted chunks
- Upload progress, retry handling, and richer failed-processing messages
- Admin observability for processing time, retrieval distance, and token usage
- Automated tests for the full upload-to-chat RAG workflow
- Docker Compose setup for local PostgreSQL with pgvector
