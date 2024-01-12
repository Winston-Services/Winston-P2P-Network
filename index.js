import { v4 } from "uuid";
import { WebSocketServer } from "ws";
import { argv } from "node:process";
import { startClient } from "./client.js";

const connections = new Map();

function getConnectionId() {
  let id = v4();
  if (connections.has(id)) {
    return getConnectionId();
  }
  connections.set(id, {});
  return id;
}

function handleMessage(ws, client) {
  // console.log(ws, client);
  return (data) => {
    // ws.emit(JSON.stringify({ data }));

    //local conneections
    connections.forEach((connection) => {
      if (connection.id !== client.id) connection.ws.send(data.toString());
    });
    console.log("received: %s", data);
  };
}

async function startServer(port = 6969) {
  const wss = new WebSocketServer({ port });
  wss.on("connection", function connection(ws) {
    let clientId = getConnectionId();
    let client = connections.get(clientId);
    client.id = clientId;
    client.ws = ws;
    ws.on("error", console.error);
    ws.on("message", handleMessage(ws, client));
    ws.on("close", () => {
      connections.delete(clientId);
      console.info("Client %s disconnected.", clientId);
    });
    // console.log(client);
    console.info("Client %s connected.", clientId);
    ws.send(JSON.stringify({ status: "connected", id: clientId }));
  });
}

function parseArgV() {
  let host;
  let port;
  let server = false;
  let vals = argv.slice(2);
  for (let i = 0; i < vals.length; i++) {
    if (vals[i].toLowerCase().startsWith("host=")) {
      host = String(vals[i].substring("host=".length));
    }
    if (vals[i].toLowerCase().startsWith("port=")) {
      port = Number(vals[i].substring("port=".length));
    }
    if (vals[i].toLowerCase().startsWith("server")) {
      server = Boolean(vals[i].substring("server=".length));
      // console.log("Testing : ", server);
    }
  }
  return {
    host: host || "localhost",
    port: port || 6969,
    server
  };
}

async function handleCommand() {
  const { host, port, server } = parseArgV();
  if (server) {
    startServer(port);
  }
  return startClient(`ws://${host}:${port}`);
}

async function main() {
  if (argv.length > 2) {
    return await handleCommand();
  } else {
    let port = process.env.PORT || 6969;
    startServer(port);
    startClient("ws://localhost:" + port);
  }
}

main();
