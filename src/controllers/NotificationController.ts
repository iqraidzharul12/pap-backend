import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Notification, Patient } from "../entity";

class NotificationController {
  static listAll = async (req: Request, res: Response) => {
    const id = req.params.id;

    const repository = getRepository(Notification);
    const patientRepository = getRepository(Patient);
    let notifications: Notification[]
    let patient: Patient

    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: id, status: 1 }
      });
    } catch {
      res.status(404).send({
        error: false,
        errorList: ["Data pasien tidak ditemukan"],
        data: null,
      });
      return;
    }

    try {
      notifications = await repository.find({ where: { status: 1, patient: patient }, order: { createdAt: "DESC" } });
    } catch {
      res.status(404).send({
        error: false,
        errorList: ["Data notifikasi tidak ditemukan"],
        data: null,
      });
      return;
    }
    //Send the users object
    res.status(200).send(notifications);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(Notification);
    try {
      const notification = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "DESC"
        }
      });
      //Send the users object
      res.status(200).send(notification);
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
  };

  static delete = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    const repository = getRepository(Notification);
    let notification: Notification;
    try {
      notification = await repository.findOneOrFail({ where: { id: id, status: 1 }, order: { createdAt: "ASC" } });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    notification.status = 0;
    repository.save(notification);


    res.status(200).send({ data: "success" });
  };

  static create = async (message: String, patient: Patient) => {
    let notification = new Notification();
    notification.message = message;
    notification.patient = patient;
    notification.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(notification);
    const errorList = [];
    if (errors.length > 0) {
      errors.forEach((item) => {
        if (item.constraints.isNotEmpty)
          errorList.push(item.constraints.isNotEmpty);
        if (item.constraints.isEmail) errorList.push(item.constraints.isEmail);
        if (item.constraints.length) errorList.push(item.constraints.length);
      });

      return {
        error: true,
        errorList: errorList,
      }
    }

    //Try to save
    const repository = getRepository(Notification);
    try {
      await repository.save(notification);
    } catch (e) {
      errorList.push("Failed to save notification");
      return {
        error: true,
        errorList: errorList,
      }
    }
    return {
      error: false,
      errorList: [],
    }
  };
}

export default NotificationController;
