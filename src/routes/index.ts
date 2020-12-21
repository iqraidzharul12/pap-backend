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
import pharmacy from "./pharmacy";
import price from "./price";
import program from "./program";
import programEvidence from "./programEvidence";
import voucher from "./voucher";
import news from "./news";
import notification from "./notification";
import report from "./report";
import mail from "./mail";
import help from "./help";
import city from "./city";
import dashboard from "./dashboard";

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
routes.use("/pharmacy", pharmacy);
routes.use("/price", price);
routes.use("/program", program);
routes.use("/programEvidence", programEvidence);
routes.use("/voucher", voucher);
routes.use("/news", news);
routes.use("/notification", notification);
routes.use("/report", report);
routes.use("/mail", mail);
routes.use("/help", help);
routes.use("/city", city);
routes.use("/dashboard", dashboard);

export default routes;
