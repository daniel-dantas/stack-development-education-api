import { createClient, RedisClientType } from "redis";

class Redis {

    private client: RedisClientType<any>;

    constructor() {
        this.client = createClient({
            url: "redis://localhost:6379"
        });

        this.client.on('Error', (err) => {
            console.log('Redis Client Error', err);
        });

        this.connect().then();
    }


    private async connect() {
        await this.client.connect();
    }
    
    
    public getClient() {
        return this.client;
    }


}

export default Redis;



