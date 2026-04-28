import Output from "./interface/output";
import Shell from "./Shell";

class ThinkTron {
  input: HTMLInputElement;
  out: Output;
  shell: Shell;
  session: string[] = [];
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
    console.log(event.key);
    if (event.key === "ArrowUp") {
      this.sessionback();
    }
    if (event.key === "ArrowDown") {
      this.sessionforward();
    } else if (event.key === "Enter" && io) {
      try {
        let prompt = io.input.value.trim();
        io.input.value = "";
        this.out.printLine("$ " + prompt);
        this.session.push(prompt);
        this.shell.handleCommand(prompt);
      } catch (e) {
        this.out.printError(e as Error);
      }
    } else {
      this.sessionPtrReset();
    }
  };

  sessionback() {
    if (this.sessionPtr === -1) {
      this.sessionPtr = this.session.length - 1;
    } else {
      this.sessionPtr = this.sessionPtr + 1;
    }
    console.log(this.sessionPtr);
    if (this.sessionPtr === -1) {
      this.input.value = "";
    } else {
      this.input.value = this.session[this.sessionPtr];
    }
  }

  sessionforward() {
    if (this.sessionPtr === this.session.length - 1 || this.sessionPtr === -1) {
      this.sessionPtr = -1;
      this.input.value = "";
    } else {
      this.sessionPtr = this.sessionPtr - (1 % this.session.length);
      this.input.value = this.session[this.sessionPtr];
    }
    console.log(this.sessionPtr);
  }

  sessionPtrReset() {
    this.sessionPtr = -1;
  }
}

let terminal = <HTMLDivElement>document.getElementById("terminal");
export let io: null | ThinkTron = null;
if (terminal) {
  io = new ThinkTron("terminal");
  console.log(io);
}

export default ThinkTron;
