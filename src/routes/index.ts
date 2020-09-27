import { Router, Request, Response } from "express";
import auth from "./auth";
import patient from "./patient";

const routes = Router();

routes.use("/auth", auth);
routes.use("/patient", patient);

export default routes;
