# Winston-P2P-Network

Winston Peer to Peer Network

## Introduction

Winston Peer to Peer Network is a Websocket driven peer to peer network that utilizes client plugins to create an interactive environment.

## Core PlugIns

### Core PlugIn Features

    Slash Command Interpreter.
    * /test Send a network test.
    * /send Send a message on the network.
    Standard Input Interpreter
    * test Run a local Interpreter test.

## Client PlugIns

    Client plugin's allow users to build and use modules to build upon the core of the network.

## General Setup Instructions

    The Winston P2P Client application is used to create a client or server connection to the network. Users have the option of running a server node, or client. Server nodes host modules that users can interact with while clients utilize plugins that interaction with the nodes.

    To get started download or build the application file. Use the commands below to get started.
    #### Commands
    Start the Client and Server together.
    `app.exe`

    Start a Client on the localhost port 6969
    `app.exe port=6969`

    Start a Client and connect to a host and port
    `app.exe host=localhost port=6969`

    Start a Client & Server on a specific host and port
    `app.exe server=true host=localhost port=6969`

## PlugIn Setup Instructions

    The Winston P2P Network allows clients to install plugins. You can utilize pluging to communicate different processes on the network.

## Download Instructions

    You can download the latest version from the folder of the build you are looking for. Build Files can be found in the `/build` subfolder of the branch version.

## Build Instructions

    To build the application file, you will need to have NodeJS installed, and download or clone this repository. Once downloaded or cloned run the following commands.

    Install node modules.
    `npm i`

    Run the Build Process.
    `npm run build`
