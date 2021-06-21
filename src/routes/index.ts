import { Router } from "express";
import SearchController from "../controllers/SearchController";

const router = Router();

router.post("/search", SearchController.index);

export default router;
