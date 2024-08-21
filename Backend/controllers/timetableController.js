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
    const [results] = await pool.query("SELECT * FROM prices");
    console.log('Price sessions fetched:', results);
    res.json(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updatePrice = async (req, res) => {
  const { id, classType, price, pStatus } = req.body;
  console.log('req.body', req.body)

  try {
    const [results] = await pool.query(
      "UPDATE prices SET classType = ?, price = ?, pStatus = ? WHERE id = ?",
      [classType, price, pStatus, id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).send('Price record not found');
    }

    console.log('Price record updated:', results);
    res.status(200).send('Price record updated successfully');
  } catch (error) {
    console.error('Error updating price record:', error);
    res.status(500).send(error.message);
  }
};

export const deletePrice = async (req, res) => {
  const { id } = req.params;
  console.log('req.params', req.params);

  try {
    const [results] = await pool.query(
      "DELETE FROM prices WHERE id = ?",
      [id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).send('Price record not found');
    }

    console.log('Price record deleted:', results);
    res.status(200).send('Price record deleted successfully');
  } catch (error) {
    console.error('Error deleting price record:', error);
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
      const { id: classTypeId, label: classTypeLabel } = session.classType;

      await pool.query(
        `INSERT INTO prices (timetable_id, lid, classType, price, pStatus)
        VALUES (?, ?, ?, ?, ?)`,
        [timetableId, lecturerId, classTypeLabel, session.price, session.pStatus]
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

    res.status(200).send("Timetable updated");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteTimetable = async (req, res) => {
  const { tid } = req.params;
  try {
    await pool.query("DELETE FROM timetables WHERE tid = ?", [tid]);
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

