# MCP Extension for Pi - Advanced Functionality

This is the MCP (Multimodal Chatbot Protocol) extension integrated into the Pi coding agent, featuring advanced functionality implemented in `index.js` that goes beyond basic file operations.

## Core Features Implemented

1. **Persistent Configuration Storage**
   - Loads and stores configuration via `.mcp.json` files
   - User-specific: `~/.pi/.mcp.json`
   - Work directory: `./.mcp.json`
   - Automatic loading on extension initialization

2. **Advanced Type Conversion System**
   - Converts MCP types to Pi's `Type` class
   - Handles all primitive types: string, integer, number, boolean, object, array
   - Supports optional properties and required fields validation
   - Processes title/description/example options for tool configuration

3. **Multimodal Server Integration**
   - Uses `@modelcontextprotocol/sdk/client/stdio.js` for communication
   - Establishes TCP connections to MCP servers
   - Automatically registers tools based on server response schema

4. **Tool Registration Engine**
   - Dynamically creates Pi coding agent tools from MCP tool definitions
   - Generates proper parameter schemas and execute functions
   - Handles client-server version negotiation

5. **Robust Error Handling**
   - Graceful handling of missing or invalid configuration files
   - Type validation with fallback to `Type.Void()`
   - Connection errors logged without breaking the extension

## Key Technical Details

- **`loadMCP()`**: Reads both user and work directory `.mcp.json` configs
- **`convertMCPType(t)`**: Comprehensive type conversion logic for all MCP types
- **`StdioClientTransport`**: Low-level communication transport with proper environment handling
- **Tool Execution**: Async tool call that forwards requests to MCP server

## Installation & Usage

1. Option 1: Place `index.js` in your extension directory:
- Install into `~/.pi/agent/extensions/mcp`
- The system will automatically load and register the module

2. Create `.mcp.json` if needed for configuration (auto-generated)
3. The system automatically loads and registers tools during Pi session start

Option 2: Clone repository instead:
```bash
git clone https://github.com/maraxor27/mcp.git ~/.pi/agent/extensions/mcp
The extension files are pre-configured and ready to use.

## Configuration Files

The extension searches for:
- User config: `~/.pi/.mcp.json` 
- Work config: `./.mcp.json`
If either file exists, it's parsed into the MCP configuration object.

## Extending Your Extension

To add new features or tools:
1. Follow the type conversion pattern in `convertMCPType()`
2. Define tool structures matching server schema expectations
3. Register your functions with proper parameter schemas using `defineTool()`
4. Ensure error handling follows the existing patterns

## Error Handling & Debugging

- Missing files: Continues without error (with warning in console)
- Invalid JSON: Skipped automatically
- Type conversion failures: Thrown as exceptions
- Client connection errors: Logged but extension continues
