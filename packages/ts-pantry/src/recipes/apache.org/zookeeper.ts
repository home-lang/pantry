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
    "zkSnapShotToolkit",
    "zkTxnLogToolkit",
  ],
  dependencies: {
    'openjdk.org': "*",
    'openssl.org': "*",
  },
  buildDependencies: {
    'gnu.org/autoconf': "*",
    'gnu.org/automake': "*",
    'freedesktop.org/cppunit': "*",
    'gnu.org/libtool': "*",
    'maven.apache.org': "*",
    'freedesktop.org/pkg-config': "*",
    linux: {
      'gnu.org/gcc': "*",
    },
  },
  distributable: {
    url: "https://archive.apache.org/dist/zookeeper/zookeeper-{{version}}/apache-zookeeper-{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "cd ..",
      "rm -rf ./zookeeper || true",
      "mv $SRCROOT zookeeper",
      "cd zookeeper",
      {
        run: "mkdir -p etc/zookeeper var/log/zookeeper var/run/zookeeper/data",
        'working-directory': {{prefix}},
      },
      "mvn install -Pfull-build -DskipTests",
      "tar -xf zookeeper-assembly/target/apache-zookeeper-{{version}}-bin.tar.gz",
      {
        run: "rm -f bin/*.cmd bin/*.txt\ncp -r ./* {{prefix}}/\n",
        'working-directory': "apache-zookeeper-{{version}}-bin",
      },
      "tar -xf zookeeper-assembly/target/apache-zookeeper-{{version}}-lib.tar.gz",
      {
        run: "cp -r usr/include {{prefix}}/\ncp -r usr/lib {{prefix}}/\n",
        'working-directory': "apache-zookeeper-{{version}}-lib",
      },
      {
        run: "rm -f *.txt *.md",
        'working-directory': {{prefix}},
      },
      {
        run: "ln -s zkCleanup.sh zkCleanup\nln -s zkCli.sh zkCli\nln -s zkEnv.sh zkEnv\nln -s zkServer-initialize.sh zkServer-initialize\nln -s zkServer.sh zkServer\nln -s zkSnapshotComparer.sh zkSnapshotComparer\nln -s zkSnapshotRecursiveSummaryToolkit.sh zkSnapshotRecursiveSummaryToolkit\nln -s zkSnapShotToolkit.sh zkSnapShotToolkit\nln -s zkTxnLogToolkit.sh zkTxnLogToolkit\n",
        'working-directory': {{prefix}}/bin,
      },
      {
        run: "cp zoo_sample.cfg zoo.cfg\nsed -i.bak 's|dataDir=/tmp/zookeeper|dataDir=\\$ZOODIR/var/run/zookeper|' zoo.cfg\nrm -f zoo.cfg.bak\n",
        'working-directory': {{prefix}}/conf,
      },
    ],
  },
}
