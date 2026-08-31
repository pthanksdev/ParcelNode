import * as client from 'prom-client';

// Collect default system and process metrics
client.collectDefaultMetrics({ prefix: 'parcelnode_' });

// Custom Prometheus Metrics
export const queueDepthGauge = new client.Gauge({
  name: 'parcelnode_queue_depth',
  help: 'Current depth of pending tasks in BullMQ queue',
  labelNames: ['queue_name'],
});

export const batchAccumulatorSizeHistogram = new client.Histogram({
  name: 'parcelnode_batch_accumulator_size',
  help: 'Histogram of event count size per accumulated Merkle batch',
  buckets: [1, 5, 10, 25, 50, 100, 250],
});

export const chainConfirmationLatencyHistogram = new client.Histogram({
  name: 'parcelnode_chain_confirmation_latency_seconds',
  help: 'Latency from batch submission to blockchain transaction confirmation',
  buckets: [1, 2, 5, 10, 15, 30, 60],
});

export const webhookDedupeCounter = new client.Counter({
  name: 'parcelnode_webhook_dedupe_total',
  help: 'Total count of duplicate webhooks ignored',
  labelNames: ['carrier'],
});

export { client as prometheusClient };
