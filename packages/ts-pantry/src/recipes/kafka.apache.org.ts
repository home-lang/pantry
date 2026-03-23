import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'kafka.apache.org',
  name: 'kafka.apache',
  description: 'Mirror of Apache Kafka',
  github: 'https://github.com/apache/kafka',
  programs: ['connect-distributed.sh', 'connect-mirror-maker.sh', 'connect-plugin-path.sh', 'connect-standalone.sh', 'kafka-acls.sh', 'kafka-broker-api-versions.sh', 'kafka-client-metrics.sh', 'kafka-cluster.sh', 'kafka-configs.sh', 'kafka-console-consumer.sh', 'kafka-console-producer.sh', 'kafka-consumer-groups.sh', 'kafka-consumer-perf-test.sh', 'kafka-delegation-tokens.sh', 'kafka-delete-records.sh', 'kafka-dump-log.sh', 'kafka-e2e-latency.sh', 'kafka-features.sh', 'kafka-get-offsets.sh', 'kafka-jmx.sh', 'kafka-leader-election.sh', 'kafka-log-dirs.sh', 'kafka-metadata-quorum.sh', 'kafka-metadata-shell.sh', 'kafka-producer-perf-test.sh', 'kafka-reassign-partitions.sh', 'kafka-replica-verification.sh', 'kafka-run-class.sh', 'kafka-server-start.sh', 'kafka-server-stop.sh', 'kafka-storage.sh', 'kafka-streams-application-reset.sh', 'kafka-topics.sh', 'kafka-transactions.sh', 'kafka-verifiable-consumer.sh', 'kafka-verifiable-producer.sh', 'trogdor.sh', 'zookeeper-security-migration.sh', 'zookeeper-server-start.sh', 'zookeeper-server-stop.sh', 'zookeeper-shell.sh'],
  versionSource: {
    type: 'github-releases',
    repo: 'apache/kafka/tags',
  },
  distributable: {
    url: 'https://downloads.apache.org/kafka/{{version}}/kafka_2.13-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'openjdk.org': '*',
  },
  buildDependencies: {
    'rsync.samba.org': '*',
  },

  build: {
    script: [
      'rm -rf bin/windows',
      'cd "${{prefix}}"',
      'rsync -avP $SRCROOT/* .',
      'sed -i.bak \'s#base_dir=$(dirname $0)/..#base_dir=$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")")/..#g\' "{{prefix}}/bin/kafka-run-class.sh" && rm -f "{{prefix}}/bin/kafka-run-class.sh.bak"',
    ],
  },
}
