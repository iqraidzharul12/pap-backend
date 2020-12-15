import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { City } from "../entity";

class NewsController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(City);
    const datas = await repository.find({ where: { status: 1 }, order: { name: "ASC" } });

    //Send the users object
    res.status(200).send(datas);
  };
}

export default NewsController;
