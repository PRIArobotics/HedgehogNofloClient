import {HedgehogClient} from 'hedgehog-client';

class ConnectionStore {
    private connections: { [endpoint: string]: HedgehogClient } = {};

    public connect(endpoint: string): HedgehogClient {
        let connection = new HedgehogClient(endpoint);
        this.connections[endpoint] = connection;
        return connection;
    }

    public disconnect(endpoint: string): void {
        let connection = this.connections[endpoint];
        connection.close();
        this.connections[endpoint] = null;
    }

    public getConnection(endpoint: string): HedgehogClient {
        return this.connections[endpoint];
    }
}

export const DEFAULT_ENDPOINT = 'tcp://localhost:10789';
export let connectionStore = new ConnectionStore();
