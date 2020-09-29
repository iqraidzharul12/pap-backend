import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Doctor, Laboratorium, Patient, TestLab, TestLabType } from "../entity";

class TestLabController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(TestLab);
    const results = await repository.find({ where: { status: 1 } });

    //Send the users object
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
    const repository = getRepository(TestLab);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 },
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
    }
  };

  static create = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { patientId, doctorId, testLabTypeId, laboratoriumId } = req.body;

    const patientRepository = getRepository(Patient);
    const doctorRepository = getRepository(Doctor);
    const testLabTypeRepository = getRepository(TestLabType);
    const laboratoriumRepository = getRepository(Laboratorium);
    let patient: Patient;
    let doctor: Doctor;
    let testLabType: TestLabType;
    let laboratorium: Laboratorium;
    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: patientId, status: 1 },
      });
      doctor = await doctorRepository.findOneOrFail({
        where: { id: doctorId, status: 1 },
      });
      testLabType = await testLabTypeRepository.findOneOrFail({
        where: { id: testLabTypeId, status: 1 },
      });
      laboratorium = await laboratoriumRepository.findOneOrFail({
        where: { id: laboratoriumId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Parameter data not found"],
        data: null,
      });
    }

    let testLab = new TestLab();
    testLab.patient = patient;
    testLab.doctor = doctor;
    testLab.testLabType = testLabType;
    testLab.laboratorium = laboratorium;
    testLab.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(TestLab);
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

    const repository = getRepository(TestLab);
    try {
      await repository.save(testLab);
    } catch (e) {
      errorList.push("failed to save testLab type");
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
      data: "TestLab type created",
    });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { patientId, doctorId, testLabTypeId, laboratoriumId } = req.body;

    const patientRepository = getRepository(Patient);
    const doctorRepository = getRepository(Doctor);
    const testLabTypeRepository = getRepository(TestLabType);
    const laboratoriumRepository = getRepository(Laboratorium);
    let patient: Patient;
    let doctor: Doctor;
    let testLabType: TestLabType;
    let laboratorium: Laboratorium;
    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: patientId, status: 1 },
      });
      doctor = await doctorRepository.findOneOrFail({
        where: { id: doctorId, status: 1 },
      });
      testLabType = await testLabTypeRepository.findOneOrFail({
        where: { id: testLabTypeId, status: 1 },
      });
      laboratorium = await laboratoriumRepository.findOneOrFail({
        where: { id: laboratoriumId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Parameter data not found"],
        data: null,
      });
    }

    //Try to find data on database
    const repository = getRepository(TestLab);
    let testLab: TestLab;
    try {
      testLab = await repository.findOneOrFail({
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
    testLab.patient = patient;
    testLab.doctor = doctor;
    testLab.testLabType = testLabType;
    testLab.laboratorium = laboratorium;

    const errors = await validate(testLab);
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
      await repository.save(testLab);
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

    const repository = getRepository(TestLab);
    let testLab: TestLab;
    try {
      testLab = await repository.findOneOrFail({
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
    testLab.status = 0;
    repository.save(testLab);

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}

export default TestLabController;