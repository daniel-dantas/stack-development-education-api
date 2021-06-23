import axios from "axios"
import DotEnv from "dotenv";
import {IPost, ITag} from "../types";

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

    public static async searchTag(tag_name: string){
        const response = await API.get(`/tags?order=desc&sort=popular&inname=${tag_name}&site=stackoverflow`);
        return (response.data.items as ITag[])[0];
    }

}

export default StackService;
