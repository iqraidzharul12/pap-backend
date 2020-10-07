import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { ProgramType, TestLab, TestLabEvidence } from "../entity";

class TestLabEvidenceController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(TestLabEvidence);
    const results = await repository.find({ where: { status: 1 } });

    //Send the users object
    res.status(200).send(results,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(TestLabEvidence);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
      //Send the users object
      res.status(200).send(result);
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
    let { url, testLabId } = req.body;

    const testLabRepository = getRepository(TestLab);
    let testLab: TestLab;
    try {
      testLab = await testLabRepository.findOneOrFail({
        where: { id: testLabId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Test Lab not found"],
        data: null,
      });
      return;
    }

    let testLabEvidence = new TestLabEvidence();
    testLabEvidence.url = url;
    testLabEvidence.testLab = testLab;
    testLabEvidence.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(testLabEvidence);
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

    const repository = getRepository(TestLabEvidence);
    try {
      await repository.save(testLabEvidence);
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
    res.status(201).send({ data: "Test Lab Evidence created" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { url, testLabId } = req.body;

    const testLabRepository = getRepository(TestLab);
    let testLab: TestLab;
    try {
      testLab = await testLabRepository.findOneOrFail({
        where: { id: testLabId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Test Lab not found"],
        data: null,
      });
      return;
    }

    //Try to find data on database
    const repository = getRepository(TestLabEvidence);
    let testLabEvidence: TestLabEvidence;
    try {
      testLabEvidence = await repository.findOneOrFail({
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
    testLabEvidence.url = url;
    testLabEvidence.testLab = testLab;

    const errors = await validate(testLabEvidence);
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
      await repository.save(testLabEvidence);
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

    const repository = getRepository(TestLabEvidence);
    let testLabEvidence: TestLabEvidence;
    try {
      testLabEvidence = await repository.findOneOrFail({
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
    testLabEvidence.status = 0;
    repository.save(testLabEvidence);


    res.status(200).send({ data: "success" });
  };
}

export default TestLabEvidenceController;
