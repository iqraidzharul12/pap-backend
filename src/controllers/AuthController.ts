import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { Patient } from "../entity";
import config from "../config/config";

class AuthController {
  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    let { email, password, role } = req.body;

    if (!(email && password)) {
      res.status(400).send({
        error: true,
        errorList: ["email and password must not empty"],
        data: null,
      });
      return;
    }
    if (role && role.toLowerCase() === "patient") {
      //Get user from database
      const userRepository = getRepository(Patient);
      let patient: Patient;
      try {
        patient = await userRepository.findOneOrFail({ where: { email } });
      } catch (error) {
        res.status(401).send({
          error: true,
          errorList: ["invalid email"],
          data: null,
        });
        return;
      }

      //Check if encrypted password match
      if (!patient.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send({
          error: true,
          errorList: ["invalid password"],
          data: null,
        });
        return;
      }

      //Sign JWT, valid for 1 hour
      const token = jwt.sign(
        { userId: patient.id, email: patient.email },
        config.jwtSecret,
        { expiresIn: "3h" }
      );

      delete patient.password;

      //Send the jwt in the response
      res.setHeader("Authorization", `Bearer ${token}`);
      res.status(200).send(patient);
    } else {
      res.status(401).send({
        error: true,
        errorList: ["invalid email or password"],
        data: null,
      });
      return;
    }
  };

  static changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { oldPassword, newPassword, role } = req.body;

    if (!(oldPassword && newPassword)) {
      res.status(400).send({
        error: true,
        errorList: ["email and password must not empty"],
        data: null,
      });
      return;
    }

    if (role && role.toLowerCase() === "patient") {
      //Get user from the database
      const userRepository = getRepository(Patient);
      let user: Patient;
      try {
        user = await userRepository.findOneOrFail(id);
      } catch (id) {
        res.status(401).send({
          error: true,
          errorList: ["no patient found"],
          data: null,
        });
        return;
      }

      //Check if old password matchs
      if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
        res.status(401).send({
          error: true,
          errorList: ["wrong password"],
          data: null,
        });
        return;
      }

      //Validate de model (password lenght)
      user.password = newPassword;
      const errors = await validate(user);
      const errorList = [];
      if (errors.length > 0) {
        errors.forEach((item) => {
          if (item.constraints.isNotEmpty)
            errorList.push(item.constraints.isNotEmpty);
          if (item.constraints.isEmail)
            errorList.push(item.constraints.isEmail);
          if (item.constraints.length) errorList.push(item.constraints.length);
        });
        res.status(400).send({
          error: true,
          errorList: errorList,
          data: null,
        });
        return;
      }
      //Hash the new password and save
      user.hashPassword();
      userRepository.save(user);

      res.status(202).send({
        error: false,
        errorList: errorList,
        data: "Password changed",
      });
    } else {
      res.status(401).send({
        error: true,
        errorList: ["specify the role"],
        data: null,
      });
      return;
    }
  };
}
export default AuthController;
