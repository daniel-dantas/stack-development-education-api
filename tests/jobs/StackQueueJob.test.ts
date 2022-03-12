import { describe, it } from "mocha";

import StackQueueJob from "../../src/jobs/StackQueueJob";
import StackService from "../../src/services/StackService";

describe("Testando StackQueueJob", () => {

    const stack_queue_job = new StackQueueJob();

    it.skip("init function", async () => {
        await stack_queue_job.init();
    });

    it.skip("advancedSearchService", async () => {
        await StackService.advancedSearch("Axios error", ["axios"]);
    });

    it.only("searchTag", async () => {
        await StackService.searchTag("axios");
    });

});
