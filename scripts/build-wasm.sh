#!/bin/sh
for dir in wasm/*/; do
  name=$(basename "$dir")
  (cd "$dir" && wasm-pack build --target web --out-dir "../../public/fs/bin/$name")
done
