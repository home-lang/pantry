import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openjdk.org',
  name: 'openjdk',
  description: 'Development kit for the Java programming language',
  homepage: 'https://openjdk.java.net/',
  propsDir: 'props/openjdk.org',
  platforms: ['darwin', 'linux'],
  versionSource: {
    type: 'custom',
    fetch: async (): Promise<string[]> => {
      const releases: string[] = []
      const seen = new Set<string>()
      for (let page = 0; ; page++) {
        const response = await fetch(`https://api.adoptium.net/v3/info/release_names?release_type=ga&page_size=100&page=${page}&sort_order=DESC`)
        // Adoptium returns 404 when a release page is past the result set.
        if (response.status === 404 && page > 0) break
        if (!response.ok) throw new Error(`Adoptium releases HTTP ${response.status}`)
        const data = await response.json() as { releases: string[] }
        if (data.releases.length === 0) break
        if (data.releases.every(release => seen.has(release))) throw new Error(`Adoptium repeated release page ${page}`)
        for (const release of data.releases) seen.add(release)
        releases.push(...data.releases)
      }
      return releases.flatMap((release) => {
        const modern = /^jdk-(\d+(?:\.\d+){0,3})\+(\d+)$/.exec(release)
        if (modern) {
          const components = modern[1].split('.')
          while (components.length < 3) components.push('0')
          return [[...components, modern[2]].join('.')]
        }
        const legacy = /^jdk8u(\d+)-b(\d+)$/.exec(release)
        return legacy ? [`8.0.${legacy[1]}.${Number(legacy[2])}`] : []
      })
    },
  },
  buildDependencies: { 'curl.se': '*', 'gnu.org/coreutils': '*', 'gnu.org/tar': '*' },
  dependencies: {
    linux: {
      'giflib.sourceforge.io': '*', 'harfbuzz.org': '^8',
      'libjpeg-turbo.org': '*', 'libpng.org': '*', 'littlecms.com': '*',
      'openprinting.github.io/cups': '*', 'info-zip.org/unzip': '*',
      'zlib.net': '*', 'libzip.org': '*', 'alsa-project.org/alsa-lib': '*',
      'freedesktop.org/fontconfig': '*', 'freetype.org': '*',
      'x.org/x11': '*', 'x.org/exts': '*', 'x.org/xrandr': '*',
      'x.org/xrender': '*', 'x.org/xt': '*', 'x.org/xtst': '*',
      'info-zip.org/zip': '*', 'darwinsys.com/file': '*',
    },
  },
  programs: ['jar', 'jarsigner', 'java', 'javac', 'javadoc', 'javap', 'jcmd', 'jconsole', 'jdb', 'jdeprscan', 'jdeps', 'jfr', 'jhsdb', 'jimage', 'jinfo', 'jlink', 'jmap', 'jmod', 'jps', 'jrunscript', 'jshell', 'jstack', 'jstat', 'jstatd', 'keytool', 'rmiregistry', 'serialver'],
  // JDK-8367157 removed this tool in JDK 26; earlier releases still supply it.
  programVersions: { jrunscript: { before: 26 } },

  build: {
    script: [
      'bash props/install-temurin.sh "{{version.raw}}" "{{hw.platform}}" "{{hw.arch}}" "{{prefix}}"',
    ],
    skip: ['fix-machos', 'fix-patchelf'],
  },
  test: {
    required: true,
    script: [
      'env -u LD_LIBRARY_PATH -u DYLD_LIBRARY_PATH -u DYLD_FALLBACK_LIBRARY_PATH {{prefix}}/bin/java -version',
      'printf \'class PantryJdkHealth { public static void main(String[] args) throws Exception { String expected; try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(args[0]))) { expected = reader.readLine(); } String actual = System.getProperty("java.runtime.version"); if (!actual.equals(expected) && !actual.equals(expected + "-LTS")) throw new AssertionError(actual + " != " + expected); System.out.println("PANTRY_JDK_OK " + actual); } }\\n\' > PantryJdkHealth.java',
      'env -u LD_LIBRARY_PATH -u DYLD_LIBRARY_PATH -u DYLD_FALLBACK_LIBRARY_PATH {{prefix}}/bin/javac PantryJdkHealth.java',
      'env -u LD_LIBRARY_PATH -u DYLD_LIBRARY_PATH -u DYLD_FALLBACK_LIBRARY_PATH {{prefix}}/bin/java -cp . PantryJdkHealth {{prefix}}/share/pantry/java-runtime-version.txt | grep PANTRY_JDK_OK',
    ],
  },
}
