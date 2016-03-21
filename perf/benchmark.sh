#!/bin/sh
sudo cpufreq-set -g performance
# use core 0 + 4 (which is hyperthreading for core 0)
sudo nice -n -10 sudo -u $USER taskset -c 0,4 `which node` --random_seed=1 --hash_seed=1 --expose-gc benchmark.js
sudo cpufreq-set -g powersave
