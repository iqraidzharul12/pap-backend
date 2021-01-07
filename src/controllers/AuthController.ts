import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { Patient, Pharmacy, Program, ProgramType, TestLab, Verificator } from "../entity";
import config from "../config/config";
import { sendMail, ChangePasswordEmail, ResetPasswordEmail } from "../utils/mailer";
import { randomString } from "../utils/String";

class AuthController {
  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    let { email, password, role, clientToken } = req.body;

    if (!(email && password)) {
      res.status(400).send({
        error: true,
        errorList: ["email and password must not empty"],
        data: null,
      });
      return;
    }
    if (role && role.toLowerCase() === "patient") {
      //Get user from database
      const userRepository = getRepository(Patient);
      let patient: Patient;
      try {
        patient = await userRepository.findOneOrFail({ where: { email }, relations: ['testLabs', 'programs'] });
      } catch (error) {
        res.status(401).send({
          error: true,
          errorList: ["invalid email"],
          data: null,
        });
        return;
      }

      //Check if encrypted password match
      if (!patient.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send({
          error: true,
          errorList: ["invalid password"],
          data: null,
        });
        return;
      }

      patient.clientToken = clientToken
      try {
        await userRepository.save(patient);
      } catch (error) {
        console.log("failed to save client token");
      }

      //Sign JWT, valid for 1 hour
      const token = jwt.sign(
        { userId: patient.id, email: patient.email, role: 'patient' },
        config.jwtSecret,
        // { expiresIn: "30d" }
      );

      delete patient.password;

      const testLabRepository = getRepository(TestLab);
      const programRepository = getRepository(Program);
      const programTypeRepository = getRepository(ProgramType);

      try {
        let testLabs = await testLabRepository.find({ where: { patient: patient, status: 1 }, relations: ['doctor', 'testLabType', 'laboratorium', 'voucher'] });
        patient.testLabs = testLabs
      } catch (error) {
        console.log("error when getting testLab data")
      }

      try {
        let programs = await programRepository.find({ where: { patient: patient, status: 1 }, relations: ['programType', 'pharmacy', 'doctor'] });
        // programs.forEach(async element => {
        //   let programType = await programTypeRepository.findOne({ where: { id: element.programType.id, status: 1 }, relations: ['defaultSchedules'] });
        //   element.programType = programType
        // });
        console.log(JSON.stringify(programs))
        for (let index = 0; index < programs.length; index++) {
          if (programs[index].programType) {
            let programType = await programTypeRepository.findOne({ where: { id: programs[index].programType.id, status: 1 }, relations: ['defaultSchedules'] });
            programs[index].programType = programType
          }
        }
        patient.programs = programs
      } catch (error) {
        console.log("error when getting program data" + error)
      }
      //Send the jwt in the response
      res.setHeader("Authorization", `Bearer ${token}`);
      res.status(200).send(patient);
    } else if (role && role.toLowerCase() === "verificator") {
      //Get user from database
      const verificatorRepository = getRepository(Verificator);
      let verificator: Verificator;
      try {
        verificator = await verificatorRepository.findOneOrFail({ where: { email } });
      } catch (error) {
        res.status(401).send({
          error: true,
          errorList: ["invalid email"],
          data: null,
        });
        return;
      }

      //Check if encrypted password match
      if (!verificator.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send({
          error: true,
          errorList: ["invalid password"],
          data: null,
        });
        return;
      }

      //Sign JWT, valid for 1 hour
      const token = jwt.sign(
        { userId: verificator.id, email: verificator.email, role: 'verificator' },
        config.jwtSecret,
        { expiresIn: "30d" }
      );

      delete verificator.password;

      //Send the jwt in the response
      res.setHeader("Authorization", `Bearer ${token}`);
      res.status(200).send(verificator);
    } else if (role && role.toLowerCase() === "pharmacy") {
      //Get user from database
      const pharmacyRepository = getRepository(Pharmacy);
      let pharmacy: Pharmacy;
      try {
        pharmacy = await pharmacyRepository.findOneOrFail({ where: { email } });
      } catch (error) {
        res.status(401).send({
          error: true,
          errorList: ["invalid email"],
          data: null,
        });
        return;
      }

      //Check if encrypted password match
      if (!pharmacy.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send({
          error: true,
          errorList: ["invalid password"],
          data: null,
        });
        return;
      }

      //Sign JWT, valid for 1 hour
      const token = jwt.sign(
        { userId: pharmacy.id, email: pharmacy.email, role: 'pharmacy' },
        config.jwtSecret,
        { expiresIn: "30d" }
      );

      delete pharmacy.password;

      //Send the jwt in the response
      res.setHeader("Authorization", `Bearer ${token}`);
      res.status(200).send(pharmacy);
    } else {
      res.status(401).send({
        error: true,
        errorList: ["invalid email or password"],
        data: null,
      });
      return;
    }
  };

  static changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { oldPassword, newPassword, role } = req.body;

    if (!(oldPassword && newPassword)) {
      res.status(400).send({
        error: true,
        errorList: ["password must not empty"],
        data: null,
      });
      return;
    }

    if (role && role.toLowerCase() === "patient") {
      //Get user from the database
      const userRepository = getRepository(Patient);
      let user: Patient;
      try {
        user = await userRepository.findOneOrFail(id);
      } catch (id) {
        res.status(401).send({
          error: true,
          errorList: ["no patient found"],
          data: null,
        });
        return;
      }

      //Check if old password matchs
      if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
        res.status(401).send({
          error: true,
          errorList: ["wrong password"],
          data: null,
        });
        return;
      }

      //Validate de model (password lenght)
      user.password = newPassword;
      const errors = await validate(user);
      const errorList = [];
      if (errors.length > 0) {
        errors.forEach((item) => {
          if (item.constraints.isNotEmpty)
            errorList.push(item.constraints.isNotEmpty);
          if (item.constraints.isEmail)
            errorList.push(item.constraints.isEmail);
          if (item.constraints.length) errorList.push(item.constraints.length);
        });
        res.status(400).send({
          error: true,
          errorList: errorList,
          data: null,
        });
        return;
      }
      //Hash the new password and save
      user.hashPassword();
      userRepository.save(user);

      try {
        await sendMail(user.email, ChangePasswordEmail.subject, ChangePasswordEmail.body)
      } catch (e) {
        console.log(e);
      }

      res.status(202).send({
        error: false,
        errorList: errorList,
        data: "Password changed",
      });
    } else if (role && role.toLowerCase() === "verificator") {
      //Get user from the database
      const userRepository = getRepository(Verificator);
      let user: Verificator;
      try {
        user = await userRepository.findOneOrFail(id);
      } catch (id) {
        res.status(401).send({
          error: true,
          errorList: ["no patient found"],
          data: null,
        });
        return;
      }

      //Check if old password matchs
      if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
        res.status(401).send({
          error: true,
          errorList: ["wrong password"],
          data: null,
        });
        return;
      }

      //Validate de model (password lenght)
      user.password = newPassword;
      const errors = await validate(user);
      const errorList = [];
      if (errors.length > 0) {
        errors.forEach((item) => {
          if (item.constraints.isNotEmpty)
            errorList.push(item.constraints.isNotEmpty);
          if (item.constraints.isEmail)
            errorList.push(item.constraints.isEmail);
          if (item.constraints.length) errorList.push(item.constraints.length);
        });
        res.status(400).send({
          error: true,
          errorList: errorList,
          data: null,
        });
        return;
      }
      //Hash the new password and save
      user.hashPassword();
      userRepository.save(user);

      try {
        await sendMail(user.email, ChangePasswordEmail.subject, ChangePasswordEmail.body)
      } catch (e) {
        console.log(e);
      }

      res.status(202).send({
        error: false,
        errorList: errorList,
        data: "Password changed",
      });
    } else if (role && role.toLowerCase() === "pharmacy") {
      //Get user from the database
      const userRepository = getRepository(Pharmacy);
      let user: Pharmacy;
      try {
        user = await userRepository.findOneOrFail(id);
      } catch (id) {
        res.status(401).send({
          error: true,
          errorList: ["no patient found"],
          data: null,
        });
        return;
      }

      //Check if old password matchs
      if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
        res.status(401).send({
          error: true,
          errorList: ["wrong password"],
          data: null,
        });
        return;
      }

      //Validate de model (password lenght)
      user.password = newPassword;
      const errors = await validate(user);
      const errorList = [];
      if (errors.length > 0) {
        errors.forEach((item) => {
          if (item.constraints.isNotEmpty)
            errorList.push(item.constraints.isNotEmpty);
          if (item.constraints.isEmail)
            errorList.push(item.constraints.isEmail);
          if (item.constraints.length) errorList.push(item.constraints.length);
        });
        res.status(400).send({
          error: true,
          errorList: errorList,
          data: null,
        });
        return;
      }
      //Hash the new password and save
      user.hashPassword();
      userRepository.save(user);

      try {
        await sendMail(user.email, ChangePasswordEmail.subject, ChangePasswordEmail.body)
      } catch (e) {
        console.log(e);
      }

      res.status(202).send({
        error: false,
        errorList: errorList,
        data: "Password changed",
      });
    } else {
      res.status(401).send({
        error: true,
        errorList: ["specify the role"],
        data: null,
      });
      return;
    }
  };

  static resetPassword = async (req: Request, res: Response) => {
    const { email, role } = req.body;

    if (role && role.toLowerCase() === "patient") {
      //Get user from the database
      const userRepository = getRepository(Patient);
      let user: Patient;
      try {
        user = await userRepository.findOneOrFail({ where: { email: email } });
      } catch (id) {
        res.status(401).send({
          error: true,
          errorList: ["pasien tidak ditemukan"],
          data: null,
        });
        return;
      }

      let password = randomString(5)

      try {
        await sendMail(user.email, ResetPasswordEmail(password).subject, ResetPasswordEmail(password).body)
        user.password = password
        user.hashPassword()
        await userRepository.save(user)

        res.status(201).send({ data: "Password berhasil direset, password baru telah dikirim ke email terdaftar" });
      } catch (e) {
        res.status(401).send({
          error: true,
          errorList: ["Gagal mereset password"],
          data: e,
        });
        return;
      }
    } else if (role && role.toLowerCase() === "verificator") {
      //Get user from the database
      const userRepository = getRepository(Verificator);
      let user: Verificator;
      try {
        user = await userRepository.findOneOrFail({ where: { email: email } });
      } catch (id) {
        res.status(401).send({
          error: true,
          errorList: ["farmasi tidak ditemukan"],
          data: null,
        });
        return;
      }

      let password = randomString(5)

      try {
        await sendMail(user.email, ResetPasswordEmail(password).subject, ResetPasswordEmail(password).body)
        user.password = password
        user.hashPassword()
        await userRepository.save(user)

        res.status(201).send({ data: "Password berhasil direset, password baru telah dikirim ke email terdaftar" });
      } catch (e) {
        res.status(401).send({
          error: true,
          errorList: ["Gagal mereset password"],
          data: null,
        });
        return;
      }
    } else if (role && role.toLowerCase() === "pharmacy") {
      //Get user from the database
      const userRepository = getRepository(Pharmacy);
      let user: Pharmacy;
      try {
        user = await userRepository.findOneOrFail({ where: { email: email } });
      } catch (id) {
        res.status(401).send({
          error: true,
          errorList: ["no patient found"],
          data: null,
        });
        return;
      }

      let password = randomString(5)

      try {
        await sendMail(user.email, ResetPasswordEmail(password).subject, ResetPasswordEmail(password).body)
        user.password = password
        user.hashPassword()
        await userRepository.save(user)

        res.status(201).send({ data: "Password berhasil direset, password baru telah dikirim ke email terdaftar" });
      } catch (e) {
        res.status(401).send({
          error: true,
          errorList: ["Gagal mereset password"],
          data: null,
        });
        return;
      }
    }
  }
}
export default AuthController;
