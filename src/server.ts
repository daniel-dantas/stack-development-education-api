import App from "./app";
import DotEnv from "dotenv";

DotEnv.config();

new App({PORT: Number(process.env.PORT)}).listen();