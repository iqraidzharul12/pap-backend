import { Request, Response } from "express";
import { sendMail } from "../utils/mailer";

class MailController {
  static send = async (req: Request, res: Response) => {
    const { recipient, subject, body } = req.body
    try {
      const mail = await sendMail(recipient, subject, body)
      //Send the users object
      res.status(200).send("SUCCESS");
    } catch (e) {
      //Send the users object
      res.status(400).send("FAIL " + e);
    }
  };
}

export default MailController