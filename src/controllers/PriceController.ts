import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { ProgramType, Price } from "../entity";

class PriceController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Price);
    const results = await repository.find({ where: { status: 1 } });

    //Send the users object
    res.status(200).send(results,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Price);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 },
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
    let { count, price, programTypeId } = req.body;

    const programTypeRepository = getRepository(ProgramType);
    let programType: ProgramType;
    try {
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["ProgramType tidak ditemukan"],
        data: null,
      });
      return;
    }

    let priceData = new Price();
    priceData.count = count;
    priceData.price = price;
    priceData.programType = programType;
    priceData.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(priceData);
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

    const repository = getRepository(Price);
    try {
      await repository.save(priceData);
    } catch (e) {
      errorList.push("failed to save");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Price created" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { count, price, programTypeId } = req.body;

    const programTypeRepository = getRepository(ProgramType);
    let programType: ProgramType;
    try {
      programType = await programTypeRepository.findOneOrFail({
        where: { id: programTypeId, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["ProgramType tidak ditemukan"],
        data: null,
      });
      return;
    }

    //Try to find data on database
    const repository = getRepository(Price);
    let priceData: Price;
    try {
      price = await repository.findOneOrFail({
        where: { id: id, status: 1 },
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
    priceData.count = count;
    priceData.price = price;
    price.programType = programType;

    const errors = await validate(priceData);
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
      await repository.save(priceData);
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

    const repository = getRepository(Price);
    let price: Price;
    try {
      price = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    price.status = 0;
    repository.save(price);


    res.status(200).send({ data: "success" });
  };
}

export default PriceController;
