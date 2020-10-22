import { Request, Response } from "express";
import { getRepository, Like } from "typeorm";
import { validate } from "class-validator";
import { Patient } from "../entity";
import { formatNumberDigit } from "../utils/String";

class PatientController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Patient);
    const doctors = await repository.find({ where: { status: 1 }, order: { createdAt: "ASC" } });
    doctors.forEach((element) => {
      delete element.password;
    });

    //Send the users object
    res.status(200).send(doctors,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Patient);
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
      city,
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
    patient.city = city;
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

    //Try to save
    const userRepository = getRepository(Patient);

    let year = (new Date()).getFullYear().toString();
    let cityCode = "JKT";
    switch (patient.city.toString().toLowerCase()) {
      case 'depok':
        cityCode = "DPK";
        break;
      case 'bekasi':
        cityCode = "BKS";
        break;
      case 'dki jakarta':
        cityCode = "JKT";
        break;
      case 'tangerang':
        cityCode = "TGR";
        break;
      case 'bogor':
        cityCode = "BGR";
        break;
      case 'bandung':
        cityCode = "BDG";
        break;
      case 'cirebon':
        cityCode = "CRB";
        break;
      case 'surabaya':
        cityCode = "SBY";
        break;
      case 'semarang':
        cityCode = "SMR";
        break;
      default:
        cityCode = "JKT";
        break;
    }

    patient.code = year + cityCode

    try {
      const patientLists = await userRepository.find({ code: Like(`%${patient.code}%`) });
      const lastIndex = patientLists.length
      patient.code += formatNumberDigit(3, lastIndex)
    } catch (e) {
      errorList.push("tidak bisa membuat id pasien");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    try {
      await userRepository.save(patient);
    } catch (e) {
      errorList.push("email telah terdaftar");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Pasien berhasil dibuat" });
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
      representativeName,
      representativePhone,
      representativeRelationship,
    } = req.body;

    //Try to find data on database
    const repository = getRepository(Patient);
    let patient: Patient;
    try {
      patient = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
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
    patient.fullname = fullname;
    patient.dateOfBirth = dateOfBirth;
    patient.idNumber = idNumber;
    patient.idPicture = idPicture;
    patient.selfiePicture = selfiePicture;
    patient.gender = gender;
    patient.email = email;
    patient.representativeName = representativeName;
    patient.representativePhone = representativePhone;
    patient.representativeRelationship = representativeRelationship;

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

    try {
      await repository.save(patient);
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

    const repository = getRepository(Patient);
    let patient: Patient;
    try {
      patient = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    patient.status = 0;
    repository.save(patient);


    res.status(200).send({ data: "success" });
  };
}

export default PatientController;
