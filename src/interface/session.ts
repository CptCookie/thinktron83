/**
 * Ringbuffer with mirror into the local storage
 */

const SESSION_KEY = "terminalSession";

class Session {
  buffer: string[];
  realLength: number = 0;
  readIndex: number = -1;
  writeIndex: number = 0;

  constructor(private maxSize: number = 100) {
    this.buffer = Array(maxSize);
    this.loadFromLocalStorage();
  }

  delete() {
    this.buffer = Array(this.maxSize);
    this.writeToLocalStorage();
  }

  get isScrolling() {
    return this.readIndex >= -1;
  }

  resetReadIdx() {
    this.readIndex = (this.writeIndex - 1 + this.maxSize) % this.maxSize;
  }
  add(elem: string) {
    this.buffer[this.writeIndex] = elem;
    this.writeIndex = (this.writeIndex + 1) % this.maxSize;
    this.resetReadIdx();
    this.writeToLocalStorage();
    this.calcRealLength();
  }

  calcRealLength() {
    this.realLength = this.buffer.filter((v) => !!v).length;
  }

  getPrev(): string | undefined {
    if (this.readIndex >= 0) {
      let e = this.buffer.at(this.readIndex);
      this.readIndex =
        (this.readIndex - 1 + this.buffer.length) % this.realLength;
      return e;
    }

    return undefined;
  }

  getNext(): string | undefined {
    if (this.readIndex >= 0) {
      this.readIndex =
        (this.readIndex + 1 + this.buffer.length) % this.realLength;
      return this.buffer.at(this.readIndex);
    }

    return undefined;
  }

  writeToLocalStorage() {
    let sessionReorder: string[] = this.buffer.slice(this.writeIndex);
    sessionReorder = sessionReorder.concat(
      this.buffer.slice(0, this.writeIndex),
    );
    sessionReorder = sessionReorder.filter((v) => !!v);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(sessionReorder));
  }

  loadFromLocalStorage() {
    try {
      let storedSession = window.localStorage.getItem(SESSION_KEY);
      if (storedSession) {
        let session: string[] = JSON.parse(storedSession);
        for (let elem of session) {
          this.add(elem);
        }
      }
    } catch (e) {
      console.error(`could not load session b/c {$e}`);
    }
  }
}

export default Session;
