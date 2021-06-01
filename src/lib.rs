#![feature(destructuring_assignment)]

use serde::ser::SerializeStruct;

use dasha::Spanning;

mod utils;

//use js_sys::{Array, Object};

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

enum Error {}

impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let state = serializer.serialize_struct("Error", 0)?;
        state.end()
    }
}

fn tokenize(input: &str) -> Result<Vec<Spanning<u8>>, JsValue> {
    let mut code = input.trim_start();
    let mut bytes = vec![];
    while !code.is_empty() {
        let byte;
        (byte, code) = match code.chars().next().unwrap() {
            char if char.is_digit(16) => match code.chars().skip(1).next() {
                Some(char) if char.is_digit(16) => (
                    Spanning(
                        u8::from_str_radix(&code[..2], 16).unwrap(),
                        input.len() - code.len(),
                        2,
                        None,
                    ),
                    &code[2..],
                ),
                None => (
                    Spanning(
                        u8::from_str_radix(&code[..1], 16).unwrap(),
                        input.len() - code.len(),
                        1,
                        None,
                    ),
                    &code[1..],
                ),
                Some(char) if char.is_whitespace() => (
                    Spanning(
                        u8::from_str_radix(&code[..1], 16).unwrap(),
                        input.len() - code.len(),
                        1,
                        None,
                    ),
                    &code[1..],
                ),
                Some(char) => {
                    return Err(JsValue::from(js_sys::Error::new(&format!(
                        "unexpected char: {:?}",
                        char
                    ))))
                }
            },
            char => {
                return Err(JsValue::from(js_sys::Error::new(&format!(
                    "unexpected char: {:?}",
                    char
                ))))
            }
        };
        bytes.push(byte);
        code = code.trim_start();
    }
    Ok(bytes)
}

#[wasm_bindgen(start)]
pub fn entry() {
    utils::set_panic_hook();
}

#[wasm_bindgen]
pub fn disasm(code: &str) -> Result<JsValue, JsValue> {
    let bytes = tokenize(code)?;
    log(&format!("{:?}", bytes));
    let insts = dasha::disasm(&bytes).map_err(|err| format!("{}", err));
    log(&format!("{:?}", insts));
    Ok(JsValue::from_serde(&insts).unwrap())
}
