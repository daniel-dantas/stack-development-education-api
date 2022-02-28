import StackQueueJob from "./StackQueueJob";

class Jobs {

    private stack_queue_job;
    
    constructor() {
        this.stack_queue_job = new StackQueueJob();
    }
    
    async starter() {
        await this.stack_queue_job.init();
    }
}

export default Jobs;