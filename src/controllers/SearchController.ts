import { Request, Response } from "express";
import StackService from "../services/StackService";
import { getClient } from "../client/elasticsearch";

const client = getClient();

abstract class SearchController {
    public static async index(req: Request, res: Response) {
        try {

            const { search, tags } = req.body as {search: string, tags: string[]};

            const result = await client.search({
                index: "post",
                body: {
                    query: {
                        term: {
                            "title.keyword": search,
                        }
                    }
                },
            })

            if(result){
                return res.status(200).json({data: result});
            }else{
                let posts = await StackService.advancedSearch(search, tags);

                for (const tag of tags) {
                    const result = await StackService.advancedSearch(search, [tag]);
                    posts = [ ...posts, ...result ];
                }

                await client.index({
                    index: "post",
                    type: "type_post",
                    body: posts
                });

                return res.status(200).json({ data: posts });
            }


        } catch (err) {
            // BackLog Error
            console.log(err);
            return res.json(500).json({
                message: "Failed to search question!"
            })
        }
    }
}

export default SearchController;