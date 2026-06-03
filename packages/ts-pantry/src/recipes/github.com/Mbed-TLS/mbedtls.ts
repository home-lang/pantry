import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/Mbed-TLS/mbedtls",
  name: "mbedtls",
  programs: [
    "aead_demo",
    "cert_app",
    "cert_req",
    "cert_write",
    "crl_app",
    "crypto_examples",
    "dtls_client",
    "dtls_server",
    "generate_random_uuid",
    "hmac_demo",
    "key_ladder_demo",
    "key_ladder_demo.sh",
    "load_roots",
    "mbedtls-selftest",
    "metatest",
    "mini_client",
    "pem2der",
    "psa_constant_names",
    "psa_hash",
    "query_compile_time_config",
    "query_included_headers",
    "req_app",
    "ssl_client1",
    "ssl_client2",
    "ssl_context_info",
    "ssl_fork_server",
    "ssl_mail_client",
    "ssl_pthread_server",
    "ssl_server",
    "ssl_server2",
    "strerror",
    "udp_proxy",
    "zeroize",
  ],
  buildDependencies: {
    'cmake.org': "*",
    'linux/aarch64': {
      'llvm.org': "<16",
    },
    'python.org': "~3.11",
  },
  distributable: {
    url: "https://github.com/Mbed-TLS/mbedtls/releases/download/{{version.tag}}/mbedtls-{{version}}.tar.bz2",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "CFG=include/mbedtls/mbedtls_config.h",
        if: ">=3",
      },
      {
        run: "CFG=include/mbedtls/config.h",
        if: "<3",
      },
      {
        run: "sed -i -f $PROP $CFG",
      },
      "cmake -S . -B build $ARGS",
      "cmake --build build",
      "ctest --parallel 1 --test-dir build --rerun-failed --output-on-failure",
      "cmake --install build",
      {
        run: "rm -f hello",
        'working-directory': "${{prefix}}/bin/",
      },
      {
        run: "test ! -f benchmark || mv benchmark mbedtls-benchmark\ntest ! -f selftest || mv selftest mbedtls-selftest",
        'working-directory': "${{prefix}}/bin",
      },
      {
        run: "mv ../bin/mpi_demo mpi_demo",
        if: "<4",
        'working-directory': "${{prefix}}/libexec",
      },
    ],
    env: {
      ARGS: [
        "-DCMAKE_BUILD_TYPE=Release",
        "-DCMAKE_INSTALL_PREFIX={{prefix}}",
        "-DUSE_SHARED_MBEDTLS_LIBRARY=On",
        "-DPython3_EXECUTABLE=$(which python3)",
        "-DCMAKE_INSTALL_RPATH={{prefix}}",
        "-DGEN_FILES=OFF",
      ],
    },
  },
  test: {
    script: [
      "printf '%s' 'This is a test file' > testfile.txt\ntest \"$(generic_sum SHA256 testfile.txt)\" = \"$SUM\"",
      "psa_hash | tee out\ngrep '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069' out",
    ],
  },
}
