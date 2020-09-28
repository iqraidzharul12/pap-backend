import { Router } from "express";
import auth from "./auth";
import patient from "./patient";
import doctor from "./doctor";
import laboratorium from "./laboratorium";

const routes = Router();

routes.use("/auth", auth);
routes.use("/patient", patient);
routes.use("/doctor", doctor);
routes.use("/laboratorium", laboratorium);

export default routes;
