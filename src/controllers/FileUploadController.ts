import { Request, Response } from "express";

class FileUploadController {
  static upload = async (req: Request, res: Response) => {
    if (req.file) {
      const imagePath = req.file.path.split(process.cwd())[1].replace("\\", "/")
      //Send the users object
      res.status(200).send({ data: imagePath });
    } else {
      res.status(400).send({
        error: false,
        errorList: [],
        data: null,
      });
      return;
    }
  };
}

export default FileUploadController;
