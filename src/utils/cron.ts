import { subDays } from 'date-fns';
import { Between, getRepository, LessThan } from 'typeorm';
import { Program } from '../entity'
import { sendPushNotification } from './notification';

export const sendReminder = async () => {
  const programRepository = getRepository(Program);

  const lastMonth = new Date(new Date().setDate(new Date().getDate() - 30))

  const BetweenDates = (date: Date) => Between(subDays(date, 30), subDays(date, 20));

  const programs = await programRepository.find({
    where: {
      status: 1,
      checkPoint: 5,
      isApproved: true,
      drugsTakenDate: BetweenDates(new Date())
    },
    order: { createdAt: "ASC" },
    relations: ['patient']
  });

  programs.forEach(element => {
    sendPushNotification(element.patient.clientToken, "program PULIH akan berakhir", "program PULIH Anda akan berakhir dalam beberapa hari.")
  });

  const programsDone = await programRepository.find({
    where: {
      status: 1,
      checkPoint: 5,
      isApproved: true,
      drugsTakenDate: LessThan(lastMonth)
    },
    order: { createdAt: "ASC" },
    relations: ['patient']
  });

  programsDone.forEach(element => {
    sendPushNotification(element.patient.clientToken, "program PULIH telah berakhir", "program PULIH telah berakhir, Anda dapat meilih untuk melanjutkan program atau berhenti dari program melalui aplikasi.")
  });
}