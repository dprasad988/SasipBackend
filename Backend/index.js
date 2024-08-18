import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import multer from 'multer';

import  lecturerRoutes from'./Routes/lecturerRoutes.js';
import  timetableRoutes from'./Routes/timetableRoutes.js';

dotenv.config();

const port = 5005;
const app = express();
app.use(cors());
app.use(bodyParser.json());
const upload = multer();

app.use('/lecturers', lecturerRoutes);
app.use('/timetables', timetableRoutes);



app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});