import StackQueueJob from "./StackQueueJob";
import Cron from "node-cron";
import Config from "../config/development.json";
import semaphore from "semaphore";
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
                    const sem = semaphore(1);
                    Cron.schedule(stack_queue_job.init, async () => sem.take(async () => {
                        try {
                            await this.stack_queue_job.init();
                        } catch (err) {
                            console.log(`${new Date()} - [${cronItem}] - error:${(err as Error).message}`);
                        } finally {
                            sem.leave();
                            console.log(`${new Date()} - [${cronItem}] - Finally Execution`);
                        }
                    }));
                    break;
                default:
                    break;
            }
        }
    }
}

export default Jobs;