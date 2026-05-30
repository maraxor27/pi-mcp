// pi
import { Type } from "@mariozechner/pi-ai";
import { defineTool } from "@mariozechner/pi-coding-agent";

// mcp
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// nodejs
import { readFile } from "node:fs/promises";
import process from "process";

async function loadMCP() {
  const user_mcp = "~/.pi/agent/.mcp.json";
  const workdir_mcp = `${process.cwd()}/.mcp.json`;
  
  const mcps = {};
  for (const file of [user_mcp, workdir_mcp]) {
    try {
      const content = await readFile(file, { encoding: 'utf8' });
      const json_content = JSON.parse(content);
      
      if (typeof json_content != "object") {
        continue;
      }

      Object.assign(mcps, json_content);
    } catch {
      // Do nothing, this occurs, if the .mcp.json file doesn't exists.
    }
  }
  
  return mcps;
}

function convertMCPType(t) {
  if (t == undefined) {
    return Type.Object({});
  }

  const options = {};

  if (t.title != undefined) {
    options.title = t.title;
  }
  
  if (t.description != undefined) {
    options.description = t.description;
  }
  
  if (t.default != undefined) {
    options.default = t.default;
  }

  if (t.example != undefined) {
    options.example = t.example;
  }

  switch (t.type) {
    case "object": {
      const required = new Set(t.required)
      const properties = {};
      for (const key in t.properties) {
        const property = t.properties[key];

        if (required.has(key)) {
          properties[key] = convertMCPType(property);
        } else {
          properties[key] = Type.Optional(convertMCPType(property));
        }
      }

      return Type.Object(properties, options);
    } 
    case "array": {
      return Type.Array(convertMCPType(t.arguments), options);
    }
    case "string": {
      return Type.String(options);
    }
    case "integer": {
      return Type.Integer(options);
    }
    case "number": {
      return Type.Number(options);
    }
    case "boolean": {
      return Type.Boolean(options);
    }
    default: {
      throw `Type "${t.type}" not handled.`;
    }
  }
}

const clients = [];

/**
 * MCP Extension - Model Context Protocol Integration
 */
export default async function (pi) {
  
  const mcps = await loadMCP();
  for (const name in mcps) {
    const mcp = mcps[name];

    const client = new Client({ name, version: '1.0.0' });
    const transport = new StdioClientTransport({
        command: mcp.command,
        args: mcp.args,
        env: mcp.env,
        stderr: mcp.stderr,
        cwd: mcp.cwd
    });

    await client.connect(transport);
    clients.push(client);
  } 

  // Register MCP tools 
  const registered = [];
  for (const client of clients) {
    const info = { server: client.getServerVersion().name, tools: []}
    const tools = await client.listTools();
    for (const tool of tools.tools) {
      info.tools.push(tool.name);
      try {
        const parameters = convertMCPType(tool.inputSchema);
        pi.registerTool(defineTool({
          name: tool.name,
          description: tool.description,
          parameters,
          // Add execute to send the request to the mcp server
          async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
            const result = await client.callTool({
              name: tool.name,
              arguments: params
            });
            return result;
          }
        }));
      } catch (e) {
        console.error(e);
      }
    }

    registered.push(info);
  }

  // Notify when extension loads
	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("MCP extension loaded", "info");
    // ctx.ui.notify(JSON.stringify(registered), "info"); 
	});

  pi.on("error", (error) => {  
    console.error("Extension error:", error);  
    ctx.ui.notify(`Error: ${error.error}`, "error");  
  });

  return { registered, clients };
}
