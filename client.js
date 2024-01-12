import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import WebSocket from "ws";
let clients = new Map();

const rl = readline.createInterface({ input, output });
rl.on("SIGINT", () => {
  rl.close();
  clients.forEach((client) => {
    client.close();
  });
  process.exit();
});

export function startClient(url = "ws://localhost:6969", proxy = false) {
  let MyClient = new WebSocket(url);
  if (!clients.has(url)) {
    clients.set(url, MyClient);
  }

  async function loadInternalClientModules(input) {
    clients.forEach((client) => {
      client.send(input);
    });
  }

  async function loadPlugInClientModules(input) {
    console.log("sent: %s to %d other clients", input, clients.size);
  }

  async function handleInternalClientModules(data) {
    if (Buffer.isBuffer(data)) {
      try {
        let jsonData = JSON.parse(data);
        console.log(jsonData);
      } catch (error) {
        console.log(error);
      }
      /*
      if (
        jsonData.hasOwnProperty("status") &&
        jsonData.status === "connected"
      ) {
        MyClient.id = jsonData.id;
      }
      */
      if (!proxy) await ask();
    }
  }

  async function handlePlugInClientModules(data) {}

  async function parseInput(input) {
    await loadInternalClientModules(input);
    await loadPlugInClientModules(input);
    // input rules go here.
  }

  MyClient.on("error", console.error);

  async function ask(prompt = "\rCommand>\n") {
    let answer = await rl.question(prompt);
    await parseInput(answer);
    if (!proxy) return ask();
  }

  async function open() {}

  async function handleMessage(data) {
    await handleInternalClientModules(data);
    await handlePlugInClientModules(data);
  }

  MyClient.on("open", open);
  MyClient.on("message", handleMessage);
  MyClient.on("close", () => {
    console.info("Client Closed.");
    rl.close();
  });
  return MyClient;
}
