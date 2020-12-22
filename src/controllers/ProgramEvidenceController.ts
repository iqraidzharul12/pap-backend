import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Program, ProgramEvidence } from "../entity";

class ProgramEvidenceController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(ProgramEvidence);
    const results = await repository.find({ where: { status: 1 }, order: { createdAt: "ASC" } });

    //Send the users object
    res.status(200).send(results,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(ProgramEvidence);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
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
    let { url, programId } = req.body;

    const programRepository = getRepository(Program);
    let program: Program;
    try {
      program = await programRepository.findOneOrFail({
        where: { id: programId, status: 1, checkPoint: 3 },
        relations: ['prevProgram']
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Program tidak ditemukan"],
        data: null,
      });
      return;
    }

    const errorList = [];
    const repository = getRepository(ProgramEvidence);

    if (Array.isArray(url)) {
      url.forEach(async (item) => {
        let programEvidence = new ProgramEvidence();
        programEvidence.url = item;
        programEvidence.program = program;
        programEvidence.status = 1;

        try {
          await repository.save(programEvidence);
        } catch (e) {
          errorList.push("Resep gagal di upload: " + item);
        }
      })
      if (errorList.length) {
        res.status(409).send({
          error: true,
          errorList: errorList,
          data: null,
        });
      }
    } else {
      let programEvidence = new ProgramEvidence();
      programEvidence.url = url;
      programEvidence.program = program;
      programEvidence.status = 1;
      try {
        await repository.save(programEvidence);
      } catch (e) {
        console.log("Resep gagal di upload", e);
        errorList.push("Resep gagal di upload");
        res.status(409).send({
          error: true,
          errorList: errorList,
          data: null,
        });
        return;
      }
    }

    try {
      program.checkPoint = 4;
      if (program.prevProgram) {
        program.checkPoint = 5;
        program.isApproved = true
      }
      await programRepository.save(program);
    } catch (e) {
      console.log("Gagal mengupdate status program", e);
      errorList.push("Gagal mengupdate status program");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Resep berhasil diupload" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { url, programId } = req.body;

    const programRepository = getRepository(Program);
    let program: Program;
    try {
      program = await programRepository.findOneOrFail({
        where: { id: programId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Program tidak ditemukan"],
        data: null,
      });
      return;
    }

    //Try to find data on database
    const repository = getRepository(ProgramEvidence);
    let programEvidence: ProgramEvidence;
    try {
      programEvidence = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
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
    programEvidence.url = url;
    programEvidence.program = program;

    const errors = await validate(programEvidence);
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
      await repository.save(programEvidence);
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

    const repository = getRepository(ProgramEvidence);
    let programEvidence: ProgramEvidence;
    try {
      programEvidence = await repository.findOneOrFail({
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
    programEvidence.status = 0;
    repository.save(programEvidence);


    res.status(200).send({ data: "success" });
  };
}

export default ProgramEvidenceController;
