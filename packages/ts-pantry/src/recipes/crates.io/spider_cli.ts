import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "crates.io/spider_cli",
  name: "spider_cli",
  programs: [
    "spider",
  ],
  buildDependencies: {
    'rust-lang.org': ">=1.56",
    'rust-lang.org/cargo': "*",
  },
  distributable: {
    url: "https://github.com/spider-rs/spider/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -f $PROP -i Cargo.toml",
        if: "linux",
        'working-directory': "spider_cli",
      },
      {
        run: "sed -i -E 's/,? *\"io_uring\"//' Cargo.toml",
        if: "linux/x86-64",
        'working-directory': "spider",
      },
      "cargo install --path spider_cli --root {{prefix}} --features smart,spider/serde",
    ],
    env: {
      'linux/x86-64': {
        RUSTFLAGS: "-C target-cpu=x86-64 -C link-args=-pie",
      },
    },
  },
  test: {
    script: [
      "BIN=$(command -v spider)\necho \"=== file ===\"\nfile $BIN\necho \"=== readelf -h (ELF type) ===\"\nreadelf -h $BIN | grep -i type\necho \"=== readelf -d (RPATH/RUNPATH) ===\"\nreadelf -d $BIN | grep -iE 'rpath|runpath|needed' || echo \"(none)\"\necho \"=== ldd ===\"\nldd $BIN\necho \"=== AVX instruction count ===\"\nobjdump -d $BIN | grep -c -iE 'vmov|vpadd|vpxor|vbroadcast|vzero' || echo \"0\"\necho \"=== CPU flags ===\"\ngrep -oP 'flags\\s*:\\s*\\K.*' /proc/cpuinfo | head -1\necho \"=== SIGILL crash analysis ===\"\nRUST_BACKTRACE=full strace -f -o /tmp/spider.strace spider -v --url https://choosealicense.com crawl 2>&1 || true\nFAULT=$(grep 'si_addr=' /tmp/spider.strace | grep -oP 'si_addr=\\K0x[0-9a-f]+' || true)\necho \"fault addr=$FAULT\"\necho \"=== /proc/pid maps (text segment base) ===\"\ngrep ' r.xp ' /tmp/spider.strace | head -5 || true\necho \"=== last 20 lines before crash ===\"\ngrep -B20 'SIGILL' /tmp/spider.strace | head -25 || true\necho \"=== finding faulting function ===\"\nif test -n \"$FAULT\"; then\n  # offset is consistently 0x7b2ca7 across all ASLR'd runs\n  OFFSET=0x7b2ca7\n  echo \"known offset=$OFFSET\"\n  echo \"=== addr2line ===\"\n  addr2line -e $BIN -f -p $OFFSET 2>&1 || true\n  echo \"=== objdump (is it ud2?) ===\"\n  objdump -d --start-address=0x7b2c90 --stop-address=0x7b2cb0 $BIN || true\n  echo \"=== nm nearest ===\"\n  nm -n $BIN | awk -v o=0x7b2ca7 'BEGIN{t=strtonum(o)} /^[0-9a-f]+ [tT]/{if(strtonum(\"0x\"$1)>t){print prev; exit}; prev=$0}' || true\nfi\n",
      "spider -v --url https://choosealicense.com crawl",
    ],
  },
}
