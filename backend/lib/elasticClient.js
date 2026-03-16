/**
 * EMS PRO 2026 — Elasticsearch Client (Single-node dev / Multi-node cluster)
 *
 * ENV VARS:
 *   ELASTIC_URL       = http://localhost:9200      (single node)
 *   ELASTIC_NODES     = http://n1:9200,http://n2:9200,...  (cluster)
 *   ELASTIC_API_KEY   = base64-encoded API key     (production auth)
 *   ELASTIC_USERNAME  = elastic
 *   ELASTIC_PASSWORD  = changeme
 */
const { Client } = require('@elastic/elasticsearch');

let client;

function getClient() {
  if (client) return client;

  const nodes = process.env.ELASTIC_NODES
    ? process.env.ELASTIC_NODES.split(',').map(n => n.trim())
    : null;

  const auth = process.env.ELASTIC_API_KEY
    ? { apiKey: process.env.ELASTIC_API_KEY }
    : (process.env.ELASTIC_USERNAME
        ? { username: process.env.ELASTIC_USERNAME, password: process.env.ELASTIC_PASSWORD || '' }
        : undefined);

  client = new Client({
    nodes: nodes || [process.env.ELASTIC_URL || 'http://localhost:9200'],
    ...(auth ? { auth } : {}),
    requestTimeout: 30000,
    sniffOnStart: !!nodes,        // auto-discover cluster nodes in production
    sniffInterval: 60000,
  });

  return client;
}

module.exports = { getClient };
