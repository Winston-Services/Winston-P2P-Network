import WebSocket from "ws";
import fs from "fs";
import path from "path";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

let clients = new Map();
export const loadedModules = {};
export let textColors = {
  Gray: 30,
  Red: 31,
  Green: 32,
  Yellow: 33,
  Blue: 34,
  Pink: 35,
  Cyan: 36,
  White: 37
};

export async function loadInputModules(answer, proxy, client, clients) {
  try {
    loadedModules.core.command(answer, client, clients);
  } catch (error) {
    console.trace(error);
  }
  // console.log(loadedModules);
  let plugIns = Object.keys(loadedModules.plugIns);
  for (let plugInIndex = 0; plugInIndex < plugIns.length; plugInIndex++) {
    loadedModules.plugIns[plugIns[plugInIndex]].command(
      answer,
      client,
      clients
    );
  }
  return ask(proxy, client, clients);
}

export async function ask(proxy, client, clients) {
  if (!proxy) return;
  const rl = readline.createInterface({ input, output });
  rl.on("SIGINT", () => {
    rl.close();
    process.exit();
  });
  let answer = await rl.question(
    `\r${formatText("Command ->", textColors.Blue)}\n`
  );
  rl.close();
  await loadInputModules(answer, proxy, client, clients);
}

export function formatText(txt, color = textColors.Cyan) {
  return `\u001b[1;33;${color}m${txt}\u001b[1;33;00m`;
}

async function handleInternalClientModules(data, client) {
  // console.log("handleInternalClientModules", data, client);

  console.log(data);
  if (loadedModules.hasOwnProperty("core")) {
    try {
      loadedModules.core.exec(clients, data, client);
    } catch (error) {
      console.error(error);
      throw Error("Invalid Core Start-Up.");
    }
  }
  if (loadedModules.hasOwnProperty("plugIns")) {
    let plugIns = Object.keys(loadedModules.plugIns);
    for (let plugInIndex = 0; plugInIndex < plugIns.length; plugInIndex++) {
      try {
        loadedModules.plugIns[plugIns[plugInIndex]].exec(clients, data, client);
      } catch (error) {
        console.trace(error);
      }
    }
  }
}

export function startClient(url = "ws://localhost:6969", proxy = false) {
  let MyClient = new WebSocket(url);

  MyClient.on("open", async () => {
    console.log(formatText("Connected to Winston.", textColors.Green));
    if (!loadedModules.hasOwnProperty("core")) {
      console.log(formatText("Loading Winston Core PlugIns", textColors.Green));
      const core = await import("./modules/core/index.js");
      loadedModules.core = core;
      console.log(formatText("Winston Core PlugIns Loaded", textColors.Cyan));
    }

    if (!loadedModules.hasOwnProperty("plugIns")) {
      loadedModules.plugIns = {};
      console.log(
        formatText("Loading Winston Client PlugIns", textColors.Green)
      );
      const plugInDirContents = fs.readdirSync(
        path.resolve(`./src/modules/plugIn`)
      );
      // console.log(plugInDirContents);
      for (
        let fileIndex = 0;
        fileIndex < plugInDirContents.length;
        fileIndex++
      ) {
        try {
          console.log(
            formatText("Loading Winston Client PlugIn : %s", textColors.Green),
            formatText(plugInDirContents[fileIndex], textColors.White)
          );
          console.log("Adding Plug-In : %s", plugInDirContents[fileIndex]);
          const plugIn = await import(
            `./modules/plugIn/${plugInDirContents[fileIndex]}/index.js`
          );
          console.log("Plug-In Loaded", plugIn);
          loadedModules.plugIns[plugInDirContents[fileIndex]] = plugIn;
          console.log(
            formatText("Winston Client PlugIn Loaded: %s", textColors.Cyan),
            formatText(plugInDirContents[fileIndex], textColors.Green)
          );
        } catch (error) {
          console.log(error);
        }
      }
      console.log(formatText("Winston Client PlugIns Loaded", textColors.Cyan));
    }
    if (!proxy) ask(true, MyClient, clients);
  });
  MyClient.on("error", console.error);
  MyClient.on(
    "message",
    handleInternalClientModules.bind(handleInternalClientModules, MyClient)
  );
  MyClient.on("close", () => {
    console.info(formatText("Client Closed.", textColors.Red));
    process.exit();
    // exec closures.
  });
  return MyClient;
}
