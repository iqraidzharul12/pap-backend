import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { Patient } from "../entity";

class UserController {
  // static listAll = async (req: Request, res: Response) => {
  //   //Get users from database
  //   const userRepository = getRepository(User);
  //   const users = await userRepository.find({
  //     select: ["id", "username", "role"], //We dont want to send the passwords on response
  //   });

  //   //Send the users object
  //   res.send(users);
  // };

  // static getOneById = async (req: Request, res: Response) => {
  //   //Get the ID from the url
  //   const id = req.params.id;

  //   //Get the user from database
  //   const userRepository = getRepository(User);
  //   try {
  //     const user = await userRepository.findOneOrFail(id, {
  //       select: ["id", "username", "role"], //We dont want to send the password on response
  //     });
  //   } catch (error) {
  //     res.status(404).send("User not found");
  //   }
  // };

  static newPatient = async (req: Request, res: Response) => {
    //Get parameters from the body
    let {
      fullname,
      dateOfBirth,
      idNumber,
      idPicture,
      selfiePicture,
      gender,
      email,
      password,
      representativeName,
      representativePhone,
      representativeRelationship,
    } = req.body;
    let patient = new Patient();
    patient.fullname = fullname;
    patient.dateOfBirth = dateOfBirth;
    patient.idNumber = idNumber;
    patient.idPicture = idPicture;
    patient.selfiePicture = selfiePicture;
    patient.gender = gender;
    patient.email = email;
    patient.password = password;
    patient.representativeName = representativeName;
    patient.representativePhone = representativePhone;
    patient.representativeRelationship = representativeRelationship;
    patient.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(patient);
    const errorList = [];
    if (errors.length > 0) {
      errors.forEach((item) => {
        if (item.constraints.isNotEmpty)
          errorList.push(item.constraints.isNotEmpty);
        if (item.constraints.isEmail) errorList.push(item.constraints.isEmail);
        if (item.constraints.length) errorList.push(item.constraints.length);
      });
      res.status(400).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //Hash the password, to securely store on DB
    patient.hashPassword();

    //Try to save. If fails, the username is already in use
    const userRepository = getRepository(Patient);
    try {
      await userRepository.save(patient);
    } catch (e) {
      errorList.push("email already in use");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({
      error: false,
      errorList: [],
      data: "Patient created",
    });
  };

  // static editUser = async (req: Request, res: Response) => {
  //   //Get the ID from the url
  //   const id = req.params.id;

  //   //Get values from the body
  //   const { username, role } = req.body;

  //   //Try to find user on database
  //   const userRepository = getRepository(User);
  //   let user;
  //   try {
  //     user = await userRepository.findOneOrFail(id);
  //   } catch (error) {
  //     //If not found, send a 404 response
  //     res.status(404).send("User not found");
  //     return;
  //   }

  //   //Validate the new values on model
  //   user.username = username;
  //   user.role = role;
  //   const errors = await validate(user);
  //   if (errors.length > 0) {
  //     res.status(400).send(errors);
  //     return;
  //   }

  //   //Try to safe, if fails, that means username already in use
  //   try {
  //     await userRepository.save(user);
  //   } catch (e) {
  //     res.status(409).send("username already in use");
  //     return;
  //   }
  //   //After all send a 204 (no content, but accepted) response
  //   res.status(204).send();
  // };

  // static deleteUser = async (req: Request, res: Response) => {
  //   //Get the ID from the url
  //   const id = req.params.id;

  //   const userRepository = getRepository(Patient);
  //   let patient: Patient;
  //   try {
  //     patient = await userRepository.findOneOrFail(id);
  //   } catch (error) {
  //     res.status(404).send("User not found");
  //     return;
  //   }
  //   userRepository.delete(id);

  //   //After all send a 204 (no content, but accepted) response
  //   res.status(204).send();
  // };
}

export default UserController;
