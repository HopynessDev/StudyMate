"""
Detailed API key verification and testing
"""

import os
import anthropic

def test_specific_key(api_key):
    """Test a specific API key"""
    print(f"Testing key: {api_key[:20]}...{api_key[-10:]}")
    print(f"Key length: {len(api_key)}")

    try:
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=20,
            messages=[{"role": "user", "content": "Say 'test'"}]
        )

        result = response.content[0].text if response.content else "No response"
        print(f"✅ API key is VALID!")
        print(f"Response: {result}")
        return True

    except anthropic.AuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Other error: {e}")
        return False

def main():
    print("=" * 60)
    print("DETAILED API KEY VERIFICATION")
    print("=" * 60)

    # Test the key from .env file
    print("\n[1] Testing API key from .env file:")
    print("-" * 40)
    from dotenv import load_dotenv
    load_dotenv()

    env_key = os.environ.get("ANTHROPIC_API_KEY")
    if not env_key:
        print("No ANTHROPIC_API_KEY found in .env file")
        return

    env_valid = test_specific_key(env_key)

    print("\n[2] Information:")
    print("-" * 40)
    print(f"Full key from .env: {env_key}")
    print(f"Environment variable set: {bool(env_key)}")

    if env_valid:
        print("\n✅ Your API key in .env file is valid and working!")
        print("You can now run: python main.py")
    else:
        print("\n❌ Your API key in .env file is NOT valid.")
        print("\nIf you tested the API elsewhere and it worked:")
        print("- Make sure you're using the SAME API key in your .env file")
        print("- Check for typos in the key")
        print("- Try copying the key directly from Anthropic console")

if __name__ == "__main__":
    main()
