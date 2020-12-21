import * as multer from "multer";
import * as fs from "fs-extra";
import { NextFunction, Request, Response } from "express";

const storageIdPicture = multer.diskStorage({
  destination: (request, file, callback) => {
    let path = `${process.cwd()}/uploads/`;
    fs.mkdirpSync(`${path}/id`);
    callback(null, `${path}/id`);
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
    fs.mkdirpSync(`${path}/selfie`);
    callback(null, `${path}/selfie`);
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

const storageConsent = multer.diskStorage({
  destination: (request, file, callback) => {
    let path = `${process.cwd()}/uploads/`;
    fs.mkdirpSync(`${path}/consent`);
    callback(null, `${path}/consent`);
  },
  filename: (request, file, callback) => {
    callback(
      null,
      "CONSENT-" +
      new Date().valueOf() +
      "." +
      file.originalname.split(".").pop()
    );
  },
});

const storageNews = multer.diskStorage({
  destination: (request, file, callback) => {
    let path = `${process.cwd()}/uploads/`;
    fs.mkdirpSync(`${path}/news`);
    callback(null, `${path}/news`);
  },
  filename: (request, file, callback) => {
    callback(
      null,
      "NEWS-" + new Date().valueOf() + "." + file.originalname.split(".").pop()
    );
  },
});

const storageCertificate = multer.diskStorage({
  destination: (request, file, callback) => {
    let path = `${process.cwd()}/uploads/`;
    fs.mkdirpSync(`${path}/certificate`);
    callback(null, `${path}/certificate`);
  },
  filename: (request, file, callback) => {
    callback(
      null,
      "CERT-" + new Date().valueOf() + "." + file.originalname.split(".").pop()
    );
  },
});

const storageDrugs = multer.diskStorage({
  destination: (request, file, callback) => {
    let path = `${process.cwd()}/uploads/`;
    fs.mkdirpSync(`${path}/certificate`);
    callback(null, `${path}/certificate`);
  },
  filename: (request, file, callback) => {
    callback(
      null,
      "DRUG-" + new Date().valueOf() + "." + file.originalname.split(".").pop()
    );
  },
});

const storagePrescription = (id: string) => {
  return multer.diskStorage({
    destination: (request, file, callback) => {
      let path = `${process.cwd()}/uploads/`;
      fs.mkdirpSync(`${path}/patient/${id}/prescription`);
      callback(null, `${path}/patient/${id}/prescription`);
    },
    filename: (request, file, callback) => {
      callback(
        null,
        "PRESCRIPTION-" +
        new Date().valueOf() +
        "." +
        file.originalname.split(".").pop()
      );
    },
  });
}

const storageLabResult = (id: string) => {
  return multer.diskStorage({
    destination: (request, file, callback) => {
      let path = `${process.cwd()}/uploads/`;
      fs.mkdirpSync(`${path}/patient/${id}/lab-result`);
      callback(null, `${path}/patient/${id}/lab-result`);
    },
    filename: (request, file, callback) => {
      callback(
        null,
        "LAB-RESULT-" +
        new Date().valueOf() +
        "." +
        file.originalname.split(".").pop()
      );
    },
  });
}

const fileFilter = (request: any, file: any, callback: any) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/*") {
    callback(null, true);
  } else {
    return callback(new Error("Extension File Must Be JPG or PNG, current format: " + file.mimetype), false);
  }
};

const pdfFileFilter = (request: any, file: any, callback: any) => {
  callback(null, true);
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

let uploadConsent = multer({
  storage: storageConsent,
  fileFilter: pdfFileFilter,
  limits,
}).single("upload");

let uploadNews = multer({
  storage: storageNews,
  fileFilter: fileFilter,
  limits,
}).single("upload");

let uploadCertificate = multer({
  storage: storageCertificate,
  fileFilter: fileFilter,
  limits,
}).single("upload");

let uploadDrugs = multer({
  storage: storageDrugs,
  fileFilter: fileFilter,
  limits,
}).single("upload");


let uploadPrescriptionPicture = (id: string) => {
  return multer({
    storage: storagePrescription(id),
    fileFilter: fileFilter,
    limits,
  }).single("upload");
}

let uploadLabResultPicture = (id: string) => {
  return multer({
    storage: storageLabResult(id),
    fileFilter: fileFilter,
    limits,
  }).single("upload");
}

const uploadId = (req: Request, res: Response, next: NextFunction) => {
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
};

const uploadSelfie = (req: Request, res: Response, next: NextFunction) => {
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
};

const uploadPrescription = (req: Request, res: Response, next: NextFunction) => {
  let { userId } = res.locals.jwtPayload
  uploadPrescriptionPicture(userId)(req, res, function (error: any) {
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
};

const uploadLabResult = (req: Request, res: Response, next: NextFunction) => {
  let { userId } = res.locals.jwtPayload
  uploadLabResultPicture(userId)(req, res, function (error: any) {
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
};

export {
  uploadId,
  uploadSelfie,
  uploadPrescription,
  uploadLabResult,
  uploadConsent,
  uploadNews,
  uploadCertificate,
  uploadDrugs,
}
