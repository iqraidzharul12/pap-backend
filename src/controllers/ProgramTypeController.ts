import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { ProgramType } from "../entity";

class ProgramTypeController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(ProgramType);
    const results = await repository.find({ order: { createdAt: "ASC" } });

    //Send the users object
    res.status(200).send(results,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(ProgramType);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id }, order: {
          createdAt: "ASC"
        }
      });
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
    let { name, description, image, status } = req.body;
    let programType = new ProgramType();
    programType.name = name;
    programType.description = description;
    programType.image = image;
    programType.status = status ? status : 1;

    //Validade if the parameters are ok
    const errors = await validate(programType);
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

    const repository = getRepository(ProgramType);
    try {
      await repository.save(programType);
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
    res.status(201).send({ data: "Program Type created" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { name, description, image, status } = req.body;

    //Try to find data on database
    const repository = getRepository(ProgramType);
    let programType: ProgramType;
    try {
      programType = await repository.findOneOrFail({
        where: { id: id }, order: {
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
    programType.name = name;
    programType.description = description;
    programType.image = image;
    programType.status = status;

    const errors = await validate(programType);
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
      await repository.save(programType);
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

    const repository = getRepository(ProgramType);
    let programType: ProgramType;
    try {
      programType = await repository.findOneOrFail({
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
    programType.status = 0;
    repository.save(programType);


    res.status(200).send({ data: "success" });
  };
}

export default ProgramTypeController;
