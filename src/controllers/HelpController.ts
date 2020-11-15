import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Help } from "../entity";

class HelpController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(Help);
    const helps = await repository.find({ where: { status: 1 }, order: { category: "ASC", subcategory: "ASC", title: "ASC" } });

    let response = []
    let lastElement: Help = new Help()

    helps.forEach(element => {
      if (lastElement.category !== element.category) {
        response.push({
          name: element.category,
          subcategory: [
            {
              name: element.subcategory,
              help: [
                {
                  title: element.title,
                  body: element.body
                }
              ]
            }
          ]
        })
      } else if (lastElement.subcategory !== element.subcategory) {
        response[response.length - 1].subcategory.push({
          name: element.subcategory,
          help: [
            {
              title: element.title,
              body: element.body
            }
          ]
        })
      } else {
        response[response.length - 1].subcategory[response[response.length - 1].subcategory.length - 1].help.push({
          title: element.title,
          body: element.body
        })
      }
      lastElement = element
    });
    //Send the users object
    res.status(200).send(response);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Help);
    try {
      const help = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "DESC"
        }
      });
      //Send the users object
      res.status(200).send(help);
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
    let { title, body, subcategory, category } = req.body;
    let help = new Help();
    help.title = title;
    help.body = body;
    help.subcategory = subcategory;
    help.category = category;
    help.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(help);
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
    const repository = getRepository(Help);
    try {
      await repository.save(help);
    } catch (e) {
      errorList.push("Gagal menyimpan bantuan");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Help created" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;
    //Get the ID from the url
    let { title, body, subcategory, category } = req.body;

    //Try to find data on database
    const repository = getRepository(Help);
    let help: Help;
    try {
      help = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
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
    help.title = title;
    help.body = body;
    help.subcategory = subcategory;
    help.category = category;

    const errors = await validate(help);
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
      await repository.save(help);
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

    const repository = getRepository(Help);
    let help: Help;
    try {
      help = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    help.status = 0;
    repository.save(help);


    res.status(200).send({ data: "success" });
  };
}

export default HelpController;
