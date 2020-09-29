import { Request, Response } from "express";

class FileUploadController {
  static upload = async (req: Request, res: Response) => {
    if (req.file) {
      const imagePath = req.file.path;
      //Send the users object
      res.status(200).send({
        error: false,
        errorList: [],
        data: imagePath,
      });
    } else {
      return res.status(400).send({
        error: false,
        errorList: [],
        data: null,
      });
    }
  };
}

export default FileUploadController;
