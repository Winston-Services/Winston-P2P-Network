import { textColors, formatText } from "../../client.js";

async function handleSlashCommand(data, client, clients) {
  //load slashcommands
  if (data.startsWith("/test")) {
    console.log("Testing Slash Command Handler.");
    client.send(JSON.stringify({ action: "test" }));
    clients.forEach((_client) => {
      if (_client.id !== _client.id)
        _client.send(JSON.stringify({ action: "test" }));
    });
    return;
  }
  if (data.startsWith("/send")) {
    let content = data.substring("/send ".length);
    client.send(JSON.stringify({ action: "message", content }));
    clients.forEach((_client) => {
      if (_client.id !== _client.id)
        _client.send(JSON.stringify({ action: "message", content }));
    });
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

export async function command(data, client, clients) {
  if (data === "test") {
    console.info(formatText("Test was successful.", textColors.Green));
  }
  console.log("->" + formatText(data.toString(), textColors.Yellow));
  if (data.toString().startsWith("/")) {
    return handleSlashCommand(data, client, clients);
  }
}

export async function exec(clients, client, input) {
  // console.log(formatText("Core Started.", textColors.Green));

  try {
    let cmd = JSON.parse(input);
    if (cmd.hasOwnProperty("action") && cmd.action === "test") {
      console.log("Test was successful.");
    }
    if (cmd.hasOwnProperty("action") && cmd.action === "message") {
      console.log(cmd.content);
    }
  } catch (error) {}
  //console.log(clients, client, input.toString());
  // handle console slash command interactions.
  /*
  clients.forEach((client) => {
    client.send(input);
  });
  console.log("sent: %s to %d other clients", input, clients.size);
  */
}
