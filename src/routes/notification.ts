import { Router } from "express";
import { NotificationController } from "../controllers";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

// //Get all data
// router.get("/", LaboratoriumController.listAll);

// Get one data
router.get("/:id", NotificationController.listAll);

// //Create a new data
// router.post("/", LaboratoriumController.create);
router.post("/push", NotificationController.manualPushNotification);

// //Edit one data
// router.patch("/:id", LaboratoriumController.edit);

//Delete one data
router.delete("/:id", NotificationController.delete);

export default router;
