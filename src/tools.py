"""
Tool Definitions and Executors for StudyMate
Provides calculator, web search, and datetime tools with safe execution
"""

import ast
import operator
from datetime import datetime
from typing import Dict, Any, Callable
from duckduckgo_search import DDGS


# Tool schemas following Anthropic's format
TOOL_SCHEMAS = [
    {
        "name": "get_current_datetime",
        "description": "Returns the current date and time. Use this when the user asks about the current time, date, or day of the week.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "calculator",
        "description": "Evaluates a mathematical expression and returns the result. Use this for any math calculation. The input should be a valid Python math expression string.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "A mathematical expression, e.g., '2 ** 10 + 5', 'sqrt(144)', 'log(100)'"
                }
            },
            "required": ["expression"]
        }
    },
    {
        "name": "web_search",
        "description": "Searches the web for information. Use this when the user asks about current events, recent information, or topics outside your training data.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query string"
                }
            },
            "required": ["query"]
        }
    }
]


def execute_get_current_datetime(**kwargs) -> str:
    """
    Get the current date and time

    Returns:
        Formatted datetime string
    """
    now = datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S (%A)")


def execute_calculator(expression: str, **kwargs) -> str:
    """
    Safely evaluate a mathematical expression using AST parsing (NO eval())

    This function parses the expression using Python's AST module and
    evaluates it using a safe whitelist of operations and functions.

    Args:
        expression: A mathematical expression string

    Returns:
        The result of the evaluation as a string, or an error message
    """
    # Allowed AST node types for safety
    allowed_nodes = (
        ast.Expression, ast.BinOp, ast.UnaryOp, ast.Constant,
        ast.Call, ast.Name, ast.Load,
        # Operators
        ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow,
        ast.Mod, ast.FloorDiv, ast.USub, ast.UAdd,
        ast.Num  # ast.Num for older Python versions
    )

    # Allowed mathematical functions and constants
    allowed_functions = {
        "abs": abs,
        "round": round,
        "min": min,
        "max": max,
        "sqrt": __import__("math").sqrt,
        "log": __import__("math").log,
        "log10": __import__("math").log10,
        "sin": __import__("math").sin,
        "cos": __import__("math").cos,
        "tan": __import__("math").tan,
        "pi": __import__("math").pi,
        "e": __import__("math").e,
        "exp": __import__("math").exp,
    }

    # Allowed mathematical operators
    allowed_operators = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Pow: operator.pow,
        ast.Mod: operator.mod,
        ast.FloorDiv: operator.floordiv,
    }

    def _eval(node: ast.AST) -> Any:
        """
        Recursively evaluate AST nodes safely

        Args:
            node: An AST node

        Returns:
            The evaluated value

        Raises:
            ValueError: If the node type or operation is not allowed
        """
        # Handle literal numbers/strings
        if isinstance(node, ast.Constant):
            return node.value
        elif isinstance(node, ast.Num):  # For Python < 3.8 compatibility
            return node.n

        # Handle function names and constants
        elif isinstance(node, ast.Name):
            if node.id in allowed_functions:
                return allowed_functions[node.id]
            raise ValueError(f"Unknown name: {node.id}")

        # Handle binary operations (a + b, a * b, etc.)
        elif isinstance(node, ast.BinOp):
            left = _eval(node.left)
            right = _eval(node.right)
            op_type = type(node.op)
            if op_type in allowed_operators:
                return allowed_operators[op_type](left, right)
            raise ValueError(f"Operator not allowed: {op_type}")

        # Handle unary operations (-a, +a)
        elif isinstance(node, ast.UnaryOp):
            operand = _eval(node.operand)
            if isinstance(node.op, ast.USub):
                return -operand
            elif isinstance(node.op, ast.UAdd):
                return +operand
            raise ValueError(f"Unary operator not allowed: {type(node.op)}")

        # Handle function calls (sqrt(144), log(100))
        elif isinstance(node, ast.Call):
            func = _eval(node.func)
            args = [_eval(arg) for arg in node.args]
            return func(*args)

        # Handle parentheses (expression group)
        elif isinstance(node, ast.Expression):
            return _eval(node.body)

        else:
            raise ValueError(f"Node type not allowed: {type(node).__name__}")

    try:
        # Parse the expression
        tree = ast.parse(expression, mode="eval")

        # Validate all nodes in the tree
        for ast_node in ast.walk(tree):
            # Allow Module and Expr nodes (part of the tree structure)
            if isinstance(ast_node, (ast.Module, ast.Expr)):
                continue
            if not isinstance(ast_node, allowed_nodes):
                raise ValueError(f"Disallowed AST node: {type(ast_node).__name__}")

        # Evaluate the expression
        result = _eval(tree.body)
        return str(result)

    except SyntaxError:
        return f"Error: Invalid syntax in expression '{expression}'"
    except ValueError as e:
        return f"Error: {e}"
    except ZeroDivisionError:
        return "Error: Division by zero"
    except Exception as e:
        return f"Error evaluating expression: {e}"


def execute_web_search(query: str, **kwargs) -> str:
    """
    Perform a web search using DuckDuckGo

    Args:
        query: The search query string

    Returns:
        Formatted search results or an error message
    """
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))

        if not results:
            return "No results found."

        output = []
        for i, r in enumerate(results, 1):
            output.append(f"{i}. {r['title']}\n   {r['href']}\n   {r['body']}")

        return "\n\n".join(output)

    except Exception as e:
        return f"Search error: {e}"


# Map tool names to their executor functions
TOOL_EXECUTORS: Dict[str, Callable[..., str]] = {
    "get_current_datetime": execute_get_current_datetime,
    "calculator": execute_calculator,
    "web_search": execute_web_search,
}


def execute_tool_call(tool_name: str, tool_input: Dict[str, Any]) -> str:
    """
    Execute a tool call by name with the given input

    Args:
        tool_name: The name of the tool to execute
        tool_input: Dictionary of input parameters for the tool

    Returns:
        The result of the tool execution as a string
    """
    if tool_name not in TOOL_EXECUTORS:
        return f"Error: Unknown tool '{tool_name}'"

    executor = TOOL_EXECUTORS[tool_name]

    try:
        return executor(**tool_input)
    except Exception as e:
        return f"Error executing {tool_name}: {e}"
