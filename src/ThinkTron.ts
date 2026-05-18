import Input from "./interface/input";
import Output from "./interface/output";
import Session from "./interface/session";
import Shell from "./Shell";
import logo from "../public/static/logo/ascii.txt?raw";
import { wait } from "./utils";

class ThinkTron {
  input: Input;
  out: Output;
  shell: Shell;
  session: Session = new Session();
  sessionPtr = -1;

  constructor(containerId: string) {
    let container = document.getElementById(containerId);
    if (!container) {
      throw new Error("can not find terminal container");
    }
    let input = container.getElementsByClassName("input");
    let output = container.getElementsByClassName("output");

    if (output.length == 0) {
      throw new Error("missing output");
    } else {
      this.out = new Output(output[0]);
    }

    this.shell = new Shell(this.out);
    if (input.length == 0) {
      throw new Error("missing Input");
    } else {
      this.input = new Input(input[0]);
      this.input.disable();
    }

    this.start_sequence().finally(() => {
      document.addEventListener("keydown", this.handleKeyEvent);
      this.input.enable();
    });
  }

  handleKeyEvent = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp") {
      this.sessionback();
    } else if (event.key === "ArrowDown") {
      this.sessionforward();
    } else if (event.key === "ArrowLeft") {
      this.input.shiftLeft();
    } else if (event.key === "ArrowRight") {
      this.input.shiftRight();
    } else if (event.key === "Backspace") {
      length = 1;
      if (event.ctrlKey) {
        length = 100;
      }
      this.input.deleteLeft(length);
    } else if (event.key === "Delete") {
      length = 1;
      if (event.ctrlKey) {
        length = 100;
      }
      this.input.deleteRight(length);
    } else if (event.key === "Enter" && io) {
      let prompt = this.input.value;
      io.input.value = "";
      this.out.printLine(">_ " + prompt);
      this.session.add(prompt);
      this.handleCommand(prompt);
    } else if (/^[\w\-\_\/\s\.]{1}$/.test(event.key)) {
      this.session.resetReadIdx();
      this.input.handleKeyEvent(event);
    }
  };

  async start_sequence() {
    for (let line of logo.split("\n")) {
      await this.out.printLineSlow(line, 1);
      await wait(10);
    }
  }

  handleCommand(input: string) {
    try {
      let prompt = input.trim();
      if (prompt == "clear-history") {
        this.session.delete();
      } else {
        this.shell.handleCommand(prompt);
      }
    } catch (e) {
      this.out.printError(e as Error);
    }
  }
  sessionback() {
    let e = this.session.getPrev();
    if (e) {
      this.input.value = e;
    }
  }

  sessionforward() {
    let e = this.session.getNext();
    if (e) {
      this.input.value = e;
    } else {
      this.input.value = "";
    }
  }
}

let terminal = <HTMLDivElement>document.getElementById("terminal");
export let io: null | ThinkTron = null;
if (terminal) {
  io = new ThinkTron("terminal");
}

export default ThinkTron;
