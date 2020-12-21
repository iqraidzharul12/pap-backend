import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { TestLabType, Voucher } from "../entity";
import { randomAlphabetOnly } from "../utils/String";

class VoucherController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Voucher);
    const vouchers = await repository.find({ relations: ["testLabType"], order: { createdAt: "ASC" } });

    //Send the users object
    res.status(200).send(vouchers,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Voucher);
    try {
      const voucher = await repository.findOneOrFail({
        where: { id: id }, order: {
          createdAt: "ASC"
        }, relations: ["testLabType"],
      });
      //Send the users object
      res.status(200).send(voucher);
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
    let { code, testLabTypeId } = req.body;
    let voucher = new Voucher();
    voucher.code = code;
    voucher.status = 1;



    if (testLabTypeId) {
      try {
        const testLabTypeRepository = getRepository(TestLabType);
        let testLabType: TestLabType;

        testLabType = await testLabTypeRepository.findOneOrFail({
          where: { id: testLabTypeId, status: 1 }, order: {
            createdAt: "ASC"
          }
        });

        voucher.testLabType = testLabType
      } catch (error) {
        //If tidak ditemukan, send a 404 response
        res.status(404).send({
          error: false,
          errorList: ["Data test laboratorium tidak ditemukan"],
          data: null,
        });
        return;
      }
    }

    //Validade if the parameters are ok
    const errors = await validate(voucher);
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
    const repository = getRepository(Voucher);
    try {
      await repository.save(voucher);
    } catch (e) {
      errorList.push("failed to save voucher");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Voucher created" });
  };

  static createBulk = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { testLabTypeId, count } = req.body;

    const testLabTypeRepository = getRepository(TestLabType);
    const repository = getRepository(Voucher);
    let testLabType: TestLabType;

    if (testLabTypeId) {
      try {
        testLabType = await testLabTypeRepository.findOneOrFail({
          where: { id: testLabTypeId, status: 1 }, order: {
            createdAt: "ASC"
          }
        });
      } catch (error) {
        //If tidak ditemukan, send a 404 response
        res.status(404).send({
          error: false,
          errorList: ["Data test laboratorium tidak ditemukan"],
          data: null,
        });
        return;
      }
    }

    let failSaveCount = 0;

    for (let i = 0; i < count; i++) {
      let voucher = new Voucher();
      voucher.code = randomAlphabetOnly(10);
      voucher.status = 1;
      voucher.testLabType = testLabType

      try {
        const existVoucher = await repository.findOneOrFail({
          where: { code: voucher.code }, order: {
            createdAt: "ASC"
          }
        });
        i--;
      } catch (error) {
        //Try to save
        try {
          await repository.save(voucher);
        } catch (e) {
          failSaveCount++
        }
      }
    }

    if (failSaveCount > 0) {
      res.status(400).send({
        error: true,
        errorList: [`Gagal membuat ${failSaveCount} voucher`],
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Vouchers created" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { code, status, testLabTypeId } = req.body;

    //Try to find data on database
    const repository = getRepository(Voucher);
    let voucher: Voucher;

    try {
      voucher = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
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
    voucher.code = code;
    voucher.status = status;

    if (testLabTypeId) {
      try {
        const testLabTypeRepository = getRepository(TestLabType);
        let testLabType: TestLabType;

        testLabType = await testLabTypeRepository.findOneOrFail({
          where: { id: testLabTypeId, status: 1 }, order: {
            createdAt: "ASC"
          }
        });

        voucher.testLabType = testLabType
      } catch (error) {
        //If tidak ditemukan, send a 404 response
        res.status(404).send({
          error: false,
          errorList: ["Data test laboratorium tidak ditemukan"],
          data: null,
        });
        return;
      }
    }

    const errors = await validate(voucher);
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
      await repository.save(voucher);
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

    const repository = getRepository(Voucher);
    let voucher: Voucher;
    try {
      voucher = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    voucher.status = 0;
    repository.save(voucher);


    res.status(200).send({ data: "success" });
  };
}

export default VoucherController;
