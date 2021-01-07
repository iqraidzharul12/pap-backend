import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Doctor, Laboratorium, Patient, TestLab, TestLabEvidence, TestLabType, Voucher } from "../entity";
import { ConfirmTestEvidenceEmail, ConfirmTestLabEmail, sendMail } from "../utils/mailer";
import { NotificationController } from ".";

class TestLabController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const repository = getRepository(TestLab);
    const results = await repository.find({
      where: { status: 1 }, order: {
        createdAt: "ASC"
      },
      relations: [
        "patient",
        "doctor",
        "testLabType",
        "laboratorium",
        "testLabEvidences",
        "voucher"
      ],
    });

    //Send the users objectz
    res.status(200).send(results,
    );
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get the user from database
    const repository = getRepository(TestLab);
    try {
      const result = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        },
        relations: [
          "patient",
          "doctor",
          "testLabType",
          "laboratorium",
          "testLabEvidences",
          "voucher"
        ],
      });
      //Send the users object
      res.status(200).send(result);
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
    let { patientId, doctorId, testLabTypeId, laboratoriumId, voucherCode } = req.body;

    const patientRepository = getRepository(Patient);
    const doctorRepository = getRepository(Doctor);
    const testLabTypeRepository = getRepository(TestLabType);
    const laboratoriumRepository = getRepository(Laboratorium);
    const voucherRepository = getRepository(Voucher);
    let patient: Patient;
    let doctor: Doctor;
    let testLabType: TestLabType;
    let laboratorium: Laboratorium;
    let voucher: Voucher;
    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: patientId, status: 1 }, order: {
          createdAt: "ASC"
        },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Patient tidak ditemukan"],
        data: null,
      });
      return;
    }

    try {
      doctor = await doctorRepository.findOneOrFail({
        where: { id: doctorId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Doctor tidak ditemukan"],
        data: null,
      });
      return;
    }

    try {
      testLabType = await testLabTypeRepository.findOneOrFail({
        where: { id: testLabTypeId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Test Lab Type data tidak ditemukan"],
        data: null,
      });
      return;
    }

    try {
      laboratorium = await laboratoriumRepository.findOneOrFail({
        where: { id: laboratoriumId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Laboratorium tidak ditemukan"],
        data: null,
      });
      return;
    }

    if (voucherCode) {
      try {
        voucher = await voucherRepository.findOneOrFail({
          where: { code: voucherCode, testLabType: testLabType, status: 1 }, order: {
            createdAt: "ASC"
          }
        });
        voucher.status = 0;
      } catch (error) {
        console.log("Voucher tidak ditemukan");
        res.status(404).send({
          error: false,
          errorList: ["Voucher salah atau sudah digunakan, silakan coba voucher lain"],
          data: null,
        });
        return;
      }
    }

    const repository = getRepository(TestLab);
    let prevTestLab: TestLab
    try {
      prevTestLab = await repository.findOneOrFail({
        where: { patient: patient, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      prevTestLab.status = 0
    } catch (error) {
      prevTestLab = null
    }

    let testLab = new TestLab();
    testLab.patient = patient;
    testLab.doctor = doctor;
    testLab.testLabType = testLabType;
    testLab.laboratorium = laboratorium;
    testLab.voucher = voucher;
    testLab.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(testLab);
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
      await repository.save(testLab);
      if (prevTestLab) await repository.save(prevTestLab)
    } catch (e) {
      errorList.push("failed to save testLab type");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }
    try {
      if (voucher.code) {
        await voucherRepository.save(voucher);
      }
    } catch {
      console.log('voucher gagal diupdate')
    }

    try {
      await sendMail(patient.email, ConfirmTestLabEmail(testLab).subject, ConfirmTestLabEmail(testLab).body)
    } catch (e) {
      console.log(e);
    }

    const notificationMessage = `Pengajuan tes laboratorium diterima.`
    const notification = await NotificationController.create(notificationMessage, testLab.patient)
    if (notification.error) {
      console.log(`failed to save notification for patient: ${testLab.patient}`);
    }

    //If all ok, send 201 response
    res.status(201).send(testLab);
  };

  static createSelfTest = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { patientId, testLabTypeId } = req.body;

    const patientRepository = getRepository(Patient);
    const testLabTypeRepository = getRepository(TestLabType);
    let patient: Patient;
    let testLabType: TestLabType;
    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: patientId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      testLabType = await testLabTypeRepository.findOneOrFail({
        where: { id: testLabTypeId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Parameter data tidak ditemukan"],
        data: null,
      });
      return;
    }

    const repository = getRepository(TestLab);
    let prevTestLab: TestLab
    try {
      prevTestLab = await repository.findOneOrFail({
        where: { patient: patient, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      prevTestLab.status = 0
    } catch (error) {
      prevTestLab = null
    }

    let testLab = new TestLab();
    testLab.patient = patient;
    testLab.testLabType = testLabType;
    testLab.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(testLab);
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
      await repository.save(testLab);
      if (prevTestLab) await repository.save(prevTestLab)
    } catch (e) {
      errorList.push("failed to save testLab type");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }

    //If all ok, send 201 response
    res.status(201).send(testLab);
  };

  static edit = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    let { patientId, doctorId, testLabTypeId, laboratoriumId } = req.body;

    const patientRepository = getRepository(Patient);
    const doctorRepository = getRepository(Doctor);
    const testLabTypeRepository = getRepository(TestLabType);
    const laboratoriumRepository = getRepository(Laboratorium);
    let patient: Patient;
    let doctor: Doctor;
    let testLabType: TestLabType;
    let laboratorium: Laboratorium;
    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: patientId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      doctor = await doctorRepository.findOneOrFail({
        where: { id: doctorId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      testLabType = await testLabTypeRepository.findOneOrFail({
        where: { id: testLabTypeId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
      laboratorium = await laboratoriumRepository.findOneOrFail({
        where: { id: laboratoriumId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Parameter data tidak ditemukan"],
        data: null,
      });
      return;
    }

    //Try to find data on database
    const repository = getRepository(TestLab);
    let testLab: TestLab;
    try {
      testLab = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
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
    testLab.patient = patient;
    testLab.doctor = doctor;
    testLab.testLabType = testLabType;
    testLab.laboratorium = laboratorium;

    const errors = await validate(testLab);
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
      await repository.save(testLab);
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

    const repository = getRepository(TestLab);
    let testLab: TestLab;
    try {
      testLab = await repository.findOneOrFail({
        where: { id: id, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Data tidak ditemukan"],
        data: null,
      });
      return;
    }
    testLab.status = 0;
    repository.save(testLab);


    res.status(200).send({ data: "success" });
  };

  static dashboardCreateEdit = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { testLabId, patientId, testlabDoctorId, testLabTypeId, laboratoriumId, voucherCode, url, urls } = req.body;

    const patientRepository = getRepository(Patient);
    const doctorRepository = getRepository(Doctor);
    const testLabTypeRepository = getRepository(TestLabType);
    const laboratoriumRepository = getRepository(Laboratorium);
    const voucherRepository = getRepository(Voucher);
    let patient: Patient;
    let doctor: Doctor;
    let testLabType: TestLabType;
    let laboratorium: Laboratorium;
    let voucher: Voucher;
    try {
      patient = await patientRepository.findOneOrFail({
        where: { id: patientId, status: 1 }, order: {
          createdAt: "ASC"
        },
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Patient tidak ditemukan"],
        data: null,
      });
      return;
    }

    try {
      doctor = await doctorRepository.findOneOrFail({
        where: { id: testlabDoctorId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Doctor tidak ditemukan"],
        data: null,
      });
      return;
    }

    try {
      testLabType = await testLabTypeRepository.findOneOrFail({
        where: { id: testLabTypeId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Test Lab Type data tidak ditemukan"],
        data: null,
      });
      return;
    }

    try {
      laboratorium = await laboratoriumRepository.findOneOrFail({
        where: { id: laboratoriumId, status: 1 }, order: {
          createdAt: "ASC"
        }
      });
    } catch (error) {
      res.status(404).send({
        error: false,
        errorList: ["Laboratorium tidak ditemukan"],
        data: null,
      });
      return;
    }

    if (voucherCode) {
      try {
        voucher = await voucherRepository.findOneOrFail({
          where: { code: voucherCode, testLabType: testLabType, status: 1 }, order: {
            createdAt: "ASC"
          }
        });
        voucher.status = 0;
      } catch (error) {
        console.log("Voucher tidak ditemukan");
        res.status(404).send({
          error: false,
          errorList: ["Voucher salah atau sudah digunakan, silakan coba voucher lain"],
          data: null,
        });
        return;
      }
    }

    const repository = getRepository(TestLab);
    let prevTestLab: TestLab
    let testLab: TestLab

    if (testLabId) {
      try {
        testLab = await repository.findOneOrFail({
          where: { id: testLabId, status: 1 }, order: {
            createdAt: "ASC"
          }
        });
      } catch (error) {
        console.log("new test lab " + error)
      }
    } else {
      try {
        prevTestLab = await repository.findOneOrFail({
          where: { patient: patient, status: 1 }, order: {
            createdAt: "ASC"
          }
        });
        prevTestLab.status = 0
      } catch (error) {
        prevTestLab = null
      }
      testLab = new TestLab();
    }

    testLab.patient = patient;
    testLab.doctor = doctor;
    testLab.testLabType = testLabType;
    testLab.laboratorium = laboratorium;
    testLab.voucher = voucher;
    testLab.status = 1;

    //Validade if the parameters are ok
    const errors = await validate(testLab);
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
      await repository.save(testLab);
      if (prevTestLab) await repository.save(prevTestLab)
    } catch (e) {
      errorList.push("failed to save testLab type");
      res.status(409).send({
        error: true,
        errorList: errorList,
        data: null,
      });
      return;
    }
    try {
      if (voucher.code) {
        await voucherRepository.save(voucher);
      }
    } catch {
      console.log('voucher gagal diupdate')
    }

    try {
      await sendMail(patient.email, ConfirmTestLabEmail(testLab).subject, ConfirmTestLabEmail(testLab).body)
    } catch (e) {
      console.log(e);
    }

    let notificationMessage = `Pengajuan tes laboratorium diterima.`
    let notification = await NotificationController.create(notificationMessage, testLab.patient)
    if (notification.error) {
      console.log(`failed to save notification for patient: ${testLab.patient}`);
    }

    const testLabEvidenceRepository = getRepository(TestLabEvidence);

    if (urls) {
      urls.forEach(async (item) => {
        let testLabEvidence = new TestLabEvidence();
        testLabEvidence.url = item;
        testLabEvidence.testLab = testLab;
        testLabEvidence.status = 1;

        try {
          await testLabEvidenceRepository.save(testLabEvidence);
        } catch (e) {
          errorList.push("failed to save testLab evidence " + item);
        }
      })
      if (errorList.length) {
        res.status(409).send({
          error: true,
          errorList: errorList,
          data: null,
        });
      }
    } else {
      let testLabEvidence = new TestLabEvidence();
      testLabEvidence.url = url;
      testLabEvidence.testLab = testLab;
      testLabEvidence.status = 1;

      try {
        await testLabEvidenceRepository.save(testLabEvidence);
      } catch (e) {
        errorList.push("failed to save testLab evidence");
        res.status(409).send({
          error: true,
          errorList: errorList,
          data: null,
        });
        return;
      }
    }

    try {
      await sendMail(testLab.patient.email, ConfirmTestEvidenceEmail.subject, ConfirmTestEvidenceEmail.body)
    } catch (e) {
      console.log(e);
    }

    notificationMessage = `Hasil tes laboratorium berhasil diunggah.`
    notification = await NotificationController.create(notificationMessage, testLab.patient)
    if (notification.error) {
      console.log(`failed to save notification for patient: ${testLab.patient}`);
    }

    //If all ok, send 201 response
    res.status(201).send({ data: "Berhasil menyimpan data tes laboratorium" });

    // //If all ok, send 201 response
    // res.status(201).send(testLab);
  };
}

export default TestLabController;
