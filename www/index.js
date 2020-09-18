import * as wasm from "dasha-web";

(() => {
  let err, out, code;
  const container = document.getElementById("container");
  const el = document.getElementById("input-data");

  el.addEventListener("keyup", (e) => {
    try {
      const insts = wasm.disasm(el.value);

      if (err) {
        container.removeChild(err);
        err = null;
      }

      if (!out) {
        out = document.createElement("pre");
        code = document.createElement("code");
        out.classList.add("mt-3");
        out.append(code);
        container.append(out);
      }

      let asm = "";
      for (const inst of insts) {
        asm += inst + "\n";
      }

      code.textContent = asm;
    } catch (e) {
      if (out) {
        container.removeChild(out);
        out = null;
      }

      if (!err) {
        err = document.createElement("div");
        err.classList.add("alert");
        err.classList.add("alert-danger");
        err.classList.add("mt-3");
        container.append(err);
      }

      err.textContent = e;
    }
  });
})();
