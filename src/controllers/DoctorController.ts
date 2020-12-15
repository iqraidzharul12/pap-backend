import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Doctor } from "../entity";
import { randomString } from "../utils/String";

class DoctorController {
  static listAll = async (req: Request, res: Response) => {
    const { status } = req.query
    let doctors: Doctor[]
    const repository = getRepository(Doctor);
    if (status) {
      if (status.toString().toLowerCase() === 'pending') {
        doctors = await repository.find({ where: { status: 1, isApproved: null }, order: { updatedAt: "DESC" } });
      } else if (status.toString().toLowerCase() === 'approved') {
        doctors = await repository.find({ where: { status: 1, isApproved: true }, order: { updatedAt: "DESC" } });
      } else if (status.toString().toLowerCase() === 'rejected') {
        doctors = await repository.find({ where: { status: 1, isApproved: false }, order: { updatedAt: "DESC" } });
      } else if (status.toString().toLowerCase() === 'all') {
        doctors = await repository.find({ where: [{ status: 1, isApproved: true }, { status: 1, isApproved: false }], order: { updatedAt: "DESC" } });
      }
    } else {
      doctors = await repository.find({ where: { status: 1 }, order: { createdAt: "ASC" } });
    }
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

  static create = async (req: Request, res: Response) => {
    //Get parameters from the body
    let {
      fullname,
      // dateOfBirth,
      idNumber,
      // idPicture,
      // selfiePicture,
      // gender,
      hospital,
      email,
      city,
      consent,
    } = req.body;
    let doctor = new Doctor();
    doctor.fullname = fullname;
    // doctor.dateOfBirth = dateOfBirth;
    doctor.idNumber = idNumber;
    // doctor.idPicture = idPicture;
    // doctor.selfiePicture = selfiePicture;
    // doctor.gender = gender;
    doctor.hospital = hospital;
    doctor.email = email;
    doctor.status = 1;
    doctor.code = randomString(5);
    doctor.verificationCode = randomString(6);
    doctor.city = city;
    doctor.consent = consent;

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
      errorList.push("email telah digunakan");
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
      // dateOfBirth,
      idNumber,
      // idPicture,
      // selfiePicture,
      // gender,
      email,
    } = req.body;

    //Try to find data on database
    const repository = getRepository(Doctor);
    let doctor: Doctor;
    try {
      doctor = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
    } catch (error) {
      //If tidak ditemukan, send a 404 response
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }

    //Validate the new values on model
    doctor.fullname = fullname;
    // doctor.dateOfBirth = dateOfBirth;
    doctor.idNumber = idNumber;
    // doctor.idPicture = idPicture;
    // doctor.selfiePicture = selfiePicture;
    // doctor.gender = gender;
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
      doctor = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    doctor.status = 0;
    repository.save(doctor);


    res.status(200).send({ data: "success" });
  };

  static approve = async (req: Request, res: Response) => {
    let { id } = req.body;

    //Get data from database
    const repository = getRepository(Doctor);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
      if (result) {
        result.isApproved = true;
        repository.save(result)
        res.status(200).send(result);
      } else {
        res.status(404).send({
          error: false,
          errorList: ["Data dokter tidak ditemukan"],
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data dokter tidak ditemukan"],
        data: null,
      });
      return;
    }
  }

  static reject = async (req: Request, res: Response) => {
    let { id, message } = req.body;

    //Get the user from database
    const repository = getRepository(Doctor);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
      if (result) {
        result.message = message;
        result.isApproved = false;
        repository.save(result)
        //Send the users object
        res.status(200).send(result);
      } else {
        res.status(404).send({
          error: false,
          errorList: ["Data dokter tidak ditemukan"],
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data dokter tidak ditemukan"],
        data: null,
      });
      return;
    }
  }
}

export default DoctorController;
