import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Doctor, Pharmacy, Patient, Program, ProgramType, TestLab, TestLabType } from "../entity";

class ProgramController {
  static listAll = async (req: Request, res: Response) => {
    const { checkPoint } = req.query
    let conditions = {}
    if (checkPoint) {
      conditions = {
        // status: 1,
        checkPoint: checkPoint,
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
      ],
    });

    //Send the users objectz
    res.status(200).send(results);
  };

  static listApprovedProgram = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Program);
    const results = await repository.find({
      where: { isApproved: true },
      relations: [
        "patient",
        "doctor",
        "programType",
        "pharmacy",
        "programEvidences",
        "testLab",
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
        data: null,
      });
      return;
    }
  };

  static create = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { patientId, doctorId, programTypeId } = req.body;

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
        data: null,
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
        data: null,
      });
      return;
    }
    try {
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data program tidak ditemukan"],
        data: null,
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
      if (!prevProgram.isApproved || prevProgram.checkPoint < 4) {
        prevProgram.status = 0
      }
      else {
        res.status(404).send({
          error: false,
          errorList: ["Anda telah memiliki program pap yang sedang aktif"],
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

    //If all ok, send 201 response
    res.status(201).send(program);
  };

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
          error: false,
          errorList: ["Kode verifikasi salah"],
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
  }

  static approve = async (req: Request, res: Response) => {
    let { id, pharmacyId } = req.body;

    const pharmacyRepository = getRepository(Pharmacy);
    let pharmacy: Pharmacy;
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
        data: null,
      });
      return;
    }

    //Get data from database
    const repository = getRepository(Program);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1, checkPoint: 4 },
      });
      if (result) {
        result.checkPoint = 5;
        result.pharmacy = pharmacy;
        result.isApproved = true;
        result.enrollDate = new Date();
        repository.save(result)
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
        data: null,
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
      });
      if (result) {
        result.checkPoint = 5;
        result.message = message;
        result.isApproved = false;
        repository.save(result)
        //Send the users object
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
        data: null,
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
      });
      console.log(result);
      if (result) {
        result.isDrugsTaken = true;
        result.drugsTakenDate = new Date();
        repository.save(result)
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
        data: null,
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
      });
      if (result) {
        result.checkPoint = 6;
        result.isTerminated = true;
        result.terminatedMessage = message;
        result.terminatedDate = new Date();
        repository.save(result)
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
        data: null,
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
        relations: ['patient', "doctor", "testLab", "programType"]
      });
      if (result) {
        result.checkPoint = 6;
        result.isTerminated = false;
        repository.save(result)

        let newProgram = new Program()
        newProgram.patient = result.patient
        newProgram.doctor = result.doctor
        newProgram.testLab = result.testLab
        newProgram.programType = result.programType
        newProgram.checkPoint = 3
        newProgram.status = 1
        newProgram.prevProgram = result

        await repository.save(newProgram)
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
        data: null,
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
        data: null,
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
        data: null,
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
        data: null,
      });
      return;
    }
    program.status = 0;
    repository.save(program);


    res.status(200).send({ data: "success" });
  };
}

export default ProgramController;
