import extension from "./index.js"

async function main() {
  const {registered, clients} = await extension({
    registerTool() {
      console.log("registerTool", arguments);
    },
    on() {
      console.log("on", arguments);
    }
  });

  console.log(await clients[0].callTool({
    name: "search-symbol",
    arguments: {
      symbol: "MaglevGraphBuilder"
    }
  }));
}

main();
