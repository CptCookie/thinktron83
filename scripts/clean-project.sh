#!/bin/sh

echo remove ts artifacts
find ./src -name "*.js" -type f -exec rm {} \;
rm -rf dist

echo remove rust artifacts
for dir in wasm/*/; do
  name=$(basename "$dir")
  (cd "$dir" && cargo clean 2> /dev/null)
done

echo Done
