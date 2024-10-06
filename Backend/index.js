import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import lecturerRoutes from "./Routes/lecturerRoutes.js";
import timetableRoutes from "./Routes/timetableRoutes.js";
import classTypeRouter from "./Routes/classTypeRoutes.js";
import newsRouter from "./Routes/newsRouter.js";
import albumsRouter from "./Routes/albumsRouter.js";
import albumImagesRoutes from "./Routes/albumImagesRoutes.js";
import videoRouter from "./Routes/videoRouter.js";
import formRouter from "./Routes/formRoutes.js";
import landingRouter from "./Routes/landingRouter.js";
import landingTitlesRouter from "./Routes/landingTitlesRouter.js";
import staffRouter from "./Routes/staffRoutes.js";
import tutesRoutes from "./Routes/tutesRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import contactUsRoutes from "./Routes/contactUsRoutes.js";
import snowControllRoutes from "./Routes/FeatureControl/snowControllRoutes.js";
import flagControllRoutes from "./Routes/FeatureControl/flagControllRoutes.js";
import visitCountRoutes from "./Routes/visitCountRoutes.js"

dotenv.config();

const port = 5005;
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/lecturers", lecturerRoutes);
app.use("/timetables", timetableRoutes);
app.use("/classType", classTypeRouter);
app.use("/news", newsRouter);
app.use("/albums", albumsRouter);
app.use("/albums/images", albumImagesRoutes);
app.use("/videos", videoRouter);
app.use("/form", formRouter);
app.use("/landing", landingRouter);
app.use("/landing-titles", landingTitlesRouter);
app.use("/staff", staffRouter);
app.use("/tutes", tutesRoutes);
app.use("/contact", contactUsRoutes);
app.use("/snowControll", snowControllRoutes);
app.use("/flagControl", flagControllRoutes);
app.use("/visitCount", visitCountRoutes);


import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "console";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/chat", async (req, res) => {
  const { prompt, history = [] } = req.body;

  try {
    const formattedHistory = history.map((msg) => {
      return {
        role: msg.role,
        parts: msg.parts.map((part) => {
          return { text: part.text };
        }),
      };
    });
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 4096,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    
    res.status(200).json({ text, message: "success" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
