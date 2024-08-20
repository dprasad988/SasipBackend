import pool from '../db.js';

export const getAllTimetables = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM timetables');
    res.json(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const addTimetable = async (req, res) => {
    const {
      lecturerId, lecturerName, subject, classMode, classType, medium, day, time,
      note, status, year
    } = req.body;
  
    if (!lecturerId || !lecturerName || !subject || !classMode || !classType || !medium || !day || !time || !status || !year) {
      return res.status(400).send('Missing required fields');
    }
  
    try {
      const createdAt = new Date(); 
      const [result] = await pool.query(
        `INSERT INTO timetables (lid, name, subject, classMode, classType, medium, day, time, note, status, year, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [lecturerId, lecturerName, subject, classMode, classType, medium, day, time, note, status, year, createdAt]
      );
      res.status(201).json({ tid: result.insertId });
    } catch (error) {
      console.error('Error inserting timetable:', error);
      res.status(500).send(error.message);
    }
  };
  

export const updateTimetable = async (req, res) => {
  const { tid } = req.params;
  const {
    lid, name, subject, classMode, classType, medium, day, time,
    note, status, year
  } = req.body;

  try {
    await pool.query(
      `UPDATE timetables SET lid = ?, name = ?, subject = ?, classMode = ?, classType = ?, medium = ?, day = ?, time = ?, note = ?, status = ?, year = ?
       WHERE tid = ?`,
      [lid, name, subject, classMode, classType, medium, day, time, note, status, year, tid]
    );
    res.status(200).send('Timetable updated');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteTimetable = async (req, res) => {
  const { tid } = req.params;
  try {
    await pool.query('DELETE FROM timetables WHERE tid = ?', [tid]);
    res.status(200).send('Timetable deleted');
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

