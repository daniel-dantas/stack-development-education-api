import { RedisClientType } from "redis";

import Redis from "../databases/redis";
import Config from "../config/development.json";
import StackService from "../services/StackService";
import {getClient} from "../client/elasticsearch";
import { IPost } from "../types";
import Job from "./Job";

interface SearchProp {
    search?: string;
    tags: string[];
}

const client = getClient();

class StackQueueJob extends Job {

    private redisClient: RedisClientType<any>;

    constructor() {
        super("stack_queue_job");
        this.redisClient = new Redis().getClient();
    }

    public async init() {
        const resultString = await this.redisClient.get('searchs');

        this.log(`Starting Job`);

        this.log("REDIS LOADED");

        console.log(resultString);

        const queue: SearchProp[] = resultString ? JSON.parse(resultString) : [];

        for(let item of queue) {

            let postsResultItem = await StackService.advancedSearch(item?.search as string, [...(item as any)?.tags]);

            for(let tag of (item?.tags ? item?.tags : [])) {

                const tagStack = await StackService.searchTag(tag);
                
                const postsResult = await StackService.advancedSearch(item?.search as string, [tagStack.name]);

                for (const post of postsResult) {
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
            }

            const index = queue.findIndex(itemFind => itemFind.search = item.search);
            queue.splice(index, 1);
            await this.redisClient.set("searchs", JSON.stringify(queue));
        }

        await this.redisClient.set("searchs", JSON.stringify([]));

        this.log('Finishing Job');
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