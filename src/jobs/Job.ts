class Job {
    public description: string;

    constructor(description: string) {
        this.description = description;
    }

    public log(description: string) {
        console.log(`${new Date()} - [${this.description}] - ${description}`);
    }

    public async init() {}
}

export default Job;