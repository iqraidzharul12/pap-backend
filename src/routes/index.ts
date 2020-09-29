import { Router } from "express";
import auth from "./auth";
import patient from "./patient";
import doctor from "./doctor";
import laboratorium from "./laboratorium";
import testLabType from "./testLabType";
import testLab from "./testLab";
import testLabEvidence from "./testLabEvidence";
import programType from "./programType";
import fileUpload from "./fileUpload";

const routes = Router();

routes.use("/auth", auth);
routes.use("/patient", patient);
routes.use("/doctor", doctor);
routes.use("/laboratorium", laboratorium);
routes.use("/testLabType", testLabType);
routes.use("/testLab", testLab);
routes.use("/testLabEvidence", testLabEvidence);
routes.use("/programType", programType);
routes.use("/upload", fileUpload);

export default routes;
