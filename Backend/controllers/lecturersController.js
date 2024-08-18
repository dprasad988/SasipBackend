import pool from "../db.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import ftp from "basic-ftp";

// FTP Upload Helper Function
async function uploadFileToFTP(file, destinationPath) {
  const client = new ftp.Client();
  client.ftp.verbose = true;


  try {
    await client.access({
      host: "ftp.orangered-quail-934133.hostingersite.com", // Replace with your FTP host
      user: "u543552070.supun", // Replace with your FTP username
      password: "Sasip.1234", // Replace with your FTP password
      secure: false,
    });

    console.log("Connected to FTP server");

    await client.uploadFrom(file, destinationPath);
    console.log(`File uploaded to ${destinationPath}`);
  } catch (err) {
    console.error("FTP upload error:", err);
    throw new Error("Failed to upload file to FTP server");
  } finally {
    client.close();
  }
}

// Add a new lecturer
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
    socialMedia = { facebook: '', website: '', youtube: '' },
    qualifications = [],
  } = req.body;

  let profilePictureUrl = null;

  try {
    // Handle profile picture upload
    if (req.files && req.files.profilePicture) {
      const profilePicture = req.files.profilePicture;
      const profilePictureName = uuidv4() + path.extname(profilePicture.name);
      const remotePath = `/public_html/uploads/${profilePictureName}`;

      // Upload to FTP
      await uploadFileToFTP(profilePicture.tempFilePath, remotePath);

      // Set profile picture URL
      profilePictureUrl = `https://your-domain.com/uploads/${profilePictureName}`;
    }

    // Insert lecturer into the database
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
        socialMedia.youtube || null,
        socialMedia.facebook || null,
        socialMedia.website || null,
        JSON.stringify(qualifications) || null,
      ]
    );

    res.status(201).json({ lid: result.insertId });
  } catch (error) {
    res.status(500).send(`Error adding lecturer: ${error.message}`);
  }
};

// Update an existing lecturer
export const updateLecturer = async (req, res) => {
  const { lid } = req.params;
  const {
    profilePicture,
    name,
    contact,
    subject,
    stream,
    classType,
    medium,
    bio,
    experience,
    socialMedia: { facebook, website, youtube },
    qualifications,
  } = req.body;

  let profilePictureUrl = profilePicture;

  try {
    // Handle profile picture update
    if (req.files && req.files.profilePicture) {
      const newProfilePicture = req.files.profilePicture;
      const profilePictureName = uuidv4() + path.extname(newProfilePicture.name);
      const remotePath = `/public_html/uploads/${profilePictureName}`;

      // Upload to FTP
      await uploadFileToFTP(newProfilePicture.tempFilePath, remotePath);

      profilePictureUrl = `https://your-domain.com/uploads/${profilePictureName}`;
    }

    await pool.query(
      `UPDATE lecturers SET
        profilePicture = ?, name = ?, contact = ?, subject = ?, stream = ?, class_type = ?, medium = ?, bio = ?, experience = ?, social_media_youtube = ?, social_media_facebook = ?, social_media_website = ?
       WHERE lid = ?`,
      [
        profilePictureUrl,
        name,
        contact,
        subject,
        stream,
        JSON.stringify(classType),
        JSON.stringify(medium),
        bio,
        experience,
        youtube,
        facebook,
        website,
        lid,
      ]
    );

    // Delete existing qualifications for the lecturer
    await pool.query(`DELETE FROM qualifications WHERE lecturer_id = ?`, [lid]);

    // Insert new qualifications
    for (let qualification of qualifications) {
      const { name: qName, description: qDescription, icon: qIcon } = qualification;
      const iconFile = req.files[qIcon];

      const iconName = uuidv4() + path.extname(iconFile.name);
      const remoteIconPath = `/public_html/uploads/${iconName}`;

      // Upload qualification icon to FTP
      await uploadFileToFTP(iconFile.tempFilePath, remoteIconPath);

      const iconUrl = `https://your-domain.com/uploads/${iconName}`;

      await pool.query(
        `INSERT INTO qualifications (lecturer_id, name, description, icon) VALUES (?, ?, ?, ?)`,
        [lid, qName, qDescription, iconUrl]
      );
    }

    res.status(200).send("Lecturer updated");
  } catch (error) {
    res.status(500).send(`Error updating lecturer: ${error.message}`);
  }
};

// Delete a lecturer
export const deleteLecturer = async (req, res) => {
  const { lid } = req.params;
  try {
    await pool.query("DELETE FROM qualifications WHERE lecturer_id = ?", [lid]); // Delete related qualifications first
    await pool.query("DELETE FROM lecturers WHERE lid = ?", [lid]); // Then delete the lecturer
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

    const [qualificationRows] = await pool.query("SELECT * FROM qualifications WHERE lecturer_id = ?", [lid]);

    res.json({ ...lecturerRows[0], qualifications: qualificationRows });
  } catch (error) {
    res.status(500).send(`Error retrieving lecturer: ${error.message}`);
  }
};
