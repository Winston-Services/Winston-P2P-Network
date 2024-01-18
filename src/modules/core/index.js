import * as ethers from "ethers";
import {
  textColors,
  formatText,
  ask,
  loadedModules,
  startClient
} from "../../client.js";

async function handleSlashCommand(data, client, clients) {
  //console.log("handleSlashCommand", data.toString());
  //load slashcommands
  if (data.startsWith("/test")) {
    // console.log("Test was successful.");
    clients.forEach((_client) => {
      // console.log(_client);
      if (client === _client)
        _client.send(
          JSON.stringify({
            action: "test",
            clientId: client.clientId,
            timestamp: +new Date()
          })
        );
    });
    return;
  }
  if (data.startsWith("/send")) {
    let content = data.substring("/send ".length);
    // console.log(client.clientId, content);
    clients.forEach((_client) => {
      // console.log(_client);
      if (client === _client)
        _client.send(
          JSON.stringify({
            action: "message",
            clientId: client.clientId,
            content,
            timestamp: +new Date()
          })
        );
    });
    return;
  }
  if (data.startsWith("/plugins")) {
    console.log("** Winston P2P Core Plug-Ins **");
    if (loadedModules.hasOwnProperty("core")) {
      console.log("Winston P2P Core Installed : ✅");
    }
    if (loadedModules.hasOwnProperty("plugIns")) {
      let plugIns = Object.keys(loadedModules.plugIns);
      console.log("Winston P2P Client Plug-Ins : %d", plugIns.length);
    }
    return;
    // console.log(loadedModules);
  }
  function connect(data, client, clients) {
    let commandStr = data.substring("/connect ".length);
    let [host, port] = commandStr.split(" ");
    return startClient(`ws://${host}:${port}`, true);
  }
  if (data.startsWith("/connect")) {
    return connect(data);
  }
}

export const name = "Core";
export const description = "Winston P2P Core";
export const version = "0.0001";
export async function command(data, client, clients) {
  if (data === "test") {
    console.info(formatText("Test was successful...", textColors.Green));
  }
  console.log("->" + formatText(data.toString(), textColors.Yellow));
  if (data.toString().startsWith("/")) {
    return handleSlashCommand(data, client, clients);
  }
}
let connections = [];
let messageHash = new Set();
export function exec(clients, client, input) {
  // console.log("exec", input.toString());
  try {
    // {"status":"connected","clientId":"847395a4-bcac-444a-81e8-d624402b8c1f"}
    let cmd = JSON.parse(input);
    if (cmd.hasOwnProperty("status") && cmd.status === "connected") {
      console.log("Client Id : %s", cmd.clientId);
      clients.forEach((_client) => {
        if (client === _client) {
          console.log("Client Connected.");
          _client.clientId = cmd.clientId;
          // _client.send(input);
          connections.push(cmd.clientId);
        }
      });
    }
  } catch (error) {}
  try {
    let cmd = JSON.parse(input);
    if (cmd.hasOwnProperty("action") && cmd.action === "test") {
      let inputBytes = ethers.toUtf8Bytes(input.toString(), "NFKC");
      let salt = ethers.id(cmd.clientId);
      // Compute the scrypt
      let hash = ethers.scryptSync(inputBytes, salt, 1024, 8, 1, 16);
      //console.log(cmd.clientId, cmd.content, hash);
      if (!messageHash.has(hash)) {
        console.log("Test was successful.");
        messageHash.add(hash);
        clients.forEach(function each(_client) {
          _client.send(input);
        });
      }
      return;
    }
    if (cmd.hasOwnProperty("action") && cmd.action === "message") {
      let inputBytes = ethers.toUtf8Bytes(input.toString(), "NFKC");
      let salt = ethers.id(cmd.clientId);
      // Compute the scrypt
      let hash = ethers.scryptSync(inputBytes, salt, 1024, 8, 1, 16);
      //console.log(cmd.clientId, cmd.content, hash);
      if (!messageHash.has(hash)) {
        console.log("%s :> %s", cmd.clientId, cmd.content);
        messageHash.add(hash);
        clients.forEach(function each(_client) {
          _client.send(input);
        });
      }
      return;
    }
  } catch (error) {
    console.log(error);
  }
}
