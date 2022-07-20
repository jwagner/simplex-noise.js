#!/bin/sh
# using powersave yields more consistent results
sudo cpupower frequency-set -g powersave
# use core 0 + 16 (which is hyperthreading for core 0)
sudo nice -n -10 sudo -u $USER taskset -c 0,16 `which node` --random_seed=1 --hash_seed=1 --expose-gc index.js
sudo cpufreq-set -g schedutil
