import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import  lecturerRoutes from'./Routes/lecturerRoutes.js';
import  timetableRoutes from'./Routes/timetableRoutes.js';

dotenv.config();

const port = 5005;
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
}));

// Routes
app.use('/lecturers', lecturerRoutes);
app.use('/timetables', timetableRoutes);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
