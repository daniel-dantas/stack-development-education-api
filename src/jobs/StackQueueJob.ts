import { RedisClientType } from "redis";
import cron from "node-cron";

import Redis from "../databases/redis";
import Config from "../config/development.json";
import StackService from "../services/StackService";
import {getClient} from "../client/elasticsearch";
import { IPost } from "../types";

interface SearchProp {
    search?: string;
    tags?: string[];
}

const client = getClient();

class StackQueueJob {

    private redisClient: RedisClientType<any>;
    private cron: string | undefined;
    private description: string;

    constructor() {
        this.description = "stack_queue_job";
        this.redisClient = new Redis().getClient();

        for(let cron of Object.keys(Config)) {
            if(["stack_queue_job"].includes(cron)){
                // @ts-ignore
                const stack_queue_job = Config[cron];
                this.cron = stack_queue_job.init;
            }
        }

    }

    log(description: string) {
        console.log(`${new Date()} - [${this.description}] - ${description}`);
    }

    async init() {
        this.cron && cron.schedule(this.cron, async () => {
            const resultString = await this.redisClient.get('searchs');

            this.log(`Starting Job`);

            const queue: SearchProp[] = resultString ? JSON.parse(resultString) : [];

            let posts: IPost[] = [];

            for(let item of queue) {
                const postsResult = await StackService.advancedSearch(item?.search as string, item?.tags);
                posts = [...posts, ...postsResult];
            }

            for (const post of posts) {
                try {
                    const dataPost = await client.search({
                        index: "post",
                        q: `question_id:${post.question_id}`
                    });

                    if (!dataPost.hits.hits.length) {
                        await client.index({
                            index: "post",
                            type: "type_post",
                            body: post
                        });
                    }
                } catch (e) {
                    await client.index({
                        index: "post",
                        type: "type_post",
                        body: post
                    });
                }

            }

            await this.redisClient.set("searchs", JSON.stringify([]));

            this.log('Finishing Job');
        });
    }

    async insertQueue(data: SearchProp) {

        try {
            const resultString = await this.redisClient.get('searchs');

            const queue: SearchProp[] = resultString ? JSON.parse(resultString) : [];
    
            queue.push(data);
    
            const saveQueue = JSON.stringify(queue);
    
            this.redisClient.set("searchs", saveQueue);
        } catch (err: any) {
            this.log("Error: "+err.message);
            throw err;
        }

        

    }

}

export default StackQueueJob;