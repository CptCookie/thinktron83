/**
 * Ringbuffer with mirror into the local storage
 */

const SESSION_KEY = "terminalSession";

class Session {
  buffer: string[];
  readIndex: number = -1;
  writeIndex: number = 0;

  constructor(private maxSize: number = 100) {
    this.buffer = Array(maxSize);
    this.loadFromLocalStorage();
  }

  get storedLen() {
    return this.buffer.filter((v) => !!v).length;
  }

  delete() {
    this.buffer = Array(this.maxSize);
    this.writeToLocalStorage();
  }

  resetReadIdx() {
    this.readIndex = (this.writeIndex - 1 + this.maxSize) % this.maxSize;
  }

  add(elem: string) {
    this.buffer[this.writeIndex] = elem;
    this.writeIndex = (this.writeIndex + 1) % this.maxSize;
    this.resetReadIdx();
    this.writeToLocalStorage();
  }

  getPrev(): string | undefined {
    let endPos = !!this.buffer.at(this.writeIndex) ? this.writeIndex : 0;
    if (this.readIndex == endPos) {
      return this.buffer.at(this.readIndex);
    } else if (this.readIndex >= 0) {
      let e = this.buffer.at(this.readIndex);
      this.readIndex = (this.readIndex - 1 + this.storedLen) % this.storedLen;
      return e;
    }

    return undefined;
  }

  getNext(): string | undefined {
    let endpos = this.writeIndex - 1;
    if (this.readIndex === endpos) {
      // we did catch up with the write again and return to user import
      return undefined;
    }

    if (this.readIndex >= 0) {
      this.readIndex = (this.readIndex + 1 + this.storedLen) % this.storedLen;
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
