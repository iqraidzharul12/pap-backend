import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";
import * as rateLimit from 'express-rate-limit';
import * as cron from 'node-cron';
import { sendReminder } from "./utils/cron";

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Silakan coba kembali dalam beberapa menit"
});

//Connects to the Database -> then starts the express
createConnection()
  .then(async (connection) => {
    // Create a new express application instance
    const app = express();

    //cron
    const task = cron.schedule('59 23 * * *', function () {
      sendReminder()
    })

    task.start()

    // Call midlewares
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(limiter);

    //Set all routes from routes folder
    app.use("/", routes);
    app.use("/uploads", express.static("uploads"));

    app.get("/", function (req, res) {
      const x = !!true;
      res.send(x);
    });

    app.listen(process.env.PORT || 3001, () => {
      console.log("Server started on port 3001!");
    });
  })
  .catch((error) => console.log(error));
