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

  console.log('Adding Lecturer:', req.body);
  console.log('Files:', req.files);

  let profilePictureUrl = 'https://i.pinimg.com/originals/07/33/ba/0733ba760b29378474dea0fdbcb97107.png';
  const qualificationsWithIcons = [];

  try {
    // Handle profile picture upload
    const profilePictureFile = req.files.find(file => file.fieldname === 'profilePicture');
    if (profilePictureFile) {
      const fileBuffer = profilePictureFile.buffer;
      const remoteFileName = profilePictureFile.originalname;
      profilePictureUrl = await uploadFileToSFTP(fileBuffer, remoteFileName);
    }

    // Handle qualifications upload
    for (let i = 0; i < qualifications.length; i++) {
      const qualification = qualifications[i];
      const iconFile = req.files.find(file => file.fieldname === `qualifications[${i}][icon]`);
      let iconUrl = null;
      if (iconFile) {
        const iconBuffer = iconFile.buffer;
        const iconRemoteFileName = iconFile.originalname;
        iconUrl = await uploadFileToSFTP(iconBuffer, iconRemoteFileName);
      }
      qualificationsWithIcons.push({ ...qualification, icon: iconUrl });
    }

    // Perform the insert query
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


export const updateLecturer = async (req, res) => {
  const { lid } = req.params;
  const {
    name,
    contact,
    subject,
    stream,
    classType = [],
    medium = [],
    bio = '',
    experience = '',
    social_media_facebook = '',
    social_media_youtube = '',
    social_media_website = '',
    qualifications: qualificationsString = '[]',
  } = req.body;
  console.log(req.body);
  

  try {
    // Fetch existing lecturer data
    const [existingLecturerRows] = await pool.query(
      `SELECT * FROM lecturers WHERE lid = ?`,
      [lid]
    );

    if (existingLecturerRows.length === 0) {
      return res.status(404).send('Lecturer not found');
    }

    const existingLecturer = existingLecturerRows[0];

    // Initialize fields with existing data or provided data
    let profilePictureUrl = existingLecturer.profilePicture;
    let qualifications = JSON.parse(qualificationsString) || JSON.parse(existingLecturer.qualifications || '[]');
    let classTypeUpdate = classType.length ? JSON.stringify(classType) : JSON.stringify(existingLecturer.class_type);
    let mediumUpdate = medium.length ? JSON.stringify(medium) : JSON.stringify(existingLecturer.medium);
    let bioUpdate = bio || existingLecturer.bio;
    let experienceUpdate = experience || existingLecturer.experience;
    let facebookUpdate = social_media_facebook;
    let youtubeUpdate = social_media_youtube;
    let websiteUpdate = social_media_website;

    // Handle profile picture upload if a new one is provided
    const profilePictureFile = req.files.find(file => file.fieldname === 'profilePicture');
    if (profilePictureFile) {
      profilePictureUrl = await uploadFileToSFTP(profilePictureFile.buffer, profilePictureFile.originalname);
    }

    // Handle qualifications upload
    for (const file of req.files) {
      const match = file.fieldname.match(/qualifications\[(\d+)\]\[icon\]/);
      if (match) {
        const qualificationIndex = parseInt(match[1], 10);
        const iconUrl = await uploadFileToSFTP(file.buffer, file.originalname);
        qualifications[qualificationIndex] = {
          ...qualifications[qualificationIndex],
          icon: iconUrl
        };
      }
    }

    // Construct the update query
    const updateQuery = `
      UPDATE lecturers SET 
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
      WHERE lid = ?`;

    const updateValues = [
      profilePictureUrl,
      name || existingLecturer.name,
      contact || existingLecturer.contact,
      subject || existingLecturer.subject,
      stream || existingLecturer.stream,
      classTypeUpdate,
      mediumUpdate,
      bioUpdate,
      experienceUpdate,
      youtubeUpdate,
      facebookUpdate,
      websiteUpdate,
      JSON.stringify(qualifications),
      lid
    ];

    // Perform the update query
    await pool.query(updateQuery, updateValues);

    res.status(200).json({ message: 'Lecturer updated successfully' });
  } catch (error) {
    console.error('Error updating lecturer:', error);
    res.status(500).send(`Error updating lecturer: ${error.message}`);
  }
};

// Delete a lecturer
export const deleteLecturer = async (req, res) => {
  const { lid } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction(); 

    await connection.query("DELETE FROM news WHERE lid = ?", [lid]);

    await connection.query("DELETE FROM tutes WHERE lid = ?", [lid]);

    await connection.query("DELETE FROM lecturers WHERE lid = ?", [lid]);

    await connection.commit();

    res.status(200).send("Lecturer and associated news and tutes entries deleted successfully");
  } catch (error) {
    await connection.rollback(); 
    res.status(500).send(`Error deleting lecturer: ${error.message}`);
  } finally {
    connection.release(); 
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
