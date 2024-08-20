import pool from "../db.js";

export const getAllTimetables = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM timetables");
    res.json(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
export const getPrice = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM price_sessions");
    res.json(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const addTimetable = async (req, res) => {
  const {
    lecturerId,
    lecturerName,
    subject,
    classMode,
    classType,
    medium,
    day,
    time,
    note,
    status,
    year,
    priceSessions, // Ensure this is included in the request body
  } = req.body;

  if (
    !lecturerId ||
    !lecturerName ||
    !subject ||
    !classMode ||
    !classType ||
    !medium ||
    !day ||
    !time ||
    !status ||
    !year
  ) {
    return res.status(400).send("Missing required fields");
  }

  try {
    const createdAt = new Date();
    const [result] = await pool.query(
      `INSERT INTO timetables (lid, name, subject, classMode, classType, medium, day, time, note, status, year, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lecturerId,
        lecturerName,
        subject,
        classMode,
        classType,
        medium,
        day,
        time,
        note,
        status,
        year,
        createdAt,
      ]
    );
    const timetableId = result.insertId;

    // Insert priceSessions if provided
    if (priceSessions && Array.isArray(priceSessions)) {
      for (const session of priceSessions) {
        await pool.query(
          `INSERT INTO price_sessions (timetable_id, classType, price, pStatus)
           VALUES (?, ?, ?, ?)`,
          [timetableId, session.classType, session.price, session.pStatus]
        );
      }
    }

    res.status(201).json({ tid: timetableId });
  } catch (error) {
    console.error("Error inserting timetable:", error);
    res.status(500).send(error.message);
  }
};

export const updateTimetable = async (req, res) => {
  const { tid } = req.params;
  const {
    lid,
    name,
    subject,
    classMode,
    classType,
    medium,
    day,
    time,
    note,
    status,
    year,
    priceSessions, // If updating priceSessions, include it here
  } = req.body;

  try {
    await pool.query(
      `UPDATE timetables SET lid = ?, name = ?, subject = ?, classMode = ?, classType = ?, medium = ?, day = ?, time = ?, note = ?, status = ?, year = ?
       WHERE tid = ?`,
      [
        lid,
        name,
        subject,
        classMode,
        classType,
        medium,
        day,
        time,
        note,
        status,
        year,
        tid,
      ]
    );

    // Optionally update priceSessions
    if (priceSessions && Array.isArray(priceSessions)) {
      // First, clear the old price sessions
      await pool.query("DELETE FROM price_sessions WHERE timetable_id = ?", [tid]);

      // Then insert the new ones
      for (const session of priceSessions) {
        await pool.query(
          `INSERT INTO price_sessions (timetable_id, classType, price, pStatus)
           VALUES (?, ?, ?, ?)`,
          [tid, session.classType, session.price, session.pStatus]
        );
      }
    }

    res.status(200).send("Timetable updated");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteTimetable = async (req, res) => {
  const { tid } = req.params;
  try {
    await pool.query("DELETE FROM timetables WHERE tid = ?", [tid]);
    // Optionally delete related priceSessions
    await pool.query("DELETE FROM price_sessions WHERE timetable_id = ?", [tid]);
    res.status(200).send("Timetable deleted");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getTimetableById = async (req, res) => {
  const { tid } = req.params;
  console.log(tid)
  try {
    const [results] = await pool.query('SELECT * FROM timetables WHERE lid = ?', [tid]);
    if (results.length === 0) {
      res.status(404).send("Timetable not found");
    } else {
      res.status(200).json(results[0]);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

