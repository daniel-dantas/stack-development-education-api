import { RedisClientType } from "redis";
import cron from "node-cron";

import Redis from "../databases/redis";
import Job from "./Job";
import Config from "../config/development.json";
import StackService from "../services/StackService";
import {getClient} from "../client/elasticsearch";



interface SearchProp {
    search?: string;
    tags?: string[];
}

const client = getClient();

class StackQueueJob extends Job{

    private redisClient: RedisClientType;
    private cron: string;

    constructor() {
        super("stack_queue_job");
        this.redisClient = new Redis().getClient();

        for(let cron of Object.keys(Config)) {
            if(["stack_queue_job"].includes(cron)){
                const stack_queue_job = Config[cron];
                this.cron = stack_queue_job.init;
            }
        }

    }

    async init() {
        const resultString = await this.redisClient.get('searchs');
        const queue: SearchProp[]  = JSON.parse(resultString);

        
        cron.schedule(this.cron, async () => {
            const resultString = await this.redisClient.get('searchs');

            const queue: SearchProp[] = resultString ? JSON.parse(resultString) : [];

            let posts = [];

            for(let item of queue) {
                const postsResult = await StackService.advancedSearch(item?.search, item?.tags);
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

        });
    }

    async insertQueue(data: SearchProp) {

        try {
            const resultString = await this.redisClient.get('searchs');


            const queue: SearchProp[] = resultString ? JSON.parse(resultString) : [];
    
            queue.push(data);
    
            const saveQueue = JSON.stringify(queue);
    
            this.redisClient.set("searchs", saveQueue);
        } catch (err) {
            console.log("[stack_queue_job] - Error: "+err.message);
            throw err;
        }

        

    }

}

export default StackQueueJob;