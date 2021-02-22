import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Doctor, Pharmacy, Patient, Program, ProgramType, TestLab, TestLabType, Price, ProgramEvidence } from "../entity";
import NotificationController from "./NotificationController";
import { ConfirmDrugsEmail, ContinueProgramEmail, sendMail, SignedDocumentEmail, TerminateProgramEmail } from "../utils/mailer";
import { sendPushNotification } from "../utils/notification";
import { addDays } from "date-fns";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

class ProgramController {
  static listAll = async (req: Request, res: Response) => {
    const { checkPoint, status } = req.query
    let conditions = {}
    if (status && checkPoint) {
      conditions = {
        status: status,
        checkPoint: checkPoint,
      }
    } else if (checkPoint) {
      conditions = {
        checkPoint: checkPoint,
      }
    } else if (status) {
      conditions = {
        status: status,
      }
    }
    // else {
    //   conditions = {
    //     status: 1
    //   }
    // }
    //Get users from database
    const repository = getRepository(Program);
    const results = await repository.find({
      where: conditions,
      relations: [
        "patient",
        "doctor",
        "programType",
        "pharmacy",
        "programEvidences",
        "testLab",
        "price",
      ],
    });

    //Send the users objectz
    res.status(200).send(results);
  };

  static listApprovedProgram = async (req: Request, res: Response) => {

    const bearerToken = <string>req.headers.authorization;
    let token = ""
    if (bearerToken) token = bearerToken.split(" ")[1];

    let conditions = {}
    let pharmacy: Pharmacy

    //Try to validate the token and get data
    try {
      let jwtPayload = <any>jwt.verify(token, config.jwtSecret);

      const { userId, email, role } = jwtPayload;

      if (role == "pharmacy") {
        pharmacy = await getRepository(Pharmacy).findOneOrFail({
          where: {
            id: userId
          }
        })
        conditions = { isApproved: true, pharmacy: pharmacy, status: 1 }
      }
    } catch (error) {
      conditions = { isApproved: true, status: 1 }
    }

    //Get users from database
    const repository = getRepository(Program);
    const results = await repository.find({
      where: conditions,
      relations: [
        "patient",
        "doctor",
        "programType",
        "pharmacy",
        "programEvidences",
        "testLab",
        "price",
      ],
    });

    //Send the users object
    res.status(200).send(results);
  };

