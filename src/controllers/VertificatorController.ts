import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Verificator } from "../entity";
import { randomAlphabetOnly } from "../utils/String";

class VerificatorController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Verificator);
    const verificators = await repository.find({ where: { status: 1 }, order: { createdAt: "ASC" } });

    //Send the users object
    res.status(200).send(verificators,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Verificator);
    try {
      const verificator = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      //Send the users object
      res.status(200).send(verificator);
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
    let { fullname, dateOfBirth, email, password } = req.body;
    let verificator = new Verificator();
    verificator.fullname = fullname;
    verificator.dateOfBirth = dateOfBirth;
    verificator.email = email;
    verificator.password = randomAlphabetOnly(8);
    verificator.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(verificator);
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

    verificator.hashPassword()

    //Try to save
    const repository = getRepository(Verificator);
    try {
      await repository.save(verificator);
    } catch (e) {
      errorList.push("gagal menyimpan data verifikator");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: e,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Verificator created" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { fullname, dateOfBirth, email } = req.body;

    //Try to find data on database
    const repository = getRepository(Verificator);
    let verificator: Verificator;
    try {
      verificator = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
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
    verificator.fullname = fullname;
    verificator.dateOfBirth = dateOfBirth;
    verificator.email = email;
    verificator.status = 1;

    const errors = await validate(verificator);
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
      await repository.save(verificator);
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

    const repository = getRepository(Verificator);
    let verificator: Verificator;
    try {
      verificator = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    verificator.status = 0;
    verificator.email = null;
    repository.save(verificator);


    res.status(200).send({ data: "success" });
  };
}

export default VerificatorController;
