import { describe, it } from "mocha";

import StackQueueJob from "../../src/jobs/StackQueueJob";
import StackService from "../../src/services/StackService";

import Redis from "../../src/databases/redis";


describe("Testando StackQueueJob", () => {

    const stack_queue_job = new StackQueueJob();

    const redisCliente = new Redis().getClient();

    it.skip("init job", async () => {
        await stack_queue_job.init();
    });

    it.skip("advancedSearchService", async () => {
        await StackService.advancedSearch("Axios error", ["axios"]);
    });

    it.skip("searchTag", async () => {
        await StackService.searchTag("axios");
    });

    it.skip("Pesquisa de tags em massa", async () => {
        const resultString = await redisCliente.get("searchs");
        const queue: any[] = resultString ? JSON.parse(resultString) : [];

        for(let item of queue) {
            const tagStack = await stack_queue_job.getStackTags(item.tags);
            tagStack.forEach(itemStack => console.log(itemStack));
        }
    });

});
