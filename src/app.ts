import express, { Express, json } from "express";
import Router from "./routes";
import Jobs from "./jobs";
interface IConfig {
    PORT: number
}

class App {

    private main: Express;
    private readonly PORT: number;
    // private jobs;

    constructor({ PORT }: IConfig) {
        this.main = express();
        this.PORT = PORT;
        this.config();
        this.routes();
        // this.jobs = new Jobs();
        // this.jobs.starter().then(() => {
        //     console.log("Starter Jobs");
        // });
    }

    public config(){
        this.main.use(json());
    }

    public routes () {
        this.main.get("/api/v1", (req, res) => {
            return res.status(200).json({
                author: "Daniel Dantas Catarina",
            });
        });
        this.main.use("/api/v1", Router);
    }

    public listen () {
        this.main.listen(this.PORT, () => {
            console.log(`Server is open ${this.PORT}`);
        });
    }

}

export default App;
