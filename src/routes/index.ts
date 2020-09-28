import { Router, Request, Response } from "express";
import auth from "./auth";
import patient from "./patient";
import doctor from "./doctor";

const routes = Router();

routes.use("/auth", auth);
routes.use("/patient", patient);
routes.use("/doctor", doctor);

export default routes;
