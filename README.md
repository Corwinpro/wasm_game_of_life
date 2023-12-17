# WASM Game of Life

This is an adapted dem application from the [Rust 🦀 and WebAssembly 🕸](https://rustwasm.github.io/docs/book/) book.

## What happens here?

We have two components:

1.Fast Rust backend that implements the Game of Life data.
  Rust code is compiled into `.wasm` binary via `cargo` and corresponding Javascript API is generated
  (all done via single `wasm-pack build` command).

  This code can be found in [`lib.rs`](src/lib.rs).
2. Javascript application that implements the frontend, reading Game of Life data via the above API.

The Rust component is built by

```sh
cargo install wasm-pack
wasm-pack build
```

which creates a `pkg` directory with a `.wasm` binary and a bunch of `.js`/`.ts` files.
We also need the [`package-lock.json`](package-lock.json) for the frontend to load this as a module.

Webpack is used to build the frontend with the Rust-based module.
The latter one is exported via

```js
import { Universe, UniversePattern } from "wasm-gol";
import { memory } from "wasm-gol/wasm_gol_bg.wasm";
```

where `wasm-gol` is the name of the package created in the first step.

## How to run this?

From the `www` directory, run `npm run start` and go to [`localhost:8080`](`localhost:8080`).

This application can alse be deployed to Github Pages (see [this Github Action](.github/workflows/deploy.yaml))
which builds everything, and then uploads static artifacts.

You can find the deployed app at [`http://petrkungurtsev.me/wasm_game_of_life/`](http://petrkungurtsev.me/wasm_game_of_life/).
