"""
Memory Management for StudyMate
Handles persistent storage of conversation history across sessions
"""

import json
import os
from typing import List, Dict


class MemoryManager:
    """
    Manages conversation memory with persistent storage to disk
    """

    def __init__(self, filepath: str = "memory.json"):
        """
        Initialize the memory manager

        Args:
            filepath: Path to the JSON file where memory is stored
        """
        self.filepath = filepath
        self.history: List[Dict[str, str]] = []
        self.load()

    def load(self) -> None:
        """
        Load conversation history from disk

        Attempts to read the memory file and restore the conversation history.
        If the file doesn't exist or is corrupted, starts with empty history.
        """
        try:
            if os.path.exists(self.filepath):
                with open(self.filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if "history" in data and isinstance(data["history"], list):
                        self.history = data["history"]
                        if len(self.history) > 0:
                            print(f"Loaded {len(self.history)} messages from previous session.")
            else:
                self.history = []
        except (json.JSONDecodeError, IOError, KeyError) as e:
            # File doesn't exist or is corrupted - start fresh
            self.history = []
            print(f"Could not load memory file (starting fresh): {e}")

    def save(self) -> None:
        """
        Save conversation history to disk

        Writes the current conversation history to the JSON file.
        Handles IOError gracefully.
        """
        try:
            data = {"history": self.history}
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Warning: Could not save memory to disk: {e}")

    def add_message(self, role: str, content: str) -> None:
        """
        Add a message to the conversation history

        Args:
            role: Either "user" or "assistant"
            content: The message content
        """
        self.history.append({
            "role": role,
            "content": content
        })

    def get_messages(self) -> List[Dict[str, str]]:
        """
        Get a copy of the conversation history

        Returns:
            A copy of the messages list (not a reference)
        """
        return self.history.copy()

    def clear(self) -> None:
        """
        Clear all conversation history and persist to disk
        """
        self.history = []
        self.save()
        print("Memory cleared. Starting fresh session.")

    def get_session_summary(self) -> str:
        """
        Get a summary of the current/previous session

        Returns:
            A string summarizing the conversation history
        """
        if not self.history:
            return "No previous session data."

        # Count messages
        total_messages = len(self.history)

        # Extract key topics from first few user messages
        user_messages = [msg for msg in self.history if msg["role"] == "user"]
        topics = []

        for msg in user_messages[:5]:  # Look at first 5 user messages
            content = msg["content"].strip()
            # Extract first ~50 chars as topic preview
            topic_preview = content[:50] + "..." if len(content) > 50 else content
            topics.append(topic_preview)

        if topics:
            topics_str = ", ".join(f'"{t}"' for t in topics)
            return f"Previous session had {total_messages} messages covering topics: [{topics_str}]"
        else:
            return f"Previous session had {total_messages} messages."
