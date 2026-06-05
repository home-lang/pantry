import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "apache.org/jmeter",
  name: "jmeter",
  programs: [
    "jmeter",
    "jmeter-server",
    "mirror-server",
  ],
  dependencies: {
    'openjdk.org': "*",
  },
  buildDependencies: {
    'gnu.org/wget': "*",
  },
  // Use the permanent Apache archive mirror. The live `dlcdn.apache.org` mirror
  // only keeps the latest release(s) and purges older versions (5.6.1/5.6.2 now
  // 404 there), whereas `archive.apache.org` retains every published release.
  distributable: {
    url: "https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-{{version.raw}}.tgz",
    stripComponents: 1,
  },
  build: {
    script: [
      "rm -r bin/*.bat bin/*.cmd",
      "mkdir -p {{prefix}}",
      "mv bin docs extras lib {{prefix}}/",
      // Fetch the JMeter Plugins Manager jar into lib/ext. Inline the URL/file
      // (the env vars weren't exported into the working-directory subshell, so
      // wget saw empty args → "wget: missing URL").
      "wget --no-check-certificate -O \"{{prefix}}/lib/ext/jmeter-plugins-manager-1.9.jar\" 'https://search.maven.org/remotecontent?filepath=kg/apc/jmeter-plugins-manager/1.9/jmeter-plugins-manager-1.9.jar'",
    ],
  },
  test: {
    script: [
      "cat $FIXTURE > test.jmx",
      "jmeter -n -t test.jmx | grep 'end of run'",
      "jmeter --version | grep {{version}}",
    ],
  },
}
