import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { News } from "../entity";

class NewsController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(News);
    const newss = await repository.find({ where: { status: 1 }, order: { createdAt: "DESC" } });

    //Send the users object
    res.status(200).send(newss);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(News);
    try {
      const news = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "DESC"
        }
      });
      //Send the users object
      res.status(200).send(news);
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
    let { title, body, image, tag, writer } = req.body;
    let news = new News();
    news.title = title;
    news.body = body;
    news.image = image;
    news.writer = writer;
    news.tag = tag;
    news.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(news);
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
    const repository = getRepository(News);
    try {
      await repository.save(news);
    } catch (e) {
      errorList.push("Failed to save news");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "News created" });
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;
    //Get the ID from the url
    let { title, body, image, tag, writer } = req.body;

    //Try to find data on database
    const repository = getRepository(News);
    let news: News;
    try {
      news = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
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
    news.title = title;
    news.body = body;
    news.image = image;
    news.writer = writer;
    news.tag = tag;

    const errors = await validate(news);
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
      await repository.save(news);
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

    const repository = getRepository(News);
    let news: News;
    try {
      news = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    news.status = 0;
    repository.save(news);


    res.status(200).send({ data: "success" });
  };
}

export default NewsController;
