import axios from "axios"
import DotEnv from "dotenv";

DotEnv.config();

export default axios.create({
    baseURL: process.env.STACK_API
});