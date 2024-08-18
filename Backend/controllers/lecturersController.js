import pool from "../db.js";

// Get all lecturers
export const getAllLecturers = async (req, res) => {
  try {
    // Use await to handle the promise returned by pool.query
    const [rows] = await pool.query('SELECT * FROM lecturers');
    res.json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
};


// Add a new lecturer
export const addLecturer = async (req, res) => {
  const {
    profilePicture, name, contact, subject, stream, class_type,
    medium, bio, experience, social_media_youtube, social_media_facebook,
    social_media_website, qualifications
  } = req.body;

  try {
    // Insert the new lecturer into the database
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

// Update an existing lecturer
export const updateLecturer = async (req, res) => {
  const { lid } = req.params;
  const {
    profilePicture, name, contact, subject, stream, class_type,
    medium, bio, experience, social_media_youtube, social_media_facebook,
    social_media_website, qualifications
  } = req.body;

  try {
    // Update the lecturer details
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

// Delete a lecturer
export const deleteLecturer = async (req, res) => {
  const { lid } = req.params;
  try {
    // Delete the lecturer from the database
    await pool.query('DELETE FROM lecturers WHERE lid = ?', [lid]);
    res.status(200).send('Lecturer deleted');
  } catch (error) {
    res.status(500).send(error.message);
  }
};
