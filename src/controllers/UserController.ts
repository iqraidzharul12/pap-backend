import { Request, Response } from "express";
import { getRepository, Like } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity";
import { formatNumberDigit } from "../utils/String";
import { RegisterMail, sendMail } from "../utils/mailer";

class UserController {
  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(User);
    try {
      const doctor = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      //Send the users object
      res.status(200).send(doctor);
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
  };
}

export default UserController;
