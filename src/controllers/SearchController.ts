import {Request, Response} from "express";
import StackService from "../services/StackService";
import {getClient} from "../client/elasticsearch";

const client = getClient();

abstract class SearchController {
    public static async index(req: Request, res: Response) {
        try {

            const {search, tags} = req.body as { search: string, tags: string[] };

            let result;

            // let tagsStack: string[] = [];
            //
            // for(let tag of tags){
            //     const tagStack = await StackService.searchTag(tag);
            //
            //     if(tagStack){
            //         tagsStack.push(tagStack.name);
            //     }
            // }

            try {
                result = await client.search({
                    index: "post",
                    size: 1000,
                    body: {
                        query: {
                            match: {
                                title: search,
                                // tags: tagsStack
                            }
                        }
                    },
                })
            } catch (e) {
                result = null;
            }

            if (result) {
                if (result.hits.hits.length) {
                    res.status(200).json({
                        data: result.hits.hits.map(item => {
                            return item._source;
                        })
                    });
                }

            }

            let tagsStack: string[] = [];

            for (let tag of tags) {
                const tagStack = await StackService.searchTag(tag);

                if (tagStack) {
                    tagsStack.push(tagStack.name);
                }
            }

            let posts = await StackService.advancedSearch(search, tagsStack);

            for (const tag of tagsStack) {
                const result = await StackService.advancedSearch(search, [tag]);
                posts = [...posts, ...result];
            }

            for (const post of posts) {

                try {
                    const dataPost = await client.search({
                        index: "post",
                        q: `question_id:${post.question_id}`
                    });

                    if (!dataPost.hits.hits.length) {
                        await client.index({
                            index: "post",
                            type: "type_post",
                            body: post
                        });
                    }
                } catch (e) {
                    await client.index({
                        index: "post",
                        type: "type_post",
                        body: post
                    });
                }

            }
            return res.status(200).json({data: posts});

        } catch (err) {
            return res.json(500).json({
                message: "Failed to search question!"
            })
        }
    }
}

export default SearchController;