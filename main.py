"""
StudyMate — Personal AI Study Assistant
Usage:
    python main.py                    # Basic chat mode
    python main.py --docs notes/      # Chat mode with RAG from documents
"""

import argparse
import sys
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from src.llm import LLMWrapper
from src.memory import MemoryManager
from src.tools import TOOL_SCHEMAS, execute_tool_call
from src.rag import RAGEngine


def parse_args():
    """
    Parse command-line arguments

    Returns:
        Parsed arguments namespace
    """
    parser = argparse.ArgumentParser(
        description="StudyMate — AI Study Assistant",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                    # Basic chat mode
  python main.py --docs notes/      # Chat with RAG from study notes
  python main.py --docs lecture.txt # Chat with RAG from a single file
        """
    )
    parser.add_argument(
        "--docs",
        type=str,
        default=None,
        help="Path to a .txt/.pdf file or directory to use as knowledge base"
    )
    return parser.parse_args()


def main():
    """
    Main entry point for StudyMate CLI application
    """
    args = parse_args()

    # Validate API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: Set ANTHROPIC_API_KEY environment variable.")
        print("  export ANTHROPIC_API_KEY='your-key-here'")
        print("  or: set ANTHROPIC_API_KEY='your-key-here' (Windows)")
        sys.exit(1)

    # Initialize components
    print("\nInitializing StudyMate...")
    llm = LLMWrapper()  # uses default system prompt from Milestone 2
    memory = MemoryManager("memory.json")
    rag = None

    # RAG initialization
    if args.docs:
        print(f"Loading documents from: {args.docs}")
        rag = RAGEngine(args.docs)

    # Welcome message
    print("\n" + "=" * 60)
    print("  StudyMate — Your AI Study Assistant")
    print("=" * 60)

    if len(memory.get_messages()) > 0:
        print(f"  Welcome back! {len(memory.get_messages())} messages from last session.")
        print("  Type /clear to start fresh.")
    else:
        print("  Type 'quit' to exit, /clear to reset memory.")

    print("=" * 60 + "\n")

    # Chat loop
    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nStudyMate: Goodbye!")
            break

        # Skip empty input
        if not user_input:
            continue

        # Handle commands
        if user_input.lower() in ("quit", "exit", "/quit"):
            print("StudyMate: Goodbye! See you next session.")
            break

        if user_input.lower() == "/clear":
            memory.clear()
            continue

        # Add user message to memory (original, unaugmented)
        memory.add_message("user", user_input)

        # RAG augmentation
        query_to_send = user_input
        if rag:
            context_str, sources = rag.get_context_string(user_input)
            if context_str:
                query_to_send = (
                    f"[Student Question]: {user_input}\n\n"
                    f"[Study Notes Context]:\n{context_str}\n\n"
                    f"Based the study notes above, answer the question. "
                    f"Cite which source/chunk you used using [Source: filename, Chunk N]."
                )

        # Build messages for API (replace last user message with augmented version)
        api_messages = memory.get_messages().copy()
        api_messages[-1] = {"role": "user", "content": query_to_send}

        # Tool call loop (max 5 rounds to prevent infinite loops)
        max_tool_rounds = 5
        final_response = None

        for round_num in range(max_tool_rounds):
            try:
                response_text, tool_uses = llm.send_message_with_tools(api_messages, TOOL_SCHEMAS)
            except Exception as e:
                print(f"\nStudyMate: Sorry, something went wrong. {e}\n")
                # Remove the user message since we're not saving the assistant response
                memory.history.pop()
                break

            if tool_uses is None:
                # No tool calls — we have the final response
                final_response = response_text
                break

            # Process tool calls
            # Add assistant's response (with tool_use blocks) to messages
            assistant_content = []
            if response_text:
                assistant_content.append({"type": "text", "text": response_text})
            for tu in tool_uses:
                assistant_content.append({
                    "type": "tool_use",
                    "id": tu["id"],
                    "name": tu["name"],
                    "input": tu["input"]
                })
            api_messages.append({"role": "assistant", "content": assistant_content})

            # Execute each tool and collect results
            tool_results = []
            for tu in tool_uses:
                result = execute_tool_call(tu["name"], tu["input"])
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tu["id"],
                    "content": result
                })

            # Add tool results as user message (Anthropic convention)
            api_messages.append({"role": "user", "content": tool_results})

        else:
            # If we exited the loop without breaking, we used all rounds
            final_response = "Sorry, I encountered an issue processing that request (too many tool calls)."

        if final_response is not None:
            print(f"\nStudyMate: {final_response}\n")
            memory.add_message("assistant", final_response)

    # Save memory on exit
    memory.save()


if __name__ == "__main__":
    main()
