"""
MCP Tool Implementations for StudyMate
Factory function that creates async tool wrappers for MCP server
"""

import asyncio
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from src.rag import RAGEngine
    from src.memory import MemoryManager
    from src.llm import LLMWrapper


def create_mcp_tools(
    rag_engine: Optional['RAGEngine'],
    memory_manager: 'MemoryManager',
    llm_wrapper: 'LLMWrapper'
) -> dict:
    """
    Factory that creates MCP tool functions with access to StudyMate internals

    Args:
        rag_engine: The RAGEngine instance (may be None)
        memory_manager: The MemoryManager instance
        llm_wrapper: The LLMWrapper instance

    Returns:
        Dictionary mapping tool names to their async implementations
    """

    async def ask_studymate(question: str) -> str:
        """
        Ask StudyMate a question and get an AI-powered answer

        Args:
            question: The study question to ask

        Returns:
            The assistant's response
        """
        # Build a minimal message list
        messages = [{"role": "user", "content": question}]
        try:
            response = llm_wrapper.send_message(messages)
            return response
        except Exception as e:
            return f"Error: {e}"

    async def add_to_knowledge_base(text: str, source: str) -> str:
        """
        Add new text to the RAG knowledge base

        Args:
            text: The text content to add
            source: A label identifying where this text came from

        Returns:
            Confirmation message or error
        """
        if rag_engine is None:
            return "Error: No RAG engine initialized. Start StudyMate with --docs flag."
        try:
            rag_engine.add_chunk(text, source)
            return f"Added chunk to knowledge base from source: {source}"
        except Exception as e:
            return f"Error: {e}"

    async def get_session_summary() -> str:
        """
        Get a summary of the current session memory

        Returns:
            String summary of the session
        """
        return memory_manager.get_session_summary()

    return {
        "ask_studymate": ask_studymate,
        "add_to_knowledge_base": add_to_knowledge_base,
        "get_session_summary": get_session_summary,
    }
