# StudyMate — Personal AI Study Assistant

A command-line AI assistant that helps students learn and revise topics. Built for the TET School of Business AI Engineering course.

## Features

- **LLM Chat**: Conversational interface powered by Claude (Anthropic)
- **Smart Prompting**: Chain-of-thought, few-shot, and role prompting strategies for better learning
- **Persistent Memory**: Remembers conversations across sessions
- **Tool Calling**: Calculator, web search, and datetime tools
- **RAG (Retrieval-Augmented Generation)**: Query your own study notes (.txt/.pdf files)
- **MCP Server**: Expose StudyMate as a tool server for other AI clients

## Prerequisites

- Python 3.10 or higher
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

## Installation

1. **Clone the repository** (or extract the project files):
   ```bash
   cd Studymate2
   ```

2. **Create a virtual environment**:
   ```bash
   # Linux/Mac
   python -m venv venv
   source venv/bin/activate

   # Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set your API key**:
   ```bash
   # Linux/Mac
   export ANTHROPIC_API_KEY='your-key-here'

   # Windows (Command Prompt)
   set ANTHROPIC_API_KEY=your-key-here

   # Windows (PowerShell)
   $env:ANTHROPIC_API_KEY='your-key-here'
   ```

   For a permanent setup on Linux/Mac, add this to your `~/.bashrc` or `~/.zshrc`:
   ```bash
   export ANTHROPIC_API_KEY='your-key-here'
   ```

   For Windows, add it as a system environment variable.

## Usage

### Basic Chat Mode
Start StudyMate with just the AI assistant:
```bash
python main.py
```

### With RAG (Study Notes)
Provide your study notes as context for more targeted answers:
```bash
# Single file
python main.py --docs lecture_notes.txt

# Directory of files
python main.py --docs notes/

# PDF file
python main.py --docs textbook.pdf
```

### Available Commands
- `quit` or `exit` — End the session
- `/clear` — Clear all memory and start fresh
- Press Ctrl+C or Ctrl+D to exit gracefully

### Example Session
```
$ python main.py

============================================================
  StudyMate — Your AI Study Assistant
============================================================
  Type 'quit' to exit, /clear to reset memory.
============================================================

You: What is the difference between a list and a tuple in Python?

StudyMate: <thinking>
Let me break down the differences between Python lists and tuples:

1. Mutability:
   - Lists: Mutable (can be modified after creation)
   - Tuples: Immutable (cannot be changed after creation)

2. Syntax:
   - Lists: square brackets [1, 2, 3]
   - Tuples: parentheses (1, 2, 3)

3. Performance:
   - Lists: Slightly slower due to mutability overhead
   - Tuples: Faster and more memory-efficient

4. Use Cases:
   - Lists: Collections that need modification, dynamic data
   - Tuples: Fixed collections, dictionary keys, returning multiple values

5. Methods:
   - Lists: append(), extend(), remove(), etc.
   - Tuples: count(), index() only
</thinking>

Lists and tuples differ primarily in mutability: lists can be modified (appending, removing, changing elements), while tuples are immutable once created. Lists use square brackets [ ], tuples use parentheses ( ). Lists have more methods but are slightly slower; tuples are more memory-efficient and can be used as dictionary keys.

You: Calculate 2^10 + 5

StudyMate: <thinking>
I need to calculate 2^10 + 5. I'll use the calculator tool for accuracy.

1. 2^10 = 1024
2. 1024 + 5 = 1029
</thinking>

2^10 + 5 = 1029

You: quit

StudyMate: Goodbye! See you next session.
```

## Project Structure

```
studymate/
├── main.py           # Entry point / chat loop
├── mcp_server.py     # MCP server
├── memory.json       # Persistent conversation memory (auto-generated)
├── PROMPTS.md        # Prompt engineering documentation
├── README.md         # This file
├── requirements.txt  # Python dependencies
├── .gitignore        # Git ignore rules
└── src/
    ├── __init__.py   # Package marker
    ├── llm.py        # LLM API wrapper (Anthropic Claude)
    ├── memory.py     # Memory management (load/save)
    ├── tools.py      # Tool definitions and executors
    ├── rag.py        # RAG pipeline (chunking, embeddings, retrieval)
    └── mcp_tools.py  # MCP tool implementations
