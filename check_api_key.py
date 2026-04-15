"""
Check and validate Anthropic API key
"""

import os
import re
from dotenv import load_dotenv

load_dotenv()

def check_api_key_format(api_key):
    """Check if the API key has the correct format"""
    print("\n[1] API Key Format Check")
    print("-" * 40)

    # Anthropic API keys typically start with 'sk-ant-'
    if not api_key.startswith('sk-ant-'):
        print("   [FAIL] API key should start with 'sk-ant-'")
        return False
    else:
        print("   [PASS] Correct prefix")

    # Check length (Anthropic keys are typically around 100 characters)
    if len(api_key) < 50:
        print("   [FAIL] API key seems too short")
        return False
    else:
        print(f"   [PASS] Reasonable length ({len(api_key)} chars)")

    # Check for invalid characters
    if re.search(r'[^a-zA-Z0-9_-]', api_key):
        print("   [FAIL] API key contains invalid characters")
        return False
    else:
        print("   [PASS] Valid characters only")

    return True

def test_api_connection(api_key):
    """Test if the API key actually works"""
    print("\n[2] API Connection Test")
    print("-" * 40)

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        # Test with a minimal request
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=10,
            messages=[{"role": "user", "content": "Hi"}]
        )

        print("   [PASS] API key is valid and working!")
        return True

    except anthropic.AuthenticationError as e:
        print(f"   [FAIL] Authentication error: {e}")
        print("   The API key appears to be expired or incorrect")
        return False
    except Exception as e:
        print(f"   [FAIL] Other error: {e}")
        return False

def main():
    print("=" * 60)
    print("ANTHROPIC API KEY DIAGNOSTIC TOOL")
    print("=" * 60)

    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        print("\n[ERROR] No API key found!")
        print("\nTo set up your API key:")
        print("1. Go to https://console.anthropic.com")
        print("2. Create an account or log in")
        print("3. Navigate to API Keys section")
        print("4. Create a new API key")
        print("5. Copy the key to your .env file:")
        print("   ANTHROPIC_API_KEY=sk-ant-your-key-here")
        return

    print(f"\nAPI Key found: {api_key[:20]}...{api_key[-10:]}")

    # Check format
    format_ok = check_api_key_format(api_key)

    if format_ok:
        # Test connection
        connection_ok = test_api_connection(api_key)

        if not connection_ok:
            print("\n[RECOMMENDATION]")
            print("-" * 40)
            print("Your API key format is correct but the connection failed.")
            print("This usually means:")
            print("1. The API key has expired")
            print("2. The API key has been revoked")
            print("3. There's a typo in the key")
            print("\nPlease get a new API key from:")
            print("https://console.anthropic.com")
    else:
        print("\n[ERROR] API key format is invalid!")
        print("Please get a new API key from:")
        print("https://console.anthropic.com")

if __name__ == "__main__":
    main()
