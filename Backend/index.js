import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import  lecturerRoutes from'./Routes/lecturerRoutes.js';
import  timetableRoutes from'./Routes/timetableRoutes.js';

dotenv.config();

const port = 5005;
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/lecturers', lecturerRoutes);
app.use('/timetables', timetableRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
