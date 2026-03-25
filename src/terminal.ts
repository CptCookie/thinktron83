class Shell {
  canvas: HTMLCanvasElement;
  inputBuffer: string;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.inputBuffer = "";
  }

  input(event: KeyboardEvent) {
    if (event.key) {
      this.inputBuffer += event.key;
    }
  }

  handleReturn() {}
  render() {}
}

let canvas = <HTMLCanvasElement>document.getElementById("terminal");
let io = new Shell(canvas);
console.log(io);
