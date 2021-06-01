import * as dasha from 'dasha-web';
import { merge, Interval } from './merge';
import { Editor } from './Editor';

interface ISpan {
  span: Span,
}

function sort(spans: ISpan[]): ISpan[] {
  return spans.sort(
    ({ span: [aStart, aLength] }, { span: [bStart, bLength] }) => (
      aStart - bStart || aLength - bLength
    ),
  );
}

function collapse(spans: ISpan[]): ISpan[] {
  const a = sort(spans);
  for (let i = 0; i < a.length; i++) {
    const { span: [start, length] } = a[i];
    if (a[i + 1]) {
      a[i] = {
        span: [start, Math.min(length, a[i + 1].span[0] - start)],
      };
      a.splice(i + 1, 0, {
        span: [start + length, spans[i + 1].span[0] - (start + length)],
      });
      i++;
    }
  }
  console.log(a, a.filter(({ span: [start, length] }) => length > 0));
  return a.filter(({ span: [start, length] }) => length > 0);
}

const bytes = document.getElementById('bytes')!;
const asm = document.getElementById('asm')!;

let focused = false;
const editor = new Editor(decodeURIComponent(location.hash.slice(1)) + '\n');

export type Span = [number, number, number?];

let insts: Part[] = [];

type Parent = {
  kind: string,
  span: Span,

  child: Part[],
};
type Part = Parent | string;

function renderElement(part: Part): HTMLElement | Text {
  switch (typeof part) {
    case 'string':
    case 'number':
      return document.createTextNode(part);
    case 'object':
      const span = document.createElement('span');
      const par: Parent = part;
      span.addEventListener('mouseenter', () => {
        highlights.push({
          span: par.span,
          klass: 'yellow',
        });
        renderEditor();
      });
      span.addEventListener('mouseleave', () => {
        highlights.splice(highlights.findIndex((hi) => hi.span[0] === par.span[0] && hi.span[1] === par.span[1]), 1);
        renderEditor();
      });
      switch (typeof par.child) {
        case 'string':
        case 'number':
          span.appendChild(renderElement(par.child));
          break;
        case 'object':
          for (const part of par.child) {
            span.appendChild(renderElement(part));
          }
          break;
      }
      return span;
    default:
      throw new Error('unsupported type');
  }
}

type Highlight = {
  span: Span,
  klass?: string,
};
let highlights: Highlight[] = [];

function renderEditor() {
  while (bytes.firstChild) bytes.removeChild(bytes.firstChild);
  const [x, y] = editor.cursor;
  Array.from(editor.lines()).forEach(([off, line], i) => {
    const div = document.createElement('div');
    const spans: Interval[] = [{
      kind: '',
      span: [0, line.length],
    }];
    if (i === y) {
      spans.push({
        kind: 'cursor',
        span: [x, 1],
      });
    }
    for (const { klass, span: [sx, sl] } of highlights) {
      if (x <= sx / 8 && sx / 8 <= x + line.length) {
        spans.push({
          kind: klass || '',
          span: [Math.floor(sx / 8), Math.floor(sl / 8)],
        });
      }
    }
    if (spans.length !== 1) {
      for (const span of merge(spans)) {
        const el = document.createElement('span');
        for (const kind of span.kinds) {
          kind && el.classList.add(kind);
        }
        el.textContent = line.substring(span.span[0], span.span[0] + span.span[1]) || ' ';
        div.appendChild(el);
      }
    } else {
      div.textContent = line;
    }
    bytes.appendChild(div);
  });
}

function render() {
  renderEditor();

  while (asm.firstChild) asm.removeChild(asm.firstChild);
  for (const inst of insts) {
    const div = document.createElement('div');
    div.appendChild(renderElement(inst));
    asm.appendChild(div);
  }
}

bytes.addEventListener('focus', () => {
  focused = true;
  render();
});

bytes.addEventListener('blur', () => {
  focused = false;
  render();
});

bytes.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && editor.cursor[0] > 0) {
    if (editor.moveLeft()) {
      render();
    }
  } else if (e.key === 'ArrowRight') {
    if (editor.moveRight()) {
      render();
    }
  } else if (e.key === 'ArrowUp') {
    if (editor.moveUp()) {
      render();
    }
  } else if (e.key === 'ArrowDown') {
    if (editor.moveDown()) {
      render();
    }
  } else if (e.key === 'Backspace') {
    if (editor.removeChar()) {
      render();
    }
  } else if (e.key === 'Enter') {
    editor.insertNewline();
    render();
  } else if (e.key.length === 1) {
    editor.insertChar(e.key);
    render();
  }
});

bytes.addEventListener('keyup', disasm);

function disasm() {
  try {
    const { Ok, Err } = dasha.disasm(editor.content);
    if (!Err) {
      console.log(Ok);
      insts = Ok;
      render();
    } else {
      console.error(Err);
    }
  } catch (e) {
    console.error(e);
  }
}

disasm();
