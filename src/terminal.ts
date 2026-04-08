import { Command } from "./Commands";
import { FileSystem } from "./FileSystem";

class ThinkTron {
  input: HTMLInputElement;
  output: Element;
  fileSystem: FileSystem;
  commands: Record<string, Command> = {};
  repl: any; // terminal repl will live here
  runtime: any; //active programm or command lives here

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
    this.commands = Command.getAllCommands();

    terminalContainer.addEventListener("keydown", this.handleKeyEvent);
  }

  handleKeyEvent = (event: KeyboardEvent) => {
    if (event.key === "Enter" && io) {
      let prompt = io.input.value.trim();
      io.input.value = "";
      io.println("$ " + prompt);
      io.handleCommand(prompt);
    }
  };

  handleCommand(prompt: string) {
    let command = prompt.split(" ")[0];
    console.log(command);
    if (command in this.commands) {
      console.log(`calling command ${command} with ${prompt}`);
      this.commands[command].execute(this, prompt);
    } else {
      this.println(`Command not found "${command}"`);
    }
  }

  println(print: string) {
    let line = document.createElement("div");
    line.className = "out-line";
    line.innerText = print;
    this.output.appendChild(line);
  }
}

let terminal = <HTMLDivElement>document.getElementById("terminal");
export let io: null | ThinkTron = null;
if (terminal) {
  io = new ThinkTron(terminal);
  console.log(io);
}

export default ThinkTron;
