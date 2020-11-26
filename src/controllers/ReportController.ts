import { Request, Response } from "express";
import { Between, getRepository } from "typeorm";
import { Program } from "../entity";

class ProgramController {
  static programMonthly = async (req: Request, res: Response) => {
    let { start, status } = req.query

    const startDate = start ? new Date(start.toString()) : new Date("1000-10-10")

    let responseObj = []
    let currentMonthYear = ""
    let count = 0

    if (status && status.toString().toLowerCase() === 'terminated') {
      //Get users from database
      const repository = getRepository(Program);
      const results = await repository.find({
        where: {
          isApproved: true,
          isTerminated: true,
          checkPoint: 6,
          terminatedDate: Between(startDate, new Date())
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
          terminatedDate: "DESC"
        }
      });

      for (let index = 0; index < results.length; index++) {
        const monthYear = results[index].terminatedDate.toISOString().slice(0, 7);
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
    } else if (status && status.toString().toLowerCase() === 'carryover') {
      //Get users from database
      const repository = getRepository(Program);
      const results = await repository.find({
        where: {
          isApproved: true,
          isTerminated: false,
          checkPoint: 6,
          carryOverDate: Between(startDate, new Date())
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
          carryOverDate: "DESC"
        }
      });

      for (let index = 0; index < results.length; index++) {
        const monthYear = results[index].carryOverDate.toISOString().slice(0, 7);
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
    } else {
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
    }

    //Send the users object
    res.status(200).send(responseObj);
  };

  static programMonthlyMobile = async (req: Request, res: Response) => {
    let { start, status } = req.query

    const startDate = start ? new Date(start.toString()) : new Date("1000-10-10")

    let responseObj = []
    let currentMonthYear = ""
    let count = 0

    if (status && status.toString().toLowerCase() === 'terminated') {
      //Get users from database
      const repository = getRepository(Program);
      const results = await repository.find({
        where: {
          isApproved: true,
          isTerminated: true,
          checkPoint: 6,
          terminatedDate: Between(startDate, new Date())
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
          terminatedDate: "DESC"
        }
      });

      for (let index = 0; index < results.length; index++) {
        const monthYear = results[index].terminatedDate.toISOString().slice(0, 7);
        if (currentMonthYear !== monthYear) {
          if (currentMonthYear) {
            let obj = {
              month: currentMonthYear,
              count: count
            }
            // obj[currentMonthYear] = count
            responseObj.push(obj)
            count = 0
          }
        }
        count++
        currentMonthYear = monthYear
      }
      let obj = {
        month: currentMonthYear,
        count: count
      }
      // obj[currentMonthYear] = count
      responseObj.push(obj)
    } else if (status && status.toString().toLowerCase() === 'carryover') {
      //Get users from database
      const repository = getRepository(Program);
      const results = await repository.find({
        where: {
          isApproved: true,
          isTerminated: false,
          checkPoint: 6,
          carryOverDate: Between(startDate, new Date())
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
          carryOverDate: "DESC"
        }
      });

      for (let index = 0; index < results.length; index++) {
        const monthYear = results[index].carryOverDate.toISOString().slice(0, 7);
        if (currentMonthYear !== monthYear) {
          if (currentMonthYear) {
            let obj = {
              month: currentMonthYear,
              count: count
            }
            // obj[currentMonthYear] = count
            responseObj.push(obj)
            count = 0
          }
        }
        count++
        currentMonthYear = monthYear
      }
      let obj = {
        month: currentMonthYear,
        count: count
      }
      // obj[currentMonthYear] = count
      responseObj.push(obj)
    } else {
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

      for (let index = 0; index < results.length; index++) {
        const monthYear = results[index].enrollDate.toISOString().slice(0, 7);
        if (currentMonthYear !== monthYear) {
          if (currentMonthYear) {
            let obj = {
              month: currentMonthYear,
              count: count
            }
            // obj[currentMonthYear] = count
            responseObj.push(obj)
            count = 0
          }
        }
        count++
        currentMonthYear = monthYear
      }
      let obj = {
        month: currentMonthYear,
        count: count
      }
      // obj[currentMonthYear] = count
      responseObj.push(obj)
    }

    //Send the users object
    res.status(200).send(responseObj);
  };
}

export default ProgramController;
