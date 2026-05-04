import Output from "./interface/output";
import Shell from "./Shell";
import Session from "./interface/session";

class ThinkTron {
  input: HTMLInputElement;
  out: Output;
  shell: Shell;
  session: Session = new Session();
  sessionPtr = -1;

  constructor(containerId: string) {
    let container = document.getElementById(containerId);
    if (!container) {
      throw new Error("can not find terminal container");
    }
    let input = container.getElementsByTagName("input");
    let output = container.getElementsByClassName("output");

    if (input.length == 0) {
      throw new Error("missing Input");
    }

    if (output.length == 0) {
      throw new Error("missing output");
    }

    this.input = input[0];
    this.out = new Output(output[0]);
    this.shell = new Shell(this.out, this.input);

    container.addEventListener("keydown", this.handleKeyEvent);
  }

  handleKeyEvent = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp") {
      this.sessionback();
    } else if (event.key === "ArrowDown") {
      this.sessionforward();
    } else if (event.key === "Enter" && io) {
      let prompt = this.input.value;
      io.input.value = "";
      this.out.printLine("$ " + prompt);
      this.session.add(prompt);
      this.handleCommand(prompt);
    } else {
      this.session.resetReadIdx();
    }
  };

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
