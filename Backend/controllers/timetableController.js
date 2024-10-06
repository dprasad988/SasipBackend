import pool from "../db.js";

export const getAllTimetables = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM timetables");
    res.json(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getTimetablesCount = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT COUNT(*) AS count FROM timetables");
    const count = results[0].count;
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const getPrice = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM prices");
    res.json(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updatePrice = async (req, res) => {
  const { id, classType, price, pStatus, lid, tid } = req.body;

  try {
    const [results] = await pool.query(
      "UPDATE prices SET classType = ?, price = ?, pStatus = ?, lid = ?, timetable_id = ? WHERE id = ?",
      [classType, price, pStatus, lid, tid, id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).send('Price record not found');
    }

    res.status(200).send('Price record updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};


export const addPrice = async (req, res) => {
  const { classType, price, pStatus, tid, lid } = req.body;

  try {
    // Insert new price record
    const [results] = await pool.query(
      "INSERT INTO prices (classType, price, pStatus, timetable_id, lid) VALUES (?, ?, ?, ?, ?)",
      [classType, price, pStatus, tid, lid]
    );

    // Check if the record was inserted
    if (results.affectedRows === 0) {
      return res.status(400).send('Failed to add price record');
    }

    res.status(201).send('Price record added successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};


export const deletePrice = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await pool.query(
      "DELETE FROM prices WHERE id = ?",
      [id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).send('Price record not found');
    }

    res.status(200).send('Price record deleted successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteEditPrice = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "DELETE FROM prices WHERE id = ?",
      [id]
    );

    res.status(200).send('Price record deleted successfully');
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
    priceSessions, 
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
        status || 'Visible',
        year,
        createdAt,
      ]
    );
    const timetableId = result.insertId;

    // Insert priceSessions if provided
  if (priceSessions && Array.isArray(priceSessions)) {
    if(priceSessions.length>0){
      for (const session of priceSessions) {
        await pool.query(
          `INSERT INTO prices (timetable_id, lid, classType, price, pStatus)
          VALUES (?, ?, ?, ?, ?)`,
          [timetableId, lecturerId, session.classType, session.price, session.pStatus]
        );
      }
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
    await pool.query("DELETE FROM prices WHERE timetable_id = ?", [tid]);
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
      res.status(200).json(results);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

