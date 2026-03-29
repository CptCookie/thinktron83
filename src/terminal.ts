import { Command } from "./Commands";
import { FileSystem } from "./FileSystem";

export class ThinkTron {
  input: HTMLInputElement;
  output: Element;
  fileSystem: FileSystem;
  commands: Record<string, Command> = {};

  constructor(terminalContainer: HTMLElement) {
    let input = terminalContainer.getElementsByTagName("input");
    let output = terminalContainer.getElementsByClassName("output");

    if (input.length == 0) {
      throw new Error("missing Input");
    }

    if (output.length == 0) {
      throw new Error("missing output");
    }

    this.input = input[0];
    this.output = output[0];
    this.fileSystem = new FileSystem();
    this.initCommands();
  }

  initCommands() {
    this.commands = Command.getAllCommands();
    Object.values(this.commands).forEach((c) => c.connectTerminal(this));
  }

  handleCommand(command: string) {
    console.log(command);
    if (command in this.commands) {
      this.commands[command].execute(command);
    } else {
      this.println(`Command not found "${command}"`);
    }
  }

  println(print: string) {
    let line = document.createElement("pre");
    line.className = "out-line";
    line.innerText = print;
    this.output.appendChild(line);
  }
}

function handleKeyEvent(event: KeyboardEvent) {
  if (event.key === "Enter" && io) {
    let prompt = io.input.value;
    io.input.value = "";
    io.println("$ " + prompt);
    io.handleCommand(prompt);
  }
}

let terminal = <HTMLDivElement>document.getElementById("terminal");
export let io: null | ThinkTron = null;
if (terminal) {
  io = new ThinkTron(terminal);
  console.log(io);
  io.input.addEventListener("keypress", handleKeyEvent);
}