```

## MCP Server

StudyMate can be run as an MCP (Model Context Protocol) server, allowing other AI clients (like Claude Desktop) to use StudyMate's tools.

### Running the Server

```bash
python mcp_server.py
```

### Available MCP Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `ask_studymate` | Ask StudyMate a study question | `question` (str) |
| `add_to_knowledge_base` | Add text to RAG knowledge base | `text` (str), `source` (str) |
| `get_session_summary` | Get current session summary | (none) |

### Connecting Claude Desktop

Add StudyMate to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "studymate": {
      "command": "python",
      "args": ["C:/Users/diego/OneDrive/Documentos/Studymate2/mcp_server.py"],
      "env": {
        "ANTHROPIC_API_KEY": "your-key-here"
      }
    }
  }
}
```

**Note**: Update the path to match your actual installation directory.

Then restart Claude Desktop. StudyMate's tools will appear in the tools panel and can be used in any conversation.

### Using StudyMate Tools in Claude Desktop

Once connected, you can use StudyMate's tools directly:

```
User: Ask StudyMate to explain the concept of recursion.

Claude: I'll use the ask_studymate tool to get you a detailed explanation about recursion.

[Tool call: ask_studymate with question="Explain the concept of recursion"]

StudyMate responds with a detailed explanation...
```

## Prompt Engineering

StudyMate uses advanced prompt engineering techniques to provide high-quality educational assistance:

- **Role Prompting**: Specialized tutor for CS, math, and science
- **Chain-of-Thought**: Step-by-step reasoning before answers
- **Few-Shot Learning**: Example Q&A pairs to calibrate responses

For detailed documentation, see [PROMPTS.md](PROMPTS.md).

## RAG (Retrieval-Augmented Generation)

StudyMate can incorporate your own study materials into responses:

### Supported File Types
- **Text files**: `.txt` — Plain text documents
- **PDF files**: `.pdf` — Research papers, textbooks, notes

### How It Works
1. Documents are automatically chunked into ~300-500 word pieces
2. Chunks are embedded using local sentence transformers (no API cost)
3. When you ask a question, StudyMate retrieves relevant chunks
4. Answers cite sources using `[Source: filename, Chunk N]` format

### Example
```bash
$ python main.py --docs lectures/

StudyMate: Loading documents from: lectures/
  Ingested 3 chunks from lecture1.txt
  Ingested 4 chunks from lecture2.pdf
Ingested 7 chunks from 2 document(s).

You: What are the key differences between arrays and linked lists?

StudyMate: <thinking>
The user is asking about arrays vs linked lists. Let me search my study notes for relevant information.

[Retrieved Context]
[Source: lecture1.txt, Chunk 2] (Relevance: 0.87)
Arrays have contiguous memory allocation, which allows for O(1) random access. However, they have fixed size and insertion/deletion is O(n) in the worst case.

[Source: lecture2.pdf, Chunk 1] (Relevance: 0.82)
Linked lists consist of nodes with data and pointers. They allow dynamic sizing and O(1) insertion/deletion at known positions, but have O(n) access time.
[End Context]

Based the study notes above, answer the question. Cite which source/chunk you used using [Source: filename, Chunk N].
</thinking>

Arrays and linked lists differ in several key aspects:

**Memory Allocation**:
- Arrays use contiguous memory, enabling O(1) random access [Source: lecture1.txt, Chunk 2]
- Linked lists use non-contiguous memory with nodes connected by pointers

**Size Flexibility**:
- Arrays have fixed size (unless dynamically allocated)
- Linked lists allow dynamic sizing

**Performance**:
- Arrays: O(1) access, O(n) insertion/deletion [Source: lecture1.txt, Chunk 2]
- Linked lists: O(n) access, O(1) insertion/deletion at known positions [Source: lecture2.pdf, Chunk 1]

The choice depends on your use case: arrays for frequent access, linked lists for frequent modifications.
```

## Memory Management

StudyMate remembers your conversations across sessions:

- **Automatic Saving**: Every message is saved to `memory.json`
- **Session Restoration**: Previous conversations are loaded on startup
- **Manual Reset**: Use `/clear` to start fresh
- **Session Summary**: Ask "What did we discuss last time?" to review past topics

## Troubleshooting

### "Set ANTHROPIC_API_KEY environment variable"
Make sure you've set the API key before running StudyMate. See the Installation section.

### Module Not Found Errors
Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Slow First Run
The first time you use RAG features, StudyMate downloads the sentence transformer model (all-MiniLM-L6-v2). This takes ~1-2 minutes and only happens once.

### PDF Reading Errors
If PDF extraction fails, try converting the PDF to text manually or use a different PDF. PyPDF2 is used for PDF parsing.

## License

Educational use only — TET School of Business AI Engineering course.

## Contributing

This is a course project. If you're extending it, please maintain the project structure and coding standards established in the original implementation.
