import { Editor } from 'ts-nano';

type Inst = {
  child: string | (string | Inst)[],
  span: [number, number] | [number, number, number],
};

import('dasha-web').then((dasha) => {
  const error = document.getElementById('error')!;
  const bytes = document.getElementById('bytes')!;
  const asm = document.getElementById('asm')!;

  const editor = new Editor(bytes);
  editor.addEventListener('textchange', () => {
    editor.clearHighlights();
    disasm();
  });

  function render(insts: Inst[]) {
    console.log(insts);
    while (asm.firstChild) {
      asm.removeChild(asm.firstChild);
    }
    function renderChild(inst: string | Inst): Text | HTMLElement {
      if (typeof inst === 'string') {
        return document.createTextNode(inst);
      } else {
        if (typeof inst.child === 'string') {
          const span = document.createElement('span');
          span.textContent = inst.child;
          return span;
        } else {
          const span = document.createElement('span');
          span.addEventListener('mouseenter', () => {
            editor.addHighlight([inst.span[0], inst.span[1], 'bg-danger']);
            editor.addHighlight([inst.span[0], inst.span[1], 'text-white']);
          });
          span.addEventListener('mouseleave', () => {
            editor.removeHighlight([inst.span[0], inst.span[1], 'bg-danger']);
            editor.removeHighlight([inst.span[0], inst.span[1], 'text-white']);
          });
          for (const child of inst.child) {
            span.appendChild(renderChild(child));
          }
          return span;
        }
      }
    }
    for (const inst of insts) {
      const line = document.createElement('div');
      line.appendChild(renderChild(inst));
      asm.appendChild(line);
    }
  }

  function setError(err: Error | null) {
    if (err) {
      error.classList.remove('d-none');
      error.textContent = `Error: ${err.message}`;
    } else {
      error.classList.add('d-none');
    }
  }

  function disasm() {
    try {
      const { Ok, Err } = dasha.disasm(editor.content);
      if (!Err) {
        render(Ok);
        setError(null);
      } else {
        console.error(Err);
        setError(new Error(Err));
      }
    } catch (e) {
      console.error(e);
      setError(e);
    }
  }

  disasm();
});
