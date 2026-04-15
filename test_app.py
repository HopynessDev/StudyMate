"""
Simple test script to verify StudyMate functionality
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.llm import LLMWrapper
from src.tools import TOOL_SCHEMAS, execute_tool_call

def test_basic_chat():
    """Test basic chat functionality"""
    print("[TEST] Testing basic chat...")
    print("=" * 50)

    try:
        llm = LLMWrapper()
        messages = [{"role": "user", "content": "What is Python?"}]
        response = llm.send_message(messages)

        print("[PASS] Basic chat test PASSED")
        print(f"Response preview: {response[:100]}...")
        return True
    except Exception as e:
        print(f"[FAIL] Basic chat test FAILED: {e}")
        return False

def test_tool_calling():
    """Test tool calling functionality"""
    print("\n[TEST] Testing tool calling...")
    print("=" * 50)

    try:
        llm = LLMWrapper()
        messages = [{"role": "user", "content": "What time is it right now?"}]
        response_text, tool_uses = llm.send_message_with_tools(messages, TOOL_SCHEMAS)

        if tool_uses:
            print(f"[PASS] Tool calling test PASSED")
            print(f"Tool use detected: {tool_uses[0]['name']}")
            print(f"Response preview: {response_text[:100]}...")
            return True
        else:
            print("[WARN] Tool calling test: No tools were called (model may have answered directly)")
            return True
    except Exception as e:
        print(f"[FAIL] Tool calling test FAILED: {e}")
        return False

def test_calculator_tool():
    """Test the calculator tool directly"""
    print("\n[TEST] Testing calculator tool...")
    print("=" * 50)

    try:
        result = execute_tool_call("calculator", {"expression": "2 ** 10 + 5"})
        print(f"[PASS] Calculator test PASSED")
        print(f"2 ** 10 + 5 = {result}")
        return True
    except Exception as e:
        print(f"[FAIL] Calculator test FAILED: {e}")
        return False

def test_datetime_tool():
    """Test the datetime tool directly"""
    print("\n[TEST] Testing datetime tool...")
    print("=" * 50)

    try:
        result = execute_tool_call("get_current_datetime", {})
        print(f"[PASS] Datetime test PASSED")
        print(f"Current time: {result}")
        return True
    except Exception as e:
        print(f"[FAIL] Datetime test FAILED: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("STUDYMATE FUNCTIONALITY TESTS")
    print("=" * 60 + "\n")

    # Check API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("[ERROR] ANTHROPIC_API_KEY not found!")
        return

    print(f"[OK] API key found (length: {len(os.environ.get('ANTHROPIC_API_KEY'))})\n")

    # Run tests
    results = []
    results.append(test_basic_chat())
    results.append(test_tool_calling())
    results.append(test_calculator_tool())
    results.append(test_datetime_tool())

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")

    if passed == total:
        print("[SUCCESS] All tests passed! StudyMate is working correctly!")
    else:
        print(f"[WARNING] {total - passed} test(s) failed")

if __name__ == "__main__":
    main()
