import { Router } from "express";
import SearchController from "../controllers/SearchController";

const router = Router();

router.post("/search", SearchController.index);
router.get("/post/:id", SearchController.get);

export default router;
