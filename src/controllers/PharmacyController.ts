import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Pharmacy } from "../entity";
import { randomAlphabetOnly } from "../utils/String";

class PharmacyController {
  static listAll = async (req: Request, res: Response) => {
    const { status } = req.query
    let results: Pharmacy[]
    const repository = getRepository(Pharmacy);
    if (status) {
      if (status.toString().toLowerCase() === 'pending') {
        results = await repository.find({ where: { status: 1, isApproved: null }, order: { updatedAt: "DESC" } });
      } else if (status.toString().toLowerCase() === 'approved') {
        results = await repository.find({ where: { status: 1, isApproved: true }, order: { updatedAt: "DESC" } });
      } else if (status.toString().toLowerCase() === 'rejected') {
        results = await repository.find({ where: { status: 1, isApproved: false }, order: { updatedAt: "DESC" } });
      } else if (status.toString().toLowerCase() === 'all') {
        results = await repository.find({ where: [{ status: 1, isApproved: true }, { status: 1, isApproved: false }], order: { updatedAt: "DESC" } });
      }
    } else {
      results = await repository.find({ where: { status: 1 }, order: { createdAt: "ASC" } });
    }
    //Send the users object
    res.status(200).send(results);
    // // Get users from database
    // const repository = getRepository(Pharmacy);
    // const pharmacys = await repository.find({ where: { status: 1 }, order: { createdAt: "ASC" } });

    // //Send the users object
    // res.status(200).send(pharmacys,
    // );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Pharmacy);
    try {
      const pharmacy = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      //Send the users object
      res.status(200).send(pharmacy);
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
    let { name, address, email, city, certificate } = req.body;
    let pharmacy = new Pharmacy();
    pharmacy.name = name;
    pharmacy.address = address;
    pharmacy.city = city;
    pharmacy.certificate = certificate;
    pharmacy.email = email;
    pharmacy.password = randomAlphabetOnly(8);
    pharmacy.status = 1;
    0
    //Validade if the parameters are ok
    const errors = await validate(pharmacy);
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

    pharmacy.hashPassword();

    //Try to save
    const repository = getRepository(Pharmacy);
    try {
      await repository.save(pharmacy);
    } catch (e) {
      errorList.push("failed to save pharmacy");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Pharmacy created" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { name, address, email, password, city, certificate } = req.body;

    //Try to find data on database
    const repository = getRepository(Pharmacy);
    let pharmacy: Pharmacy;
    try {
      pharmacy = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
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
    pharmacy.name = name;
    pharmacy.address = address;
    pharmacy.city = city;
    pharmacy.certificate = certificate;
    pharmacy.email = email;

    const errors = await validate(pharmacy);
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
      await repository.save(pharmacy);
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

    const repository = getRepository(Pharmacy);
    let pharmacy: Pharmacy;
    try {
      pharmacy = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    pharmacy.status = 0;
    repository.save(pharmacy);


    res.status(200).send({ data: "success" });
  };

  static approve = async (req: Request, res: Response) => {
    let { id } = req.body;

    //Get data from database
    const repository = getRepository(Pharmacy);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
      if (result) {
        result.isApproved = true;
        repository.save(result)
        res.status(200).send(result);
      } else {
        res.status(404).send({
          error: false,
          errorList: ["Data farmasi tidak ditemukan"],
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data farmasi tidak ditemukan"],
        data: null,
      });
      return;
    }
  }

  static reject = async (req: Request, res: Response) => {
    let { id, message } = req.body;

    //Get the user from database
    const repository = getRepository(Pharmacy);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 },
      });
      if (result) {
        result.message = message;
        result.isApproved = false;
        repository.save(result)
        //Send the users object
        res.status(200).send(result);
      } else {
        res.status(404).send({
          error: false,
          errorList: ["Data farmasi tidak ditemukan"],
          data: null,
        });
        return;
      }
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data farmasi tidak ditemukan"],
        data: null,
      });
      return;
    }
  }
}

export default PharmacyController;
