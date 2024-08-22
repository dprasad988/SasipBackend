import path from 'path';
import { fileURLToPath } from 'url';
import { uploadFileToSFTP } from '../ftpUpload.js';
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addLecturer = async (req, res) => {
  const {
    name,
    contact,
    subject,
    stream,
    classType = [],
    medium = [],
    bio = '',
    experience = '',
    facebook = '',
    youtube = '',
    website = '' ,
    qualifications = [],
  } = req.body;
  console.log('first', req.body);

  let profilePictureUrl = null;
  const qualificationsWithIcons = [];

  try {
    // Handle profile picture upload
    if (req.files['profilePicture'] && req.files['profilePicture'][0]) {
      const fileBuffer = req.files['profilePicture'][0].buffer;
      const remoteFileName = req.files['profilePicture'][0].originalname;
      profilePictureUrl = await uploadFileToSFTP(fileBuffer, remoteFileName);
    }

    // Handle qualifications upload
    for (let i = 0; i < qualifications.length; i++) {
      const qualification = qualifications[i];
      if (req.files[`qualifications[${i}][icon]`] && req.files[`qualifications[${i}][icon]`][0]) {
        const iconBuffer = req.files[`qualifications[${i}][icon]`][0].buffer;
        const iconRemoteFileName = req.files[`qualifications[${i}][icon]`][0].originalname;
        const iconUrl = await uploadFileToSFTP(iconBuffer, iconRemoteFileName);
        qualificationsWithIcons.push({ ...qualification, icon: iconUrl });
      } else {
        qualificationsWithIcons.push(qualification);
      }
    }

    const [result] = await pool.query(
      `INSERT INTO lecturers (
        profilePicture, name, contact, subject, stream, class_type, medium, bio, experience, social_media_youtube, social_media_facebook, social_media_website, qualifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profilePictureUrl,
        name || null,
        contact || null,
        subject || null,
        stream || null,
        JSON.stringify(classType) || null,
        JSON.stringify(medium) || null,
        bio || null,
        experience || null,
        youtube || null,
        facebook || null,
        website || null,
        JSON.stringify(qualificationsWithIcons) || null,
      ]
    );

    res.status(201).json({ lid: result.insertId });
  } catch (error) {
    console.error('Error adding lecturer:', error);
    res.status(500).send(`Error adding lecturer: ${error.message}`);
  }
};


// Update an existing lecturer
export const updateLecturer = async (req, res) => {
  const {
    lid,
    name,
    contact,
    subject,
    stream,
    classType = [],
    medium = [],
    bio = '',
    experience = '',
    facebook = '',
    youtube = '',
    website = '',
    qualifications = [],
  } = req.body;
  console.log('Update Lecturer Request:', req.body);

  let profilePictureUrl = req.body.existingProfilePicture || null;
  const qualificationsWithIcons = qualifications.map(q => ({ ...q }));

  try {
    // Handle profile picture upload if a new one is provided
    if (req.files['profilePicture'] && req.files['profilePicture'][0]) {
      const fileBuffer = req.files['profilePicture'][0].buffer;
      const remoteFileName = req.files['profilePicture'][0].originalname;
      profilePictureUrl = await uploadFileToSFTP(fileBuffer, remoteFileName);
    }

    // Handle qualifications upload
    for (let i = 0; i < qualifications.length; i++) {
      const qualification = qualifications[i];
      if (req.files[`qualifications[${i}][icon]`] && req.files[`qualifications[${i}][icon]`][0]) {
        const iconBuffer = req.files[`qualifications[${i}][icon]`][0].buffer;
        const iconRemoteFileName = req.files[`qualifications[${i}][icon]`][0].originalname;
        const iconUrl = await uploadFileToSFTP(iconBuffer, iconRemoteFileName);
        qualificationsWithIcons[i].icon = iconUrl;
      }
    }

    // Perform the update query
    await pool.query(
      `UPDATE lecturers SET 
        profilePicture = ?, 
        name = ?, 
        contact = ?, 
        subject = ?, 
        stream = ?, 
        class_type = ?, 
        medium = ?, 
        bio = ?, 
        experience = ?, 
        social_media_youtube = ?, 
        social_media_facebook = ?, 
        social_media_website = ?, 
        qualifications = ?
      WHERE lid = ?`,
      [
        profilePictureUrl,
        name || null,
        contact || null,
        subject || null,
        stream || null,
        JSON.stringify(classType) || null,
        JSON.stringify(medium) || null,
        bio || null,
        experience || null,
        youtube || null,
        facebook || null,
        website || null,
        JSON.stringify(qualificationsWithIcons) || null,
        lid
      ]
    );

    res.status(200).json({ message: 'Lecturer updated successfully' });
  } catch (error) {
    console.error('Error updating lecturer:', error);
    res.status(500).send(`Error updating lecturer: ${error.message}`);
  }
};

// Delete a lecturer
export const deleteLecturer = async (req, res) => {
  const { lid } = req.params;
  try {
    await pool.query("DELETE FROM lecturers WHERE lid = ?", [lid]); 
    res.status(200).send("Lecturer deleted");
  } catch (error) {
    res.status(500).send(`Error deleting lecturer: ${error.message}`);
  }
};

// Get all lecturers
export const getAllLecturers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM lecturers");
    res.json(rows);
  } catch (error) {
    res.status(500).send(`Error retrieving lecturers: ${error.message}`);
  }
};

// Get a specific lecturer by ID
export const getLecturerById = async (req, res) => {
  const { lid } = req.params;
  try {
    const [lecturerRows] = await pool.query("SELECT * FROM lecturers WHERE lid = ?", [lid]);
    if (lecturerRows.length === 0) {
      return res.status(404).send("Lecturer not found");
    }

    res.json({ ...lecturerRows[0] });
  } catch (error) {
    res.status(500).send(`Error retrieving lecturer: ${error.message}`);
  }
};
