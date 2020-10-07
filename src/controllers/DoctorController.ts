import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Doctor } from "../entity";

class DoctorController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Doctor);
    const doctors = await repository.find({ where: { status: 1 } });

    //Send the users object
    res.status(200).send(doctors);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Doctor);
    try {
      const doctor = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
      //Send the users object
      res.status(200).send(doctor);
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data not found"],
        data: null,
      });
      return;
    }
  };

  static create = async (req: Request, res: Response) => {
    //Get parameters from the body
    let {
      fullname,
      dateOfBirth,
      idNumber,
      idPicture,
      selfiePicture,
      gender,
      email,
    } = req.body;
    let doctor = new Doctor();
    doctor.fullname = fullname;
    doctor.dateOfBirth = dateOfBirth;
    doctor.idNumber = idNumber;
    doctor.idPicture = idPicture;
    doctor.selfiePicture = selfiePicture;
    doctor.gender = gender;
    doctor.email = email;
    doctor.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(doctor);
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

    //Try to save
    const repository = getRepository(Doctor);
    try {
      await repository.save(doctor);
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
    res.status(201).send({ data: "Doctor created" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let {
      fullname,
      dateOfBirth,
      idNumber,
      idPicture,
      selfiePicture,
      gender,
      email,
    } = req.body;

    //Try to find data on database
    const repository = getRepository(Doctor);
    let doctor: Doctor;
    try {
      doctor = await repository.findOneOrFail({ where: { id: id, status: 1 } });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({
        error: false,
        errorList: ["Data not found"],
        data: null,
      });
      return;
    }

    //Validate the new values on model
    doctor.fullname = fullname;
    doctor.dateOfBirth = dateOfBirth;
    doctor.idNumber = idNumber;
    doctor.idPicture = idPicture;
    doctor.selfiePicture = selfiePicture;
    doctor.gender = gender;
    doctor.email = email;

    const errors = await validate(doctor);
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

    try {
      await repository.save(doctor);
    } catch (e) {
      errorList.push("failed to edit data");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    res.status(200).send({ data: "success" });
  };

  static delete = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    const repository = getRepository(Doctor);
    let doctor: Doctor;
    try {
      doctor = await repository.findOneOrFail({ where: { id: id, status: 1 } });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data not found"],
        data: null,
      });
      return;
    }
    doctor.status = 0;
    repository.save(doctor);


    res.status(200).send({ data: "success" });
  };
}

export default DoctorController;
