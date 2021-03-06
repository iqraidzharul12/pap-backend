import { Request, Response } from "express";
import { getRepository, Like } from "typeorm";
import { validate } from "class-validator";
import { City, Patient, Program, ProgramType, TestLab } from "../entity";
import { formatNumberDigit } from "../utils/String";
import { RegisterMail, sendMail } from "../utils/mailer";

class PatientController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Patient);
    const patients = await repository.find({ where: { status: 1 }, order: { createdAt: "ASC" } });
    patients.forEach((element) => {
      delete element.password;
    });

    //Send the users object
    res.status(200).send(patients);
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

  static getOneByCode = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Patient);
    const testLabRepository = getRepository(TestLab);
    const programRepository = getRepository(Program);
    const programTypeRepository = getRepository(ProgramType);
    try {
      const patient = await repository.findOneOrFail({
        where: { code: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });

      try {
        let testLabs = await testLabRepository.find({ where: { patient: patient, status: 1 }, relations: ['doctor', 'testLabType', 'laboratorium', 'voucher', 'testLabEvidences'] });
        patient.testLabs = testLabs
      } catch (error) {
        console.log("error when getting testLab data")
      }

      try {
        let programs = await programRepository.find({ where: { patient: patient, status: 1 }, relations: ['programType', 'pharmacy', 'doctor', 'programEvidences'] });

        console.log(JSON.stringify(programs))
        for (let index = 0; index < programs.length; index++) {
          if (programs[index].programType) {
            let programType = await programTypeRepository.findOne({ where: { id: programs[index].programType.id, status: 1 }, relations: ['defaultSchedules'] });
            programs[index].programType = programType
          }
        }
        patient.programs = programs
      } catch (error) {
        console.log("error when getting program data" + error)
      }
      //Send the users object
      res.status(200).send(patient);
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

    const cityRepository = getRepository(City);
    try {
      const city = await cityRepository.findOneOrFail({
        where: {
          name: patient.city
        }
      })
      cityCode = city.code
    }
    catch (e) {
      cityCode = "JKT";
    }

    // if (patient.city) {
    //   switch (patient.city.toLowerCase()) {
    //     case 'depok':
    //       cityCode = "DPK";
    //       break;
    //     case 'bekasi':
    //       cityCode = "BKS";
    //       break;
    //     case 'dki jakarta':
    //       cityCode = "JKT";
    //       break;
    //     case 'tangerang':
    //       cityCode = "TGR";
    //       break;
    //     case 'bogor':
    //       cityCode = "BGR";
    //       break;
    //     case 'bandung':
    //       cityCode = "BDG";
    //       break;
    //     case 'cirebon':
    //       cityCode = "CRB";
    //       break;
    //     case 'surabaya':
    //       cityCode = "SBY";
    //       break;
    //     case 'semarang':
    //       cityCode = "SMR";
    //       break;
    //     default:
    //       cityCode = "JKT";
    //       break;
    //   }
    // }

    patient.code = year + cityCode

    try {
      const patientLists = await userRepository.find({ code: Like(`%${patient.code}%`) });
      const lastIndex = patientLists.length + 1
      patient.code += formatNumberDigit(3, lastIndex)
    } catch (e) {
      errorList.push("gagal membuat id pasien");
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
      console.log(e);
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    try {
      await sendMail(patient.email, RegisterMail.subject, RegisterMail.body)
    } catch (e) {
      console.log(e);
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Pasien berhasil dibuat", code: patient.code });
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
      errorList.push("Gagal menyimpan data, email sudah terdaftar");
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

  static updateClientToken = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let {
      clientToken
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
      console.log("failed to save client token");
    }

    //Validate the new values on model
    patient.clientToken = clientToken;

    try {
      await repository.save(patient);
    } catch (e) {
      console.log("failed to save client token");
    }

    res.status(200).send({ data: "success" });
  };

  static updateConsent = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let {
      consent
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
      console.log("failed to save client token");
    }

    //Validate the new values on model
    patient.consent = consent;

    try {
      await repository.save(patient);
    } catch (e) {
      console.log("failed to save consent");
    }

    res.status(200).send({ data: "success" });
  };

  static getAllPatientData = async (req: Request, res: Response) => {
    //Get the user from database
    const repository = getRepository(Patient);
    const testLabRepository = getRepository(TestLab);
    const programRepository = getRepository(Program);
    const programTypeRepository = getRepository(ProgramType);
    let patientList = []
    try {
      patientList = await repository.find({
        where: { status: 1 }, order: {
          createdAt: "ASC"
        },
        relations: ['programs', 'programs.doctor', 'programs.pharmacy', 'programs.prevProgram']
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }

    if(patientList && patientList.length){
      for (let i = 0; i < patientList.length; i++) {
        const patient = patientList[i];
        if(patient.programs && patient.programs.length){
          let activePrograms = patient.programs.filter((item)=> item.status === 1)
          patient.programs = []
          patient.program = activePrograms[0]
          // }
        }else{
          patient.program = null
        }
      }
      //Send the users object
      res.status(200).send(patientList);
    }else{
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
  };
}

export default PatientController;
