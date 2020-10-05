import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Doctor, Pharmacy, Patient, Program, ProgramType } from "../entity";

class ProgramController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Program);
    const results = await repository.find({
      where: { status: 1 },
      relations: [
        "patient",
        "doctor",
        "programType",
        "pharmacy",
        "programEvidences",
      ],
    });

    //Send the users objectz
    res.status(200).send({
      error: false,
      errorList: [],
      data: results,
    });
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Program);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 },
        relations: [
          "patient",
          "doctor",
          "programType",
          "pharmacy",
          "programEvidences",
        ],
      });
      //Send the users object
      res.status(200).send({
        error: false,
        errorList: [],
        data: result,
      });
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
        where: { id: patientId, status: 1 },
      });
      doctor = await doctorRepository.findOneOrFail({
        where: { id: doctorId, status: 1 },
      });
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 },
      });
      pharmacy = await pharmacyRepository.findOneOrFail({
        where: { id: pharmacyId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Parameter data not found"],
        data: null,
      });
      return;
    }

    let program = new Program();
    program.patient = patient;
    program.doctor = doctor;
    program.programType = programType;
    program.pharmacy = pharmacy;
    program.status = 1;

    //Validade if the parameters are ok
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

    const repository = getRepository(Program);
    try {
      await repository.save(program);
    } catch (e) {
      errorList.push("failed to save program type");
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
      data: "Program created",
    });
  };

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
        where: { id: patientId, status: 1 },
      });
      doctor = await doctorRepository.findOneOrFail({
        where: { id: doctorId, status: 1 },
      });
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 },
      });
      pharmacy = await pharmacyRepository.findOneOrFail({
        where: { id: pharmacyId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Parameter data not found"],
        data: null,
      });
      return;
    }

    //Try to find data on database
    const repository = getRepository(Program);
    let program: Program;
    try {
      program = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
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
    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static delete = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    const repository = getRepository(Program);
    let program: Program;
    try {
      program = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data not found"],
        data: null,
      });
      return;
    }
    program.status = 0;
    repository.save(program);

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}

export default ProgramController;