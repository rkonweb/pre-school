import { Client } from '@elastic/elasticsearch';

declare global {
    var elastic: Client | undefined;
}

const client = global.elastic || new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
        apiKey: process.env.ELASTICSEARCH_API_KEY || ''
    },
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
});

if (process.env.NODE_ENV !== 'production') global.elastic = client;

export { client as elastic };
