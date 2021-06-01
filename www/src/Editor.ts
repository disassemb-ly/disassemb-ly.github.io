export class Editor {
  constructor(private _content = '', private _cursor: [number, number] = [0, 0]) {}

  public get content(): string {
    return this._content.slice();
  }

  public get cursor(): [number, number] {
    return [...this._cursor];
  }

  public moveLeft(): boolean {
    if (this._cursor[0] > 0) {
      this._cursor[0] -= 1;
      return true;
    }
    return false;
  }

  public moveRight(): boolean {
    if (this._cursor[0] < Array.from(this.lines())[this._cursor[1]][1].length) {
      this._cursor[0] += 1;
      return true;
    }
    return false;
  }

  public moveUp(): boolean {
    if (this._cursor[1] > 0) {
      this._cursor[1] -= 1;
      return true;
    }
    return false;
  }

  public moveDown(): boolean {
    if (this._cursor[1] < Array.from(this.lines()).length - 1) {
      this._cursor[1] += 1;
      return true;
    }
    return false;
  }

  public removeChar(): boolean {
    const [off, line] = Array.from(this.lines())[this._cursor[1]];
    const len = off + this._cursor[0];
    if (len > 0) {
      if (this._cursor[0] > 0) {
        this._cursor[0] -= 1;
      } else if (this._cursor[1] > 0) {
        this._cursor[1] -= 1;
        this._cursor[0] = Array.from(this.lines())[this._cursor[1]][1].length;
      }
      this._content = [
        this._content.slice(0, len - 1),
        this._content.slice(len),
      ].join('');
      return true;
    }
    return false;
  }

  public insertChar(char: string) {
    const [off, line] = Array.from(this.lines())[this._cursor[1]];
    const len = off + this._cursor[0];
    this._content = [
      this._content.slice(0, len),
      char,
      this._content.slice(len),
    ].join('');
    this._cursor[0] += 1;
  }

  public insertNewline() {
    const [off, line] = Array.from(this.lines())[this._cursor[1]];
    const len = off + this._cursor[0];
    this._content = [
      this._content.slice(0, len),
      '\n',
      this._content.slice(len),
    ].join('');
    this._cursor[0] = 0;
    this._cursor[1] += 1;
  }

  public lines(): Iterable<[number, string]> {
    let content = this._content;
    const cursor = this.cursor;
    let offset = 0;
    return new class implements Iterable<[number, string]> {
      [Symbol.iterator]() {
        return {
          next(): IteratorResult<[number, string]> {
            if (content.length > 0) {
              const length = content.indexOf('\n') >= 0 ? content.indexOf('\n') : content.length;
              const value: [number, string] = [offset, content.slice(0, length)];
              offset = offset + length + 1;
              content = content.slice(length + 1);
              return { done: false, value };
            } else {
              return { done: true, value: null };
            }
          }
        };
      }
    };
  }
}
