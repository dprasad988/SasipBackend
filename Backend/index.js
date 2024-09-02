import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import  lecturerRoutes from'./Routes/lecturerRoutes.js';
import  timetableRoutes from'./Routes/timetableRoutes.js';
import  classTypeRouter from'./Routes/classTypeRoutes.js';
import  newsRouter from'./Routes/newsRouter.js';
import  albumsRouter from'./Routes/albumsRouter.js';
import  albumImagesRoutes from'./Routes/albumImagesRoutes.js';
import  videoRouter from'./Routes/videoRouter.js';
import  formRouter from'./Routes/formRoutes.js';
import  landingRouter from'./Routes/landingRouter.js';
import  landingTitlesRouter from'./Routes/landingTitlesRouter.js';
import  staffRouter from'./Routes/staffRoutes.js';

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
app.use('/albums', albumsRouter);
app.use('/albums/images', albumImagesRoutes);
app.use('/videos', videoRouter);
app.use('/form', formRouter);
app.use('/landing', landingRouter);
app.use('/landing-titles', landingTitlesRouter);
app.use('/staff', staffRouter);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
