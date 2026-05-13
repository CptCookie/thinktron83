import { wait } from "../utils";

export class Output {
  private _element: Element;

  constructor(outputContainer: Element) {
    this._element = outputContainer;
  }

  printLine(s: string) {
    let terminalLine = document.createElement("div");
    terminalLine.className = "out-line";
    terminalLine.innerText = s;
    this._element.appendChild(terminalLine);
  }

  printLines(s: string[]) {
    for (let l of s) {
      this.printLine(l);
    }
  }

  printError(e: Error | string) {
    let terminalLine = document.createElement("div");
    terminalLine.className = "out-line error";
    terminalLine.innerText = `${e}`;
    this._element.appendChild(terminalLine);
  }

  async printLineSlow(s: string, delay: number) {
    let terminalLine = document.createElement("div");
    terminalLine.className = "out-line";
    this._element.appendChild(terminalLine);
    for (let c of s) {
      terminalLine.textContent = `${terminalLine.textContent}${c}`;
      await wait(delay);
    }
  }

  clear() {
    console.log("clear");
    this._element.innerHTML = "";
  }
}

export default Output;
