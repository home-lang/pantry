import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "apache.org/zookeeper",
  name: "zookeeper",
  programs: [
    "zkCleanup",
    "zkCli",
    "zkEnv",
    "zkServer-initialize",
    "zkServer",
    "zkSnapshotComparer",
    "zkSnapshotRecursiveSummaryToolkit",
    "zkSnapShotToolkit",
    "zkTxnLogToolkit",
  ],
  dependencies: {
    'openjdk.org': "*",
  },
  distributable: {
    url: "https://downloads.apache.org/zookeeper/zookeeper-{{version}}/apache-zookeeper-{{version}}-bin.tar.gz",
    stripComponents: 1,
  },
  build: {
    skip: ['verify-foreign-artifact'],
    script: [
      {
        run: "mkdir -p etc/zookeeper var/log/zookeeper var/run/zookeeper/data",
        'working-directory': "{{prefix}}",
      },
      {
        run: "rm -f bin/*.cmd bin/*.txt\ncp -r ./* {{prefix}}/\n",
      },
      {
        run: "rm -f *.txt *.md",
        'working-directory': "{{prefix}}",
      },
      {
        run: "ln -s zkCleanup.sh zkCleanup\nln -s zkCli.sh zkCli\nln -s zkEnv.sh zkEnv\nln -s zkServer-initialize.sh zkServer-initialize\nln -s zkServer.sh zkServer\nln -s zkSnapshotComparer.sh zkSnapshotComparer\nln -s zkSnapshotRecursiveSummaryToolkit.sh zkSnapshotRecursiveSummaryToolkit\nln -s zkSnapShotToolkit.sh zkSnapShotToolkit\nln -s zkTxnLogToolkit.sh zkTxnLogToolkit\n",
        'working-directory': "{{prefix}}/bin",
      },
      {
        run: "cp zoo_sample.cfg zoo.cfg\nsed -i.bak 's|dataDir=/tmp/zookeeper|dataDir=\\$ZOODIR/var/run/zookeeper|' zoo.cfg\nrm -f zoo.cfg.bak\n",
        'working-directory': "{{prefix}}/conf",
      },
    ],
  },
  test: {
    script: [
      'test -x "$(command -v zkCli)"',
      'test -f "{{prefix}}/lib/zookeeper-{{version}}.jar"',
    ],
  },
}
