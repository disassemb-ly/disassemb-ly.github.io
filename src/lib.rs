use dasha::DisplayFormat;

use js_sys::Array;

use wasm_bindgen::prelude::*;

mod utils;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn disasm(data: &str) -> Result<Array, JsValue> {
    let data = data
        .split_whitespace()
        .map(|mut frag| {
            let mut bytes = vec![];

            while !frag.is_empty() {
                if frag.len() >= 2 {
                    if let Ok(byte) = u8::from_str_radix(&frag[..2], 16) {
                        bytes.push(byte);
                        frag = &frag[2..];
                        continue;
                    }
                }

                if let Ok(byte) = u8::from_str_radix(&frag[..1], 16) {
                    bytes.push(byte);
                    frag = &frag[1..];
                    continue;
                }

                return Err(format!("failed to parse {:?}", frag));
            }

            Ok(bytes)
        })
        .collect::<Result<Vec<_>, _>>()?
        .into_iter()
        .flatten()
        .collect::<Vec<_>>();

    let insts = dasha::Dasha::disasm(&data).map_err(|err| format!("{}", err))?
        .iter()
        .map(|inst| format!("{}", inst.display(dasha::Format::Att)))
        .collect::<Vec<_>>();

    Ok(insts.iter().map(JsValue::from).collect())
}

#[wasm_bindgen(start)]
pub fn start() {
    utils::set_panic_hook();
}
