import App from "./app";
import DotEnv from "dotenv";
import Jobs from "./jobs";

DotEnv.config();

const jobs = new Jobs();

new App({PORT: Number(process.env.PORT)}).listen();

jobs.starter().then(() => {
    console.log("Starter jobs")
})
