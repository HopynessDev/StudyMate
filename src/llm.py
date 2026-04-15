"""
LLM API Wrapper for StudyMate
Provides a clean interface to Anthropic's Claude API with error handling
"""

import anthropic
import os
import time
from typing import Optional, List, Dict, Tuple


# Default system prompt for StudyMate (Milestone 2 - Prompt Engineering)
DEFAULT_SYSTEM_PROMPT = """You are StudyMate, a focused academic study assistant.

## Role
You specialize as a tutor for computer science, mathematics, and general science topics. Your goal is to help students understand concepts deeply, not just provide answers.

## Behavioral Rules
- Always stay on topic — if asked about non-academic things, gently redirect to academic subjects
- Encourage the student — use positive reinforcement and acknowledge their progress
- Admit uncertainty — if unsure, say "I'm not confident about this" rather than guessing
- Be concise but thorough — explain reasoning step-by-step, don't just give answers

## Thinking Process
Before answering any question, reason step-by-step in a <thinking> block. Then provide your final answer.

## Example Interactions

Example 1:
Student: What is the difference between supervised and unsupervised learning?
StudyMate: <thinking>
Let me break this down systematically:

1. Supervised Learning:
   - Definition: Learning from labeled data
   - Key characteristic: Training data has known outputs
   - Common algorithms: Linear regression, decision trees, neural networks
   - Applications: Classification, regression, prediction

2. Unsupervised Learning:
   - Definition: Learning patterns from unlabeled data
   - Key characteristic: No predefined outputs or labels
   - Common algorithms: Clustering, PCA, association rules
   - Applications: Anomaly detection, customer segmentation, dimensionality reduction

Key differences:
- Data: labeled vs unlabeled
- Goal: prediction vs pattern discovery
- Complexity: generally more complex (unsupervised)
- Use cases: when labels available (supervised) vs when exploring data (unsupervised)

</thinking>
Supervised learning uses labeled data to train models for prediction tasks, while unsupervised learning finds patterns in unlabeled data without predefined outputs.

Example 2:
Student: How do I calculate the area of a circle?
StudyMate: <thinking>
To calculate the area of a circle, I need to recall the mathematical formula and explain it clearly:

1. Formula: A = π × r²
   - A = area
   - π (pi) ≈ 3.14159
   - r = radius of the circle

2. Step-by-step process:
   - Measure the radius (distance from center to edge)
   - Square the radius (multiply it by itself)
   - Multiply by π

3. Example calculation:
   - If radius = 5 units
   - Area = π × 5² = π × 25 ≈ 78.54 square units

</thinking>
The area of a circle is calculated using the formula A = π × r², where π (pi) ≈ 3.14159 and r is the radius.

## Tools
You have access to tools. Use them when appropriate. Do not tell the user you're using a tool — just use it naturally.

When answering from study notes, always cite your source using [Source: filename, Chunk N] format."""


class LLMWrapper:
    """
    Wrapper for Anthropic Claude API with comprehensive error handling
    """

    def __init__(self, model: str = "claude-sonnet-4-20250514", system_prompt: str = DEFAULT_SYSTEM_PROMPT):
        """
        Initialize the LLM wrapper

        Args:
            model: The Claude model to use
            system_prompt: System prompt to set behavior and role

        Raises:
            ValueError: If ANTHROPIC_API_KEY environment variable is not set
        """
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("Set ANTHROPIC_API_KEY environment variable")

        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model
        self.system_prompt = system_prompt

    def send_message(self, messages: List[Dict[str, str]]) -> str:
        """
        Send a message to Claude and return the response

        Args:
            messages: List of message dicts with 'role' and 'content' keys

        Returns:
            The text content of Claude's response

        Raises:
            Various anthropic.APIError subclasses depending on the issue
        """
        return self._send_with_retry(messages, tools=None)

    def send_message_with_tools(self, messages: List[Dict[str, str]], tools: List[Dict]) -> Tuple[str, Optional[List[Dict]]]:
        """
        Send a message to Claude with tool calling capability

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            tools: List of tool schema dicts following Anthropic's format

        Returns:
            Tuple of (response_text, tool_use_blocks)
            - response_text: The text content of the response
            - tool_use_blocks: List of tool use dicts if stop_reason is "tool_use", None otherwise

        Raises:
            Various anthropic.APIError subclasses depending on the issue
        """
        return self._send_with_retry(messages, tools=tools)

    def _send_with_retry(self, messages: List[Dict[str, str]], tools: Optional[List[Dict]] = None) -> Tuple[str, Optional[List[Dict]]]:
        """
        Internal method to send messages with automatic retry for certain errors

        Args:
            messages: List of message dicts
            tools: Optional list of tool schemas

        Returns:
            Tuple of (response_text, tool_use_blocks)
        """
        max_retries = 1
        retry_count = 0

        while retry_count <= max_retries:
            try:
                params = {
                    "model": self.model,
                    "system": self.system_prompt,
                    "messages": messages,
                    "max_tokens": 4096
                }

                if tools is not None:
                    params["tools"] = tools

                response = self.client.messages.create(**params)

                # Extract text content
                response_text = ""
                for block in response.content:
                    if block.type == "text":
                        response_text += block.text

                # Check for tool use
                tool_use_blocks = None
                if response.stop_reason == "tool_use":
                    tool_use_blocks = []
                    for block in response.content:
                        if block.type == "tool_use":
                            tool_use_blocks.append({
                                "id": block.id,
                                "name": block.name,
                                "input": block.input
                            })

                return response_text, tool_use_blocks

            except anthropic.RateLimitError as e:
                if retry_count < max_retries:
                    print("Rate limited. Waiting 10 seconds...")
                    time.sleep(10)
                    retry_count += 1
                else:
                    raise

            except anthropic.AuthenticationError as e:
                print("Invalid API key. Check your ANTHROPIC_API_KEY.")
                raise

            except anthropic.APITimeoutError as e:
                if retry_count < max_retries:
                    print("Request timed out. Retrying once...")
                    retry_count += 1
                else:
                    raise

            except anthropic.APIConnectionError as e:
                print("Connection error. Check your internet.")
                raise

            except Exception as e:
                print(f"Unexpected error: {e}")
                raise

        # Should never reach here
        raise RuntimeError("Unexpected error in send_with_retry")
