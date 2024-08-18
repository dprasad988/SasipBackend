import pool from '../db.js';

export const getAllLecturers = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM lecturers');
    res.json(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const addLecturer = async (req, res) => {
  const {
    profilePicture, name, contact, subject, stream, class_type,
    medium, bio, experience, social_media_youtube, social_media_facebook,
    social_media_website, qualifications
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO lecturers (profilePicture, name, contact, subject, stream, class_type, medium, bio, experience, social_media_youtube, social_media_facebook, social_media_website, qualifications)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [profilePicture, name, contact, subject, stream, class_type, medium, bio, experience, social_media_youtube, social_media_facebook, social_media_website, qualifications]
    );
    res.status(201).json({ lid: result.insertId });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateLecturer = async (req, res) => {
  const { lid } = req.params;
  const {
    profilePicture, name, contact, subject, stream, class_type,
    medium, bio, experience, social_media_youtube, social_media_facebook,
    social_media_website, qualifications
  } = req.body;

  try {
    await pool.query(
      `UPDATE lecturers SET profilePicture = ?, name = ?, contact = ?, subject = ?, stream = ?, class_type = ?, medium = ?, bio = ?, experience = ?, social_media_youtube = ?, social_media_facebook = ?, social_media_website = ?, qualifications = ?
       WHERE lid = ?`,
      [profilePicture, name, contact, subject, stream, class_type, medium, bio, experience, social_media_youtube, social_media_facebook, social_media_website, qualifications, lid]
    );
    res.status(200).send('Lecturer updated');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const deleteLecturer = async (req, res) => {
  const { lid } = req.params;
  try {
    await pool.query('DELETE FROM lecturers WHERE lid = ?', [lid]);
    res.status(200).send('Lecturer deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
};
