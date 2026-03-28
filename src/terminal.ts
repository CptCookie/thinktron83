import { FileSystem } from "./FileSystem";

const TEXT_INPUT = /^[a-zA-Z\s]$/;

class ThinkTron {
  input: HTMLInputElement;
  output: Element;
  fs: FileSystem;

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
    this.fs = new FileSystem();
  }

  handleCommand(command: string) {
    console.log("command: " + command);
  }
}

function handleKeyEvent(event: KeyboardEvent) {
  if (event.key === "Enter" && io) {
    let prompt = io.input.value;
    io.input.value = "";
    io.handleCommand(prompt);
  }
}

let terminal = <HTMLDivElement>document.getElementById("terminal");
let io: null | ThinkTron = null;
if (terminal) {
  io = new ThinkTron(terminal);
  console.log(io);
  io.input.addEventListener("keypress", handleKeyEvent);
}
