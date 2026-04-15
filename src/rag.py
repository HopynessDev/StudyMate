"""
RAG (Retrieval-Augmented Generation) Engine for StudyMate
Handles document ingestion, chunking, embedding, and semantic retrieval
"""

import os
import re
from typing import List, Dict, Tuple, Optional
import numpy as np
from sentence_transformers import SentenceTransformer


class RAGEngine:
    """
    Manages document storage, embeddings, and retrieval for study notes
    """

    def __init__(self, docs_path: Optional[str] = None):
        """
        Initialize the RAG engine

        Args:
            docs_path: Optional path to a document or directory to ingest on startup
        """
        self.chunks: List[Dict[str, any]] = []  # Each chunk: {"text": str, "source": str, "chunk_index": int}
        self.embeddings: Optional[np.ndarray] = None

        # Load sentence transformer model (runs locally, no API key needed)
        print("Loading embedding model (this may take a moment on first run)...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Embedding model loaded successfully.")

        # Ingest documents if path provided
        if docs_path:
            self.ingest(docs_path)

    def ingest(self, docs_path: str) -> None:
        """
        Ingest documents from a file or directory

        Args:
            docs_path: Path to a .txt/.pdf file or directory containing such files
        """
        files_to_process = []

        # Check if path is a directory or file
        if os.path.isdir(docs_path):
            # Find all .txt and .pdf files recursively
            for root, dirs, files in os.walk(docs_path):
                for filename in files:
                    if filename.lower().endswith(('.txt', '.pdf')):
                        files_to_process.append(os.path.join(root, filename))
        elif os.path.isfile(docs_path):
            if docs_path.lower().endswith(('.txt', '.pdf')):
                files_to_process.append(docs_path)
            else:
                print(f"Warning: File '{docs_path}' is not a .txt or .pdf file. Skipping.")
                return
        else:
            print(f"Warning: Path '{docs_path}' does not exist. No documents ingested.")
            return

        if not files_to_process:
            print("No .txt or .pdf files found in the specified path.")
            return

        # Process each file
        for filepath in files_to_process:
            try:
                # Extract text based on file type
                if filepath.lower().endswith('.txt'):
                    text = self._read_txt_file(filepath)
                elif filepath.lower().endswith('.pdf'):
                    text = self._read_pdf_file(filepath)
                else:
                    continue

                if text.strip():
                    # Chunk the text
                    new_chunks = self._chunk_text(text, os.path.basename(filepath))
                    self.chunks.extend(new_chunks)
                    print(f"  Ingested {len(new_chunks)} chunks from {os.path.basename(filepath)}")

            except Exception as e:
                print(f"  Warning: Could not process '{os.path.basename(filepath)}': {e}")

        # Build the search index after all files are processed
        if self.chunks:
            self._build_index()
            print(f"Ingested {len(self.chunks)} chunks from {len(files_to_process)} document(s).")

    def _read_txt_file(self, filepath: str) -> str:
        """
        Read text content from a .txt file

        Args:
            filepath: Path to the .txt file

        Returns:
            The text content of the file
        """
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()

    def _read_pdf_file(self, filepath: str) -> str:
        """
        Read text content from a PDF file using PyPDF2

        Args:
            filepath: Path to the PDF file

        Returns:
            The extracted text content
        """
        import PyPDF2

        text = []
        with open(filepath, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            for page in pdf_reader.pages:
                text.append(page.extract_text())

        return '\n'.join(text)

    def _chunk_text(self, text: str, source: str) -> List[Dict[str, any]]:
        """
        Split text into chunks for embedding and retrieval

        Chunks are approximately 300-500 words. The text is first split by
        paragraphs, then small paragraphs are merged together until they reach
        the target size. Large paragraphs are split at sentence boundaries.

        Args:
            text: The text to chunk
            source: The source filename for citation

        Returns:
            List of chunk dictionaries
        """
        chunks = []

        # Split by paragraphs (double newlines)
        paragraphs = re.split(r'\n\s*\n', text.strip())

        current_chunk = ""
        current_word_count = 0
        chunk_index = 0

        def count_words(s: str) -> int:
            """Count words in a string"""
            return len(s.split())

        def finalize_chunk() -> None:
            """Add current chunk to the list if not empty"""
            nonlocal current_chunk, current_word_count, chunk_index
            if current_chunk.strip():
                chunks.append({
                    "text": current_chunk.strip(),
                    "source": source,
                    "chunk_index": chunk_index
                })
                chunk_index += 1
            current_chunk = ""
            current_word_count = 0

        # Target chunk size: 300-500 words
        TARGET_MIN_WORDS = 300
        TARGET_MAX_WORDS = 500

        for paragraph in paragraphs:
            paragraph = paragraph.strip()
            if not paragraph:
                continue

            para_word_count = count_words(paragraph)

            # If paragraph alone is too large, split at sentence boundaries
            if para_word_count > TARGET_MAX_WORDS:
                # First, save any existing chunk
                if current_chunk:
                    finalize_chunk()

                # Split large paragraph into sentences
                sentences = re.split(r'(?<=[.!?])\s+', paragraph)
                for sentence in sentences:
                    sentence = sentence.strip()
                    if not sentence:
                        continue

                    sent_word_count = count_words(sentence)

                    # If adding this sentence would exceed max, start new chunk
                    if current_word_count + sent_word_count > TARGET_MAX_WORDS and current_chunk:
                        finalize_chunk()

                    current_chunk += sentence + " "
                    current_word_count += sent_word_count

            # Merge small paragraphs into chunks
            else:
                # If adding this paragraph would exceed max, start new chunk
                if current_word_count + para_word_count > TARGET_MAX_WORDS and current_chunk:
                    finalize_chunk()

                current_chunk += paragraph + "\n\n"
                current_word_count += para_word_count

                # If chunk reaches minimum size, finalize it
                if current_word_count >= TARGET_MIN_WORDS:
                    finalize_chunk()

        # Don't forget the last chunk
        finalize_chunk()

        return chunks

    def _build_index(self) -> None:
        """
        Build the embedding index for all chunks

        Encodes all chunk texts using the sentence transformer and normalizes
        the embeddings for efficient cosine similarity computation.
        """
        if not self.chunks:
            print("Warning: No chunks to index.")
            return

        # Extract all chunk texts
        texts = [chunk["text"] for chunk in self.chunks]

        # Encode texts into embeddings
        self.embeddings = self.model.encode(texts, show_progress_bar=False)

        # Normalize embeddings for cosine similarity
        # Normalized vectors: dot product = cosine similarity
        norms = np.linalg.norm(self.embeddings, axis=1, keepdims=True)
        self.embeddings = self.embeddings / norms

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, any]]:
        """
        Retrieve the most relevant chunks for a query

        Args:
            query: The search query
            top_k: Number of top results to return

        Returns:
            List of chunk dictionaries with relevance scores
        """
        if self.embeddings is None:
            return []

        # Encode and normalize the query
        query_emb = self.model.encode([query])
        query_emb = query_emb / np.linalg.norm(query_emb, axis=1, keepdims=True)

        # Compute cosine similarity (dot product of normalized vectors)
        scores = (self.embeddings @ query_emb.T).flatten()

        # Get top-k indices (sorted by score in descending order)
        top_indices = np.argsort(scores)[::-1][:top_k]

        # Build result list
        results = []
        for idx in top_indices:
            results.append({
                "text": self.chunks[idx]["text"],
                "source": self.chunks[idx]["source"],
                "chunk_index": self.chunks[idx]["chunk_index"],
                "score": float(scores[idx])
            })

        return results

    def add_chunk(self, text: str, source: str) -> None:
        """
        Add a new chunk to the knowledge base

        Args:
            text: The text content of the chunk
            source: The source identifier for citation
        """
        # Find the next chunk index
        max_index = max((c["chunk_index"] for c in self.chunks), default=-1)
        chunk_index = max_index + 1

        # Add the chunk
        self.chunks.append({
            "text": text,
            "source": source,
            "chunk_index": chunk_index
        })

        # Rebuild the index
        self._build_index()

    def get_context_string(self, query: str, top_k: int = 3) -> Tuple[str, List[str]]:
        """
        Get formatted context string for a query

        Args:
            query: The search query
            top_k: Number of top results to include

        Returns:
            Tuple of (context_string, list_of_sources)
        """
        results = self.retrieve(query, top_k)

        if not results:
            return "", []

        # Build context string
        context_parts = []
        sources_used = []

        for result in results:
            sources_used.append(f"{result['source']}")
            context_parts.append(
                f"[Source: {result['source']}, Chunk {result['chunk_index']}] "
                f"(Relevance: {result['score']:.2f})\n{result['text']}\n"
            )

        context_string = (
            "--- Retrieved Context ---\n"
            + "\n".join(context_parts)
            + "--- End Context ---"
        )

        return context_string, list(set(sources_used))
