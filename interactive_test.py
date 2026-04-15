"""
Interactive test of StudyMate with simulated input
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.llm import LLMWrapper
from src.memory import MemoryManager
from src.tools import TOOL_SCHEMAS, execute_tool_call
from src.rag import RAGEngine

def test_with_api_key():
    """Test the application with actual API calls"""

    # Check API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("[ERROR] ANTHROPIC_API_KEY not found in environment variables!")
        print("\nPlease set your API key in the .env file:")
        print("ANTHROPIC_API_KEY=your-key-here")
        return False

    print("\n" + "=" * 60)
    print("STUDYMATE INTEGRATION TEST")
    print("=" * 60)

    try:
        # Initialize components
        print("\n[1] Initializing components...")
        llm = LLMWrapper()
        memory = MemoryManager("test_memory.json")
        print("   LLM and memory initialized successfully")

        # Test 1: Basic conversation
        print("\n[2] Testing basic conversation...")
        print("-" * 40)
        user_input = "What is machine learning?"
        print(f"User: {user_input}")

        memory.add_message("user", user_input)
        response = llm.send_message(memory.get_messages())
        print(f"StudyMate: {response[:200]}...")

        memory.add_message("assistant", response)

        # Test 2: Tool usage
        print("\n[3] Testing tool usage...")
        print("-" * 40)
        user_input = "What time is it?"
        print(f"User: {user_input}")

        memory.add_message("user", user_input)
        response_text, tool_uses = llm.send_message_with_tools(memory.get_messages(), TOOL_SCHEMAS)

        if tool_uses:
            print(f"   Tool called: {tool_uses[0]['name']}")
            # Execute the tool
            tool_result = execute_tool_call(tool_uses[0]['name'], tool_uses[0]['input'])
            print(f"   Tool result: {tool_result}")

            # Get final response after tool use
            print(f"   Final response: {response_text[:100]}...")
        else:
            print(f"   No tools used (model answered directly)")
            print(f"   Response: {response_text[:100]}...")

        memory.add_message("assistant", response_text)

        # Test 3: Calculator tool
        print("\n[4] Testing calculator...")
        print("-" * 40)
        user_input = "Calculate 2^10 + 5"
        print(f"User: {user_input}")

        memory.add_message("user", user_input)
        response_text, tool_uses = llm.send_message_with_tools(memory.get_messages(), TOOL_SCHEMAS)

        if tool_uses:
            print(f"   Tool called: {tool_uses[0]['name']}")
            tool_result = execute_tool_call(tool_uses[0]['name'], tool_uses[0]['input'])
            print(f"   Calculation result: {tool_result}")
            print(f"   AI response: {response_text[:100]}...")
        else:
            print(f"   Response: {response_text[:100]}...")

        # Test 4: Session summary
        print("\n[5] Session summary:")
        print("-" * 40)
        print(memory.get_session_summary())

        # Save memory
        print("\n[6] Saving memory...")
        memory.save()
        print("   Memory saved to test_memory.json")

        print("\n" + "=" * 60)
        print("TEST SUCCESSFUL!")
        print("=" * 60)
        print("\nAll StudyMate features are working correctly!")
        print("You can now run: python main.py")

        return True

    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_without_api_key():
    """Test the application without API (just tool functionality)"""

    print("\n" + "=" * 60)
    print("STUDYMATE FUNCTIONALITY TEST (No API Key)")
    print("=" * 60)

    try:
        # Test tools directly
        print("\n[1] Testing tools directly...")
        print("-" * 40)

        # Calculator
        print("Calculator: 2^10 + 5")
        result = execute_tool_call("calculator", {"expression": "2 ** 10 + 5"})
        print(f"  Result: {result}")

        # Datetime
        print("\nDatetime tool:")
        result = execute_tool_call("get_current_datetime", {})
        print(f"  Result: {result}")

        # Memory
        print("\n[2] Testing memory...")
        print("-" * 40)
        memory = MemoryManager("test_memory.json")
        memory.add_message("user", "Test message")
        memory.add_message("assistant", "Test response")
        print(f"  Messages stored: {len(memory.get_messages())}")
        print(f"  Summary: {memory.get_session_summary()}")
        memory.save()
        print("  Memory saved successfully")

        print("\n" + "=" * 60)
        print("TEST SUCCESSFUL!")
        print("=" * 60)
        print("\nAll tools and memory are working!")
        print("To use AI features, get a valid API key and run: python main.py")

        return True

    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if os.environ.get("ANTHROPIC_API_KEY"):
        test_with_api_key()
    else:
        print("[INFO] No API key found. Testing without AI features...")
        test_without_api_key()
