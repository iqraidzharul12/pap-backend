import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Laboratorium } from "../entity";

class LaboratoriumController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Laboratorium);
    const laboratoriums = await repository.find({ where: { status: 1 } });

    //Send the users object
    res.status(200).send(laboratoriums,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Laboratorium);
    try {
      const laboratorium = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
      //Send the users object
      res.status(200).send(laboratorium);
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
    let { name, address } = req.body;
    let laboratorium = new Laboratorium();
    laboratorium.name = name;
    laboratorium.address = address;
    laboratorium.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(laboratorium);
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

    //Try to save
    const repository = getRepository(Laboratorium);
    try {
      await repository.save(laboratorium);
    } catch (e) {
      errorList.push("failed to save laboratorium");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send("Laboratorium created",
    );
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { name, address } = req.body;

    //Try to find data on database
    const repository = getRepository(Laboratorium);
    let lab: Laboratorium;
    try {
      lab = await repository.findOneOrFail({ where: { id: id, status: 1 } });
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
    lab.name = name;
    lab.address = address;

    const errors = await validate(lab);
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
      await repository.save(lab);
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

    const repository = getRepository(Laboratorium);
    let lab: Laboratorium;
    try {
      lab = await repository.findOneOrFail({ where: { id: id, status: 1 } });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data not found"],
        data: null,
      });
      return;
    }
    lab.status = 0;
    repository.save(lab);

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}

export default LaboratoriumController;
