import { Between, getRepository, LessThan } from 'typeorm';
import { Program } from '../entity'
import { sendPushNotification } from './notification';

export const sendReminder = async () => {
  const programRepository = getRepository(Program);
  const days20 = new Date(new Date().setDate(new Date().getDate() - 20))
  const days30 = new Date(new Date().setDate(new Date().getDate() - 30))

  const programs = await programRepository.find({
    where: {
      status: 1,
      checkPoint: 5,
      isApproved: true,
      drugsTakenDate: Between(days20, days30)
    },
    order: { createdAt: "ASC" },
    relations: ['patient']
  });

  programs.forEach(element => {
    sendPushNotification(element.patient.clientToken, "Program PAP akan berakhir", "Program PAP Anda akan berakhir dalam beberapa hari.")
  });

  const programsDone = await programRepository.find({
    where: {
      status: 1,
      checkPoint: 5,
      isApproved: true,
      drugsTakenDate: LessThan(days30)
    },
    order: { createdAt: "ASC" },
    relations: ['patient']
  });

  programsDone.forEach(element => {
    sendPushNotification(element.patient.clientToken, "Program PAP telah berakhir", "Program PAP telah berakhir, Anda dapat meilih untuk melanjutkan program atau berhenti dari program melalui aplikasi.")
  });
}