import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import  lecturerRoutes from'./Routes/lecturerRoutes.js';
import  timetableRoutes from'./Routes/timetableRoutes.js';
import  classTypeRouter from'./Routes/classTypeRoutes.js';
import  newsRouter from'./Routes/newsRouter.js';

dotenv.config();

const port = 5005;
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/lecturers', lecturerRoutes);
app.use('/timetables', timetableRoutes);
app.use('/classType', classTypeRouter);
app.use('/news', newsRouter);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
