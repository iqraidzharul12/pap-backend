import { Request, Response } from "express";
import { Between, getRepository } from "typeorm";
import { Program } from "../entity";

class ProgramController {
  static programMonthly = async (req: Request, res: Response) => {
    let { start, status } = req.query

    const startDate = start ? new Date(start.toString()) : new Date("1000-10-10")

    //Get users from database
    const repository = getRepository(Program);
    const results = await repository.find({
      where: {
        isApproved: true,
        enrollDate: Between(startDate, new Date())
      },
      relations: [
        "patient",
        "doctor",
        "programType",
        "pharmacy",
        "programEvidences",
        "testLab",
      ],
      order: {
        enrollDate: "DESC"
      }
    });

    let responseObj = []
    let currentMonthYear = ""
    let count = 0

    for (let index = 0; index < results.length; index++) {
      const monthYear = results[index].enrollDate.toISOString().slice(0, 7);
      if (currentMonthYear !== monthYear) {
        if (currentMonthYear) {
          let obj = {}
          obj[currentMonthYear] = count
          responseObj.push(obj)
          count = 0
        }
      }
      count++
      currentMonthYear = monthYear
    }
    let obj = {}
    obj[currentMonthYear] = count
    responseObj.push(obj)

    //Send the users objectz
    res.status(200).send(responseObj);
  };
}

export default ProgramController;
