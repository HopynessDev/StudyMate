"""
StudyMate MCP Server
Exposes StudyMate functionality as MCP (Model Context Protocol) tools
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add src directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mcp.server.fastmcp import FastMCP
from src.rag import RAGEngine
from src.memory import MemoryManager
from src.llm import LLMWrapper
from src.mcp_tools import create_mcp_tools


# Create MCP server
mcp = FastMCP("StudyMate")

# Initialize StudyMate components
# MCP server doesn't load docs by default (user can add chunks via tool)
rag_engine = None
memory_manager = MemoryManager("memory.json")

# Initialize LLM wrapper (will fail gracefully if no API key)
try:
    llm_wrapper = LLMWrapper()
except ValueError:
    print("Warning: ANTHROPIC_API_KEY not set. MCP server will have limited functionality.")
    print("Set the environment variable and restart the server for full functionality.")
    llm_wrapper = None

# Create tool functions
tools = create_mcp_tools(rag_engine, memory_manager, llm_wrapper)


@mcp.tool()
async def ask_studymate(question: str) -> str:
    """
    Ask StudyMate a study question and receive an AI-powered answer.

    Args:
        question: The study question you want to ask

    Returns:
        A detailed answer to your study question
    """
    if llm_wrapper is None:
        return "Error: LLM not initialized. Please set ANTHROPIC_API_KEY environment variable."

    return await tools["ask_studymate"](question)


@mcp.tool()
async def add_to_knowledge_base(text: str, source: str) -> str:
    """
    Add a new piece of text to StudyMate's RAG knowledge base.

    This allows you to build up your study materials over time. Once added,
    the content will be available for retrieval during study sessions.

    Args:
        text: The text content to add to the knowledge base
        source: A label identifying where this text came from (e.g., 'lecture3.txt', 'chapter5.pdf')

    Returns:
        Confirmation message when the content is added
    """
    if rag_engine is None:
        # Initialize RAG engine on first use
        global rag_engine
        rag_engine = RAGEngine()
        # Update tools with the new rag_engine
        global tools
        tools = create_mcp_tools(rag_engine, memory_manager, llm_wrapper)

    return await tools["add_to_knowledge_base"](text, source)


@mcp.tool()
async def get_session_summary() -> str:
    """
    Get a summary of the current StudyMate session memory.

    Returns information about:
    - Total number of messages in the conversation history
    - Key topics that have been discussed

    This is useful for reviewing what you've covered in your study sessions.
    """
    return await tools["get_session_summary"]()


if __name__ == "__main__":
    # Run the MCP server using stdio transport
    print("StudyMate MCP Server starting...")
    print("Exposes tools: ask_studymate, add_to_knowledge_base, get_session_summary")
    mcp.run(transport="stdio")
