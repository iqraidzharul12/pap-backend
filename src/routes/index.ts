import { Router } from "express";
import auth from "./auth";
import patient from "./patient";
import doctor from "./doctor";
import laboratorium from "./laboratorium";
import testLabType from "./testLabType";
import programType from "./programType";
import testLab from "./testLab";

const routes = Router();

routes.use("/auth", auth);
routes.use("/patient", patient);
routes.use("/doctor", doctor);
routes.use("/laboratorium", laboratorium);
routes.use("/testLabType", testLabType);
routes.use("/programType", programType);
routes.use("/testLab", testLab);

export default routes;
