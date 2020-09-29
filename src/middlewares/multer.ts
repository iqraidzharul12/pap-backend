import * as multer from "multer";
import * as fs from "fs-extra";
import { NextFunction, Request, Response } from "express";

const storageIdPicture = multer.diskStorage({
  destination: (request, file, callback) => {
    let path = `${process.cwd()}/uploads/`;
    fs.mkdirpSync(`${path}/idPicture`);
    callback(null, `${path}/idPicture`);
  },
  filename: (request, file, callback) => {
    callback(
      null,
      "ID-" + new Date().valueOf() + "." + file.originalname.split(".").pop()
    );
  },
});

const storageSelfiePicture = multer.diskStorage({
  destination: (request, file, callback) => {
    let path = `${process.cwd()}/uploads/`;
    fs.mkdirpSync(`${path}/selfiePicture`);
    callback(null, `${path}/selfiePicture`);
  },
  filename: (request, file, callback) => {
    callback(
      null,
      "SELFIE-" +
        new Date().valueOf() +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const fileFilter = (request: any, file: any, callback: any) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    return callback(new Error("Extension File Must Be JPG or PNG"), false);
  }
};

const limits = { fileSize: 1024 * 1024 * 5 };

let uploadIdPicture = multer({
  storage: storageIdPicture,
  fileFilter: fileFilter,
  limits,
}).single("upload");

let uploadSelfiePicture = multer({
  storage: storageSelfiePicture,
  fileFilter: fileFilter,
  limits,
}).single("upload");

const uploadFilter = (req: Request, res: Response, next: NextFunction) => {
  let { type } = req.query;

  if (type === "id") {
    uploadIdPicture(req, res, function (error: any) {
      if (error instanceof multer.MulterError) {
        res.status(400).send({
          error: false,
          errorList: [`Multer error: ${error}`],
          data: null,
        });
        return;
      } else if (error) {
        res.status(400).send({
          error: false,
          errorList: [`Unexpected error: ${error}`],
          data: null,
        });
        return;
      }
      next();
    });
  } else if (type === "selfie") {
    uploadSelfiePicture(req, res, function (error: any) {
      if (error instanceof multer.MulterError) {
        res.status(400).send({
          error: false,
          errorList: [`Multer error: ${error}`],
          data: null,
        });
        return;
      } else if (error) {
        res.status(400).send({
          error: false,
          errorList: [`Unexpected error: ${error}`],
          data: null,
        });
        return;
      }
      next();
    });
  } else {
    res.status(400).send({
      error: false,
      errorList: ["no type provided"],
      data: null,
    });
    return;
  }
};

export default uploadFilter;