  static historyProgram = async (req: Request, res: Response) => {

    const bearerToken = <string>req.headers.authorization;
    let token = ""
    if (bearerToken) token = bearerToken.split(" ")[1];

    let conditions = {}
    let pharmacy: Pharmacy

    //Try to validate the token and get data
    try {
      let jwtPayload = <any>jwt.verify(token, config.jwtSecret);

      const { userId, email, role } = jwtPayload;

      if (role == "pharmacy") {
        pharmacy = await getRepository(Pharmacy).findOneOrFail({
          where: {
            id: userId
          }
        })
        conditions = { isApproved: true, pharmacy: pharmacy }
      }
    } catch (error) {
      conditions = { isApproved: true, status: 1 }
    }

    //Get users from database
    const repository = getRepository(Program);
    const results = await repository.find({
      where: conditions,
      relations: [
        "patient",
        "doctor",
        "programType",
        "pharmacy",
        "programEvidences",
        "testLab",
        "price",
      ],
    });

    //Send the users object
    res.status(200).send(results);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Program);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id }, order: {
          createdAt: "ASC"
        },
        relations: [
          "patient",
          "doctor",
          "programType",
          "pharmacy",
          "programEvidences",
          "testLab",
          "price",
        ],
      });
      try {
        const testLab = await getRepository(TestLab).findOneOrFail({
          where: { id: result.testLab.id, status: 1 }, order: {
            createdAt: "ASC"
          },
          relations: [
            "testLabEvidences",
            "testLabType",
          ],
        });
        result.testLab = testLab
      } catch {
        result.testLab = null
      }
      //Send the users object
      res.status(200).send(result);
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: error,
      });
      return;
    }
  };

  static create = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { patientId, doctorId, programTypeId, consent } = req.body;

    const patientRepository = getRepository(Patient);
    const doctorRepository = getRepository(Doctor);
    const programTypeRepository = getRepository(ProgramType);
    let patient: Patient;
    let doctor: Doctor;
    let programType: ProgramType;
    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: patientId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data pasien tidak ditemukan"],
        data: error,
      });
      return;
    }
    try {
      doctor = await doctorRepository.findOneOrFail({
        where: { id: doctorId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data dokter tidak ditemukan"],
        data: error,
      });
      return;
    }
    try {
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 }, order: {
          createdAt: "ASC"
        },
        relations: ["defaultSchedules"]
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data program tidak ditemukan"],
        data: error,
      });
      return;
    }

    const repository = getRepository(Program);
    let prevProgram: Program
    try {
      prevProgram = await repository.findOneOrFail({
        where: { patient: patient, status: 1 }, order: {
          createdAt: "ASC"
        }, relations: ["testLab"]
      });
      if (!prevProgram.isApproved || prevProgram.checkPoint < 4 || prevProgram.isTerminated) {
        prevProgram.status = 0
      }
      else {
        res.status(404).send({
          error: false,
          errorList: ["Anda telah memiliki program PULIH yang sedang aktif"],
          data: null,
        });
        return;
      }

    } catch (error) {
      prevProgram = null
    }

    let program = new Program();
    program.patient = patient;
    program.doctor = doctor;
    program.programType = programType;
    program.status = 1;

    const testLabRepository = getRepository(TestLab);
    let testLab: TestLab;
    try {
      testLab = await testLabRepository.findOneOrFail({
        where: { patient, status: 1 }, order: {
          createdAt: "DESC"
        }, relations: ['testLabType']
      });
      const testLabType = await getRepository(TestLabType).findOneOrFail({
        where: { id: testLab.testLabType.id, status: 1 }, order: {
          createdAt: "ASC"
        }, relations: ['programType']
      });

      if (testLabType.programType.id === programType.id) {
        program.checkPoint = 2;
        program.testLab = testLab
      }
    } catch (error) {
      program.checkPoint = 1;
    }

    //Validade if the parameters are ok
    const errors = await validate(program);
    const errorList = [];
    if (errors.length > 0) {
      errors.forEach((item) => {
        if (item.constraints.isNotEmpty)
          errorList.push(item.constraints.isNotEmpty);
      });
      res.status(400).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }


    try {
      if (prevProgram) {
        await repository.save(prevProgram);
      }
      await repository.save(program);
    } catch (e) {
      errorList.push("Gagal mendaftar program");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //save patient consent
    if (consent) {
      try {
        patient.consent = consent
        await patientRepository.save(patient);
      } catch (e) {
        console.log(e);
      }
    }

    try {
      await sendMail(program.patient.email, SignedDocumentEmail.subject, SignedDocumentEmail.body)
    } catch (e) {
      console.log(e);
    }

    const notificationMessage = `Dokumen Persetujuan Anda telah berhasil ditanda tangani.`
    const notification = await NotificationController.create(notificationMessage, program.patient)
    if (notification.error) {
      console.log(`failed to save notification for patient: ${program.patient}`);
    }

    //If all ok, send 201 response
    res.status(201).send(program);
  };

  static updateTestLab = async (req: Request, res: Response) => {
    let { id, testLabId } = req.body;

    //Get the user from database
    const repository = getRepository(Program);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1, checkPoint: 1 },
        relations: ['doctor']
      });
      const testLab = await getRepository(TestLab).findOneOrFail({
        where: { id: testLabId, status: 1 }
      })
      result.testLab = testLab
      result.checkPoint = 2;
      repository.save(result)
      //Send the users object
      res.status(200).send(result);
    } catch (error) {
      console.log(error)
      res.status(404).send({
        error: true,
        errorList: ["Data tidak ditemukan"],
        data: error,
      });
      return;
    }
  }

  static checkDoctorConfirmation = async (req: Request, res: Response) => {
    let { id, confirmationCode } = req.body;
    console.log(confirmationCode);

    //Get the user from database
    const repository = getRepository(Program);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1, checkPoint: 2 },
        relations: ['doctor']
      });
      if (result && result.doctor.verificationCode === confirmationCode) {
        result.checkPoint = 3;
        repository.save(result)
        //Send the users object
        res.status(200).send(result);
      } else {
        res.status(404).send({
          error: true,
          errorList: ["Kode verifikasi salah"],
          data: null,
        });
        return;
      }
    } catch (error) {
      console.log(error)
      res.status(404).send({
        error: true,
        errorList: ["Data tidak ditemukan"],
        data: error,
      });
      return;
    }
  }

  static approve = async (req: Request, res: Response) => {
    let { id, pharmacyId, priceId } = req.body;

    const pharmacyRepository = getRepository(Pharmacy);
    let pharmacy: Pharmacy;
    const priceRepository = getRepository(Price);
    let price: Price;
    try {
      pharmacy = await pharmacyRepository.findOneOrFail({
        where: { id: pharmacyId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data apotek tidak ditemukan"],
        data: error,
      });
      return;
    }

    try {
      price = await priceRepository.findOneOrFail({
        where: { id: priceId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data harga tidak ditemukan"],
        data: error,
      });
      return;
    }

    //Get data from database
    const repository = getRepository(Program);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1, checkPoint: 4 },
        relations: ['patient']
      });
      if (result) {
        result.checkPoint = 5;
        result.pharmacy = pharmacy;
        result.price = price;
        result.isApproved = true;
        result.enrollDate = new Date();
        repository.save(result)

        const notificationMessage = "Pendaftaran program Anda telah diterima, silakan scan QR di apotek yang telah ditentukan untuk mendapatkan obat Anda."
        const notification = await NotificationController.create(notificationMessage, result.patient)
        if (notification.error) {
          console.log(`failed to save approval notification for patient: ${result.patient}`);
        }

        sendPushNotification(result.patient.clientToken, "Pengajuan program diterima", "Pendaftaran program Anda telah diterima, silakan scan QR di apotek yang telah ditentukan untuk mendapatkan obat Anda.")

        res.status(200).send(result);
      } else {
        res.status(404).send({
          error: false,
          errorList: ["Data program tidak ditemukan"],
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data program tidak ditemukan"],
        data: error,
      });
      return;
    }
  }

  static reject = async (req: Request, res: Response) => {
    let { id, message } = req.body;

    //Get the user from database
    const repository = getRepository(Program);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1, checkPoint: 4 },
        relations: ['patient']
      });
      console.log(result);
      result.checkPoint = 5;
      result.message = message;
      result.isApproved = false;
      repository.save(result)

      const notificationMessage = `Pendaftaran program Anda telah ditolak dengan alasan: ${message}.`
      const notification = await NotificationController.create(notificationMessage, result.patient)
      if (notification.error) {
        console.log(`failed to save reject notification for patient: ${result.patient}`);
      }
      sendPushNotification(result.patient.clientToken, "Pengajuan program ditolak", `Pendaftaran program Anda telah ditolak dengan alasan: ${message}.`)

      //Send the users object
      res.status(200).send(result);
    } catch (error) {
      console.log(error);
      res.status(404).send({
        error: false,
        errorList: ["Data program tidak ditemukan"],
        data: error,
      });
      return;
    }
  }

  static updateDrugsTaken = async (req: Request, res: Response) => {
    const { id } = req.body
    //Get data from database
    const repository = getRepository(Program);
    console.log(id);

    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1, checkPoint: 5, isApproved: true },
        relations: ["patient", "pharmacy"]
      });
      console.log(result);
      if (result) {
        result.isDrugsTaken = true;
        result.drugsTakenDate = new Date();
        result.reminderDate = addDays(new Date(), 25);
        repository.save(result)

        try {
          await sendMail(result.patient.email, ConfirmDrugsEmail(result.pharmacy).subject, ConfirmDrugsEmail(result.pharmacy).body)
        } catch (e) {
          console.log(e);
        }

        const notificationMessage = `Anda telah melakukan pengambilan obat di ${result.pharmacy.name}, ${result.pharmacy.address}.`
        const notification = await NotificationController.create(notificationMessage, result.patient)
        if (notification.error) {
          console.log(`failed to save notification for patient: ${result.patient}`);
        }

        sendPushNotification(result.patient.clientToken, "Pengambilan Obat", `Anda telah melakukan pengambilan obat di ${result.pharmacy.name}, ${result.pharmacy.address}.`)

        res.status(200).send(result);
      } else {
        res.status(404).send({
          error: false,
          errorList: ["Status program gagal diubah"],
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data program tidak ditemukan"],
        data: error,
      });
      return;
    }
  }

  static terminate = async (req: Request, res: Response) => {
    let { id, message } = req.body;
    //Get data from database
    const repository = getRepository(Program);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1, checkPoint: 5, isApproved: true, isDrugsTaken: true },
        relations: ['patient']
      });
      if (result) {
        result.checkPoint = 6;
        result.isTerminated = true;
        result.terminatedMessage = message;
        result.terminatedDate = new Date();
        repository.save(result)

        const notificationMessage = `Anda telah berhenti dari program PULIH dengan alasan: ${message}.`
        const notification = await NotificationController.create(notificationMessage, result.patient)
        if (notification.error) {
          console.log(`failed to save notification for patient: ${result.patient}`);
        }

        sendPushNotification(result.patient.clientToken, "Pemberhentian Program", `Anda telah berhenti dari program PULIH dengan alasan: ${message}.`)

        try {
          await sendMail(result.patient.email, TerminateProgramEmail.subject, TerminateProgramEmail.body)
        } catch (e) {
          console.log(e);
        }

        res.status(200).send(result);
      } else {
        res.status(404).send({
          error: false,
          errorList: ["Data program tidak ditemukan"],
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data program tidak ditemukan"],
        data: error,
      });
      return;
    }
  }

  static continueProgram = async (req: Request, res: Response) => {
    let { id } = req.body;
    //Get data from database
    const repository = getRepository(Program);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1, checkPoint: 5, isApproved: true, isDrugsTaken: true },
        relations: ['patient', "doctor", "testLab", "programType", "pharmacy", "price"]
      });
      if (result) {
        result.checkPoint = 6;
        result.isTerminated = false;
        result.status = 0;
        result.carryOverDate = new Date();
        repository.save(result)

        let newProgram = new Program()
        newProgram.patient = result.patient
        newProgram.doctor = result.doctor
        newProgram.testLab = result.testLab
        newProgram.programType = result.programType
        newProgram.checkPoint = 3
        newProgram.status = 1
        newProgram.prevProgram = result

        newProgram.enrollDate = result.enrollDate
        newProgram.pharmacy = result.pharmacy
        newProgram.price = result.price

        await repository.save(newProgram)

        const notificationMessage = "Program Anda telah berhasil diperpanjang, silakan upload resep terbaru melalui aplikasi"
        const notification = await NotificationController.create(notificationMessage, result.patient)
        if (notification.error) {
          console.log(`failed to save notification for patient: ${result.patient}`);
        }

        sendPushNotification(result.patient.clientToken, "Perpanjangan Program", "Program Anda telah berhasil diperpanjang, silakan upload resep terbaru melalui aplikasi")

        try {
          await sendMail(newProgram.patient.email, ContinueProgramEmail.subject, ContinueProgramEmail.body)
        } catch (e) {
          console.log(e);
        }

        res.status(200).send(newProgram);
      } else {
        res.status(404).send({
          error: false,
          errorList: ["Data program tidak ditemukan"],
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data program tidak ditemukan"],
        data: error,
      });
      return;
    }
  }

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { patientId, doctorId, programTypeId, pharmacyId } = req.body;

    const patientRepository = getRepository(Patient);
    const doctorRepository = getRepository(Doctor);
    const programTypeRepository = getRepository(ProgramType);
    const pharmacyRepository = getRepository(Pharmacy);
    let patient: Patient;
    let doctor: Doctor;
    let programType: ProgramType;
    let pharmacy: Pharmacy;
    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: patientId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      doctor = await doctorRepository.findOneOrFail({
        where: { id: doctorId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      pharmacy = await pharmacyRepository.findOneOrFail({
        where: { id: pharmacyId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Parameter data tidak ditemukan"],
        data: error,
      });
      return;
    }

    //Try to find data on database
    const repository = getRepository(Program);
    let program: Program;
    try {
      program = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      //If tidak ditemukan, send a 404 response
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: error,
      });
      return;
    }

    //Validate the new values on model
    program.patient = patient;
    program.doctor = doctor;
    program.programType = programType;
    program.pharmacy = pharmacy;

    const errors = await validate(program);
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
      await repository.save(program);
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

    const repository = getRepository(Program);
    let program: Program;
    try {
      program = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: error,
      });
      return;
    }
    program.status = 0;
    repository.save(program);


    res.status(200).send({ data: "success" });
  };

  static dashboardCreateEdit = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { programId, patientId, programDoctorId, programTypeId, consent } = req.body;

    const patientRepository = getRepository(Patient);
    const doctorRepository = getRepository(Doctor);
    const programTypeRepository = getRepository(ProgramType);
    let patient: Patient;
    let doctor: Doctor;
    let programType: ProgramType;
    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: patientId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data pasien tidak ditemukan"],
        data: error,
      });
      return;
    }
    try {
      doctor = await doctorRepository.findOneOrFail({
        where: { id: programDoctorId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data dokter tidak ditemukan"],
        data: error,
      });
      return;
    }
    try {
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 }, order: {
          createdAt: "ASC"
        },
        relations: ["defaultSchedules"]
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data program tidak ditemukan"],
        data: error,
      });
      return;
    }

    const repository = getRepository(Program);
    let prevProgram: Program
    let program: Program

    if (programId) {
      try {
        program = await repository.findOneOrFail({
          where: { id: programId, status: 1 }, order: {
            createdAt: "ASC"
          }, relations: ["testLab"]
        });
      } catch (error) {
        console.log("new program " + error)
      }
    } else {
      try {
        prevProgram = await repository.findOneOrFail({
          where: { patient: patient, status: 1 }, order: {
            createdAt: "ASC"
          }, relations: ["testLab"]
        });
        if (!prevProgram.isApproved || prevProgram.checkPoint < 4 || prevProgram.isTerminated) {
          prevProgram.status = 0
        }
        else {
          res.status(404).send({
            error: false,
            errorList: ["Anda telah memiliki program PULIH yang sedang aktif"],
            data: null,
          });
          return;
        }

      } catch (error) {
        prevProgram = null
      }
      program = new Program();
    }

    program.patient = patient;
    program.doctor = doctor;
    program.programType = programType;
    program.status = 1;

    const testLabRepository = getRepository(TestLab);
    let testLab: TestLab;
    try {
      testLab = await testLabRepository.findOneOrFail({
        where: { patient, status: 1 }, order: {
          createdAt: "DESC"
        }, relations: ['testLabType']
      });
      const testLabType = await getRepository(TestLabType).findOneOrFail({
        where: { id: testLab.testLabType.id, status: 1 }, order: {
          createdAt: "ASC"
        }, relations: ['programType']
      });

      if (testLabType.programType.id === programType.id) {
        program.checkPoint = 2;
        program.testLab = testLab
      }
    } catch (error) {
      program.checkPoint = 1;
    }

    //Validade if the parameters are ok
    const errors = await validate(program);
    const errorList = [];
    if (errors.length > 0) {
      errors.forEach((item) => {
        if (item.constraints.isNotEmpty)
          errorList.push(item.constraints.isNotEmpty);
      });
      res.status(400).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }


    try {
      if (prevProgram) {
        await repository.save(prevProgram);
      }
      await repository.save(program);
    } catch (e) {
      errorList.push("Gagal mendaftar program");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //save patient consent
    if (consent) {
      try {
        patient.consent = consent
        await patientRepository.save(patient);
      } catch (e) {
        console.log(e);
      }
    }

    try {
      await sendMail(program.patient.email, SignedDocumentEmail.subject, SignedDocumentEmail.body)
    } catch (e) {
      console.log(e);
    }

    const notificationMessage = `Dokumen Persetujuan Anda telah berhasil ditanda tangani.`
    const notification = await NotificationController.create(notificationMessage, program.patient)
    if (notification.error) {
      console.log(`failed to save notification for patient: ${program.patient}`);
    }

    let { confirmationCode } = req.body;

    try {
      const result = await repository.findOneOrFail({
        where: { id: programId, status: 1, checkPoint: 2 },
        relations: ['doctor']
      });
      if (result && result.doctor.verificationCode === confirmationCode) {
        result.checkPoint = 3;
        await repository.save(result)
      } else {
        res.status(404).send({
          error: true,
          errorList: ["Kode verifikasi salah"],
          data: null,
        });
        return;
      }
    } catch (error) {
      console.log(error)
      res.status(404).send({
        error: true,
        errorList: ["Data tidak ditemukan"],
        data: error,
      });
      return;
    }

    let { url } = req.body;

    const programRepository = getRepository(Program);
    try {
      program = await programRepository.findOneOrFail({
        where: { id: programId, status: 1, checkPoint: 3 }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Program tidak ditemukan"],
        data: error,
      });
      return;
    }

    const programEvidenceRepository = getRepository(ProgramEvidence);

    if (Array.isArray(url)) {
      url.forEach(async (item) => {
        let programEvidence = new ProgramEvidence();
        programEvidence.url = item;
        programEvidence.program = program;
        programEvidence.status = 1;

        try {
          await programEvidenceRepository.save(programEvidence);
        } catch (e) {
          errorList.push("Resep gagal di upload: " + item);
        }
      })
      if (errorList.length) {
        res.status(409).send({
          error: true,
          errorList: errorList,
          data: null,
        });
      }
    } else {
      let programEvidence = new ProgramEvidence();
      programEvidence.url = url;
      programEvidence.program = program;
      programEvidence.status = 1;
      try {
        await programEvidenceRepository.save(programEvidence);
      } catch (e) {
        console.log("Resep gagal di upload", e);
        errorList.push("Resep gagal di upload");
        res.status(409).send({
          error: true,
          errorList: errorList,
          data: null,
        });
        return;
      }
    }

    try {
      program.checkPoint = 4;
      if (program.prevProgram) {
        program.checkPoint = 5;
        program.isApproved = true
      }
      await programRepository.save(program);
    } catch (e) {
      console.log("Gagal mengupdate status program", e);
      errorList.push("Gagal mengupdate status program");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Berhasil menyimpan data program" });

    // //If all ok, send 201 response
    // res.status(201).send(program);
  };
}

export default ProgramController;
