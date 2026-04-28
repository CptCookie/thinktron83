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

  clear() {
    this._element.innerHTML = "";
  }
}

export default Output;
