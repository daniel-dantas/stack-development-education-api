import StackQueueJob from "./StackQueueJob";
import Cron from "node-cron";
import Config from "../config/development.json";

class Jobs {

    private stack_queue_job;
    
    constructor() {
        this.stack_queue_job = new StackQueueJob();
    }
    
    async starter() {
        for(let cronItem of Object.keys(Config)) {
            switch (cronItem) {
                case this.stack_queue_job.description:
                    // @ts-ignore    
                    const stack_queue_job = Config[cronItem];
                    Cron.schedule(stack_queue_job.init, async () => await this.stack_queue_job.init());
                    break;
                default:
                    break;
            }
        }
    }
}

export default Jobs;