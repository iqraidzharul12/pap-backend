import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Doctor, Laboratorium, News, Pharmacy, Program } from "../entity";

class DashboardController {
  static dashboardCard = async (req: Request, res: Response) => {
    const programRepository = getRepository(Program);
    const doctorRepository = getRepository(Doctor);
    const pharmacyRepository = getRepository(Pharmacy);
    const laboratoriumRepository = getRepository(Laboratorium);
    const newsRepository = getRepository(News);
    const totalPatient = await programRepository.count({
      where: { isApproved: true },
    });
    const totalDoctor = await doctorRepository.count({
      where: { isApproved: true },
    });
    const totalPharmacy = await pharmacyRepository.count({
      where: { isApproved: true },
    });
    const totalLaboratorium = await laboratoriumRepository.count({
      where: { status: 1 },
    });
    const totalNews = await newsRepository.count({
      where: { status: 1 },
    });

    const resObj = {
      totalPatient,
      totalDoctor,
      totalPharmacy,
      totalLaboratorium,
      totalNews,
    }

    res.status(200).send(resObj);
  };
}

export default DashboardController;
