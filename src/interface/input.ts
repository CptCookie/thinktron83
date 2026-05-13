class Input {
  root: Element;
  line: HTMLDivElement;
  prompt: HTMLSpanElement;
  left: HTMLSpanElement;
  right: HTMLSpanElement;
  disabled: boolean = false;

  constructor(container: Element) {
    this.root = container;
    this.line = document.createElement("div");
    this.line.className = "line input";

    this.prompt = document.createElement("span");
    this.prompt.className = "prompt";
    this.prompt.textContent = ">_";
    this.line.appendChild(this.prompt);
    this.left = document.createElement("span");
    this.line.appendChild(this.left);
    let cursor = document.createElement("span");
    cursor.className = "cursor";
    this.line.appendChild(cursor);
    this.right = document.createElement("span");
    this.line.appendChild(this.right);

    container.appendChild(this.line);
  }

  get value() {
    return this.left.textContent + this.right.textContent;
  }

  set value(value: string) {
    this.left.textContent = value;
    this.right.textContent = "";
  }

  handleKeyEvent(event: KeyboardEvent) {
    if (!this.disabled) {
      this.left.textContent += event.key;
    }
  }

  shiftLeft() {
    if (this.left.textContent.length > 0) {
      this.right.textContent =
        this.left.textContent.at(-1) + this.right.textContent || "";
      this.left.textContent = this.left.textContent.slice(0, -1);
    }
  }

  shiftRight() {
    if (this.right.textContent.length > 0) {
      this.left.textContent = `${this.left.textContent || ""}${this.right.textContent.at(0)}`;
      this.right.textContent = this.right.textContent.slice(1);
    }
  }

  deleteLeft(n: number) {
    if (this.left.textContent.length > 0) {
      this.left.textContent = this.left.textContent.slice(0, n * -1);
    }
  }

  deleteRight(n: number) {
    if (this.right.textContent.length > 0) {
      this.right.textContent = this.right.textContent.slice(n);
    }
  }

  disable() {
    this.root.removeChild(this.line);
  }

  enable() {
    this.root.appendChild(this.line);
  }
}

export default Input;
