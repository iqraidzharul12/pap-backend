import { Router } from "express";
import { ArticleController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Get all data
router.get("/", ArticleController.listAll);

// Get one data
router.get("/:id", ArticleController.getOneById);

//Create a new data
router.post("/", ArticleController.create);

//Edit one data
router.patch("/:id", ArticleController.edit);

//Delete one data
router.delete("/:id", ArticleController.delete);

export default router;
