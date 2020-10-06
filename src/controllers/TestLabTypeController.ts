import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { ProgramType, TestLabType } from "../entity";

class TestLabTypeController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(TestLabType);
    const results = await repository.find({ where: { status: 1 } });

    //Send the users object
    res.status(200).send(results,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(TestLabType);
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
    let { name, description, teraphyLine, programTypeId } = req.body;

    const programTypeRepository = getRepository(ProgramType);
    let programType: ProgramType;
    try {
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Program type not found"],
        data: null,
      });
      return;
    }

    let testLabType = new TestLabType();
    testLabType.name = name;
    testLabType.description = description;
    testLabType.teraphyLine = teraphyLine;
    testLabType.programType = programType;
    testLabType.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(testLabType);
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

    const repository = getRepository(TestLabType);
    try {
      await repository.save(testLabType);
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
    res.status(201).send("TestLab type created",
    );
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { name, description, teraphyLine, programTypeId } = req.body;

    const programTypeRepository = getRepository(ProgramType);
    let programType: ProgramType;
    try {
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Program type not found"],
        data: null,
      });
      return;
    }

    //Try to find data on database
    const repository = getRepository(TestLabType);
    let testLabType: TestLabType;
    try {
      testLabType = await repository.findOneOrFail({
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
    testLabType.name = name;
    testLabType.description = description;
    testLabType.teraphyLine = teraphyLine;
    testLabType.programType = programType;

    const errors = await validate(testLabType);
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
      await repository.save(testLabType);
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

    const repository = getRepository(TestLabType);
    let testLabType: TestLabType;
    try {
      testLabType = await repository.findOneOrFail({
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
    testLabType.status = 0;
    repository.save(testLabType);

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}

export default TestLabTypeController;
