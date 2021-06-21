import axios from "axios"
import DotEnv from "dotenv";
import {IPost} from "../types";

DotEnv.config();

// API Create Link
const API = axios.create({
    baseURL: process.env.STACK_API
});

abstract class StackService {
    public static async advancedSearch(search: string, tags?: string[]) {

        let response;

        if(tags){
            response = await API.get(`/search/advanced?pagesize=100&order=desc&tagged=${tags.join(";")}&sort=activity&q=${search}&site=stackoverflow`)
        }else{
            response = await API.get(`/search/advanced?pagesize=100&order=desc&sort=activity&q=${search}&site=stackoverflow`);
        }

        return response.data.items as IPost[];
    }
}

export default StackService;
