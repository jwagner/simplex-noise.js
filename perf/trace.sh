#!/bin/sh
node --random_seed=1 --hash_seed=1 --print-opt-code --code-comments --trace-deopt --trace-turbo minimal.js