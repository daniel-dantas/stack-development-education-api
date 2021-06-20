import express, { Express, json } from "express";

interface IConfig {
    PORT: number
}

class App {

    private main: Express;
    private readonly PORT: number;

    constructor(config: IConfig) {
        this.main = express();
        this.PORT = config.PORT;
        this.config();
        this.routes();
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
    }

    public listen () {
        this.main.listen(this.PORT, () => {
            console.log(`Server is open ${this.PORT}`);
        });
    }

}

export default App;
