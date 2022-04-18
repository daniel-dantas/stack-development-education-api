import { Request, Response } from "express";
import StackService from "../services/StackService";
import { getClient } from "../client/elasticsearch";
import Axios from "axios";
import { IPost } from "../types";
import * as handlebars from "handlebars";
import { resolve } from "path";
import * as fs from "fs";
import StackQueueJob from "../jobs/StackQueueJob";

const client = getClient();

abstract class SearchController {
  public static async index(req: Request, res: Response) {
    try {
      const { search, tags } = req.body as { search: string; tags: string[] };
      let tagsStack: string[] = [];

      console.log("REQ: ");
      console.log(search, tags);      

      let result;
      const stack_queue_job = new StackQueueJob();

      try {
        result = await client.search({
          index: "post",
          size: 50,
          q: `${search}`
        });
      } catch (e) {
        result = null;
      }

      if (result) {
        if (result.hits.hits.length) {
          res.status(200).json({
            data: result.hits.hits.map((item) => {
              return item._source;
            }),
          });
        }
      } else {

        let posts = await StackService.advancedSearch(search, []);

        res.status(200).json({ data: posts });

        for (const post of posts) {
          try {
            const dataPost = await client.search({
              index: "post",
              q: `question_id:${post.question_id}`,
            });

            if (!dataPost.hits.hits.length) {
              await client.index({
                index: "post",
                type: "type_post",
                body: post,
              });
            }
          } catch (e) {
            await client.index({
              index: "post",
              type: "type_post",
              body: post,
            });
          }
        }
        
      }

      await stack_queue_job.insertQueue({ search, tags });

    } catch (err) {
      return res.json(500).json({
        message: "Failed to search question!",
      });
    }
  }

  public static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;

      let postData;

      try {
        postData = await client.search({
          index: "post",
          q: `question_id:${id}`,
        });
      } catch (err) {
        postData = null;
      }

      if (!postData) return res.status(400).json({ message: "post not exist" });

      // const elasticSearchID = (postData?.hits?.hits[0] as any)._id;
      postData = (postData?.hits?.hits[0] as any)._source as IPost;

      if (!postData.descriptionComponent) {
        const pageDetail = await Axios.get(postData.link);

        let description: any = pageDetail.data as string;
        description = (description as string)
          .split(`<div class="s-prose js-post-body" itemprop="text">`)[1]
          .split(`<div class="mt24 mb12">`)[0];

        let answers = pageDetail.data;

        console.log(postData.link);

        answers = (answers as string)
          .split(`<div id="answers">`)[1]
          .split(
            `<div id="sidebar" class="show-votes" role="complementary" aria-label="sidebar">`
          )[0]
          .split(
            `<form id="post-form" action="/questions/${postData.question_id}/answer/submit" method="post" class="js-add-answer-component post-form">`
          )[0];

        postData.descriptionComponent = description;
        postData.answersComponent = answers;
      }

      // return res.status(200).json({
      //     data: postData
      // });

      const templateFileContent = fs
        .readFileSync(
          resolve(__dirname, "..", "views", "detailPost.template.hbs")
        )
        .toString("utf8");

      const viewTemplate = handlebars.compile(templateFileContent);
      const html = viewTemplate({
        post: postData,
      });

      return res.status(200).send(html);
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        message: "Failed to loading post data",
      });
    }
  }
}

export default SearchController;
