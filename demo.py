"""
Interactive demo of StudyMate functionality (without API key requirements)
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.memory import MemoryManager
from src.tools import TOOL_SCHEMAS, execute_tool_call
from src.rag import RAGEngine

def demo_memory():
    """Demonstrate memory functionality"""
    print("\n" + "=" * 60)
    print("MEMORY MANAGEMENT DEMO")
    print("=" * 60)

    # Create memory manager
    memory = MemoryManager("demo_memory.json")

    # Add some messages
    print("\n[1] Adding messages to memory...")
    memory.add_message("user", "What is Python?")
    memory.add_message("assistant", "Python is a high-level programming language...")
    memory.add_message("user", "Can you give me an example?")
    memory.add_message("assistant", "Sure! Here's a simple example...")

    # Get messages
    print("\n[2] Retrieving messages...")
    messages = memory.get_messages()
    print(f"Total messages: {len(messages)}")

    # Get summary
    print("\n[3] Session summary:")
    print(memory.get_session_summary())

    # Save
    print("\n[4] Saving memory...")
    memory.save()
    print("Memory saved to demo_memory.json")

def demo_tools():
    """Demonstrate tool functionality"""
    print("\n" + "=" * 60)
    print("TOOL EXECUTION DEMO")
    print("=" * 60)

    print("\n[1] Calculator Tool:")
    print("-" * 40)
    print("Expression: 2 ** 10 + 5")
    result = execute_tool_call("calculator", {"expression": "2 ** 10 + 5"})
    print(f"Result: {result}")

    print("\n[2] Calculator Tool (Square Root):")
    print("-" * 40)
    print("Expression: sqrt(144) + 10")
    result = execute_tool_call("calculator", {"expression": "sqrt(144) + 10"})
    print(f"Result: {result}")

    print("\n[3] Calculator Tool (Logarithm):")
    print("-" * 40)
    print("Expression: log(100) * 2")
    result = execute_tool_call("calculator", {"expression": "log(100) * 2"})
    print(f"Result: {result}")

    print("\n[4] Datetime Tool:")
    print("-" * 40)
    result = execute_tool_call("get_current_datetime", {})
    print(f"Current time: {result}")

def demo_rag():
    """Demonstrate RAG functionality with sample documents"""
    print("\n" + "=" * 60)
    print("RAG (Retrieval-Augmented Generation) DEMO")
    print("=" * 60)

    # Create sample documents
    import tempfile
    import os

    with tempfile.TemporaryDirectory() as temp_dir:
        # Create sample text file
        sample_file = os.path.join(temp_dir, "study_notes.txt")
        with open(sample_file, 'w') as f:
            f.write("""
Study Notes: Programming Concepts

Variables are containers for storing data values. In Python, you can create a variable by simply assigning a value: x = 5.

Functions are reusable blocks of code that perform specific tasks. They are defined using the def keyword.

Lists are ordered collections of items. They are mutable, meaning you can change their contents after creation.

Dictionaries are key-value pairs. They are unordered and mutable, making them ideal for storing related data.

Loops allow you to execute code repeatedly. Python has for loops and while loops.

Conditionals allow you to make decisions in your code using if, elif, and else statements.
            """.strip())

        print(f"\n[1] Created sample document: {sample_file}")

        # Initialize RAG engine
        print("\n[2] Initializing RAG engine...")
        rag = RAGEngine(temp_dir)

        # Test retrieval
        print("\n[3] Testing retrieval:")
        print("-" * 40)

        queries = [
            "What are variables?",
            "How do I create a function?",
            "Tell me about lists"
        ]

        for query in queries:
            print(f"\nQuery: {query}")
            results = rag.retrieve(query, top_k=1)
            if results:
                result = results[0]
                print(f"Relevance: {result['score']:.2f}")
                print(f"Source: {result['source']}, Chunk {result['chunk_index']}")
                print(f"Content preview: {result['text'][:100]}...")

        # Test context string generation
        print("\n\n[4] Context string generation:")
        print("-" * 40)
        context_str, sources = rag.get_context_string("What are functions?", top_k=2)
        print(f"Sources used: {sources}")
        print(f"\nContext:\n{context_str}")

def main():
    """Run all demos"""
    print("\n" + "=" * 60)
    print("STUDYMATE INTERACTIVE DEMO")
    print("This demo shows functionality without requiring an API key")
    print("=" * 60)

    try:
        demo_tools()
        demo_memory()
        demo_rag()

        print("\n" + "=" * 60)
        print("DEMO COMPLETE")
        print("=" * 60)
        print("\nAll basic functionality is working!")
        print("\nTo run the full application with AI features:")
        print("1. Get a valid API key from console.anthropic.com")
        print("2. Update your .env file with the key")
        print("3. Run: python main.py")

    except Exception as e:
        print(f"\n[ERROR] Demo failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
