import { Router } from "express";
import { MailController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

//Create a new data
router.post("/", MailController.send);


export default router;
