import { Request, Response } from "express";

abstract class SearchController {
    public static async index(req: Request, res: Response) {
        try {

        } catch (err) {
            return res.json(500).json({
                message: "Failed to search question!"
            })
        }
    }
}

export default SearchController;