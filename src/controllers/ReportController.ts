import { addHours, addMonths } from "date-fns";
import { Request, Response } from "express";
import { Between, getRepository } from "typeorm";
import { City, Doctor, Patient, Program, TerminateReason } from "../entity";

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

  static programStatusMonthly = async (req: Request, res: Response) => {
    let { start, status } = req.query

    const startDate = start ? new Date(start.toString()) : new Date("2020-01-01")

    let responseObj = []
    let label = ""
    let currentMonthStart = new Date(startDate.toISOString().slice(0, 7) + "-01")
    let endMonthStart = new Date(new Date().toISOString().slice(0, 7) + "-01")

    const repository = getRepository(Program);

    while (currentMonthStart <= endMonthStart) {
      let terminatedCount = await repository.count({
        where: {
          isApproved: true,
          isTerminated: true,
          checkPoint: 6,
          terminatedDate: Between(currentMonthStart, addMonths(currentMonthStart, 1))
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
      let carryOverCount = await repository.count({
        where: {
          isApproved: true,
          isTerminated: false,
          checkPoint: 6,
          carryOverDate: Between(currentMonthStart, addMonths(currentMonthStart, 1))
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
      let enrollCount = await repository.count({
        where: {
          isApproved: true,
          enrollDate: Between(currentMonthStart, addMonths(currentMonthStart, 1))
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

      let month = currentMonthStart.toISOString().slice(5, 7)
      let year = currentMonthStart.toISOString().slice(2, 4)

      switch (month) {
        case '01':
          label = "JAN-" + year
          break;
        case '02':
          label = "FEB-" + year
          break;
        case '03':
          label = "MAR-" + year
          break;
        case '04':
          label = "APR-" + year
          break;
        case '05':
          label = "MEI-" + year
          break;
        case '06':
          label = "JUN-" + year
          break;
        case '07':
          label = "JUL-" + year
          break;
        case '08':
          label = "AGU-" + year
          break;
        case '09':
          label = "SEP-" + year
          break;
        case '10':
          label = "OKT-" + year
          break;
        case '11':
          label = "NOV-" + year
          break;
        case '12':
          label = "DES-" + year
          break;
        default:
          label = "XXX-" + year
          break;
      }

      let resData = {
        label: label,
        enroll: enrollCount,
        carryover: carryOverCount,
        terminate: terminatedCount,
        active: enrollCount + carryOverCount,
      }

      responseObj.push(resData)

      currentMonthStart = addMonths(currentMonthStart, 1)
    }

    //Send the users object
    res.status(200).send(responseObj);
  };

  static patientByCity = async (req: Request, res: Response) => {
    let { date } = req.query

    const reportDate = date ? new Date(date.toString()) : new Date()

    let responseObj = []
    let currentMonthStart = new Date(reportDate.toISOString().slice(0, 7) + "-01")

    const repository = getRepository(Program);

    const cityList = await getRepository(City).find({ where: { status: 1 } });
    let index = 0

    while (index < cityList.length) {
      const patientList = await getRepository(Patient).find({
        where: {
          city: cityList[index].name,
          status: 1
        },
        relations: ['programs']
      });

      let count = 0;

      patientList.forEach(patient => {
        let activePatient = false
        patient.programs.forEach(program => {
          if (program.isApproved && !program.isTerminated && program.carryOverDate >= currentMonthStart && program.carryOverDate < addMonths(currentMonthStart, 1)) {
            activePatient = true
          }
          if (program.isApproved && program.enrollDate >= currentMonthStart && program.enrollDate < addMonths(currentMonthStart, 1)) {
            activePatient = true
          }
        })
        if (activePatient)
          count++;
      });

      let resData = {
        label: cityList[index].name,
        count: count,
      }
      responseObj.push(resData)

      index++
    }

    //Send the users object
    res.status(200).send(responseObj);
  };

  static terminatedByReason = async (req: Request, res: Response) => {
    let { date, status } = req.query

    const reportDate = date ? new Date(date.toString()) : new Date()

    let responseObj = []
    let currentMonthStart = new Date(reportDate.toISOString().slice(0, 7) + "-01")

    const repository = getRepository(Program);

    const terminateReasonList = await getRepository(TerminateReason).find({ where: { status: 1 } });
    let index = 0

    while (index < terminateReasonList.length) {
      let conditions: {}
      if (status == 'all') {
        conditions = {
          isApproved: true,
          isTerminated: true,
          checkPoint: 6,
          terminatedMessage: terminateReasonList[index].name
        }
      } else {
        conditions = {
          isApproved: true,
          isTerminated: true,
          checkPoint: 6,
          terminatedDate: Between(currentMonthStart, addMonths(currentMonthStart, 1)),
          terminatedMessage: terminateReasonList[index].name
        }
      }

      let count = await repository.count({
        where: conditions,
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

      let resData = {
        label: terminateReasonList[index].name,
        count: count,
      }
      responseObj.push(resData)

      index++
    }

    //Send the users object
    res.status(200).send(responseObj);
  };

  static doctorByCity = async (req: Request, res: Response) => {
    let { date } = req.query

    const reportDate = date ? new Date(date.toString()) : new Date()

    let responseObj = []
    let currentMonthStart = new Date(reportDate.toISOString().slice(0, 7) + "-01")

    const cityList = await getRepository(City).find({ where: { status: 1 } });
    let index = 0

    while (index < cityList.length) {
      const count = await getRepository(Doctor).count({
        where: {
          city: cityList[index].name,
          status: 1,
          isApproved: true
        }
      });

      let resData = {
        label: cityList[index].name,
        count: count,
      }
      responseObj.push(resData)

      index++
    }

    //Send the users object
    res.status(200).send(responseObj);
  };
}

export default ProgramController;
