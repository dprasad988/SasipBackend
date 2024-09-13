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
    rank = '',
    status = ''
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

    // Perform the insert query for lecturers
    const [result] = await pool.query(
      `INSERT INTO lecturers (
        profilePicture, name, contact, subject, stream, class_type, medium, bio, experience, social_media_youtube, social_media_facebook, social_media_website, rank, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        rank || null,
        status || null
      ]
    );

    // Insert qualifications into the qualifications table
    const lecturerId = result.insertId;
    for (const qualification of qualificationsWithIcons) {
      await pool.query(
        `INSERT INTO qualifications (lid, name, icon, description) VALUES (?, ?, ?, ?)`,
        [
          lecturerId,
          qualification.name || null,
          qualification.icon || null,
          qualification.description || null
        ]
      );
    }

    res.status(201).json({ lid: lecturerId });
  } catch (error) {
    console.error('Error adding lecturer:', error);
    res.status(500).send(`Error adding lecturer: ${error.message}`);
  }
};

// Helper function to generate a timestamped filename
const getTimestampedFilename = (originalname) => {
  const ext = path.extname(originalname);
  const baseName = path.basename(originalname, ext);
  const timestamp = Date.now(); // Current timestamp in milliseconds
  return `${baseName}_${timestamp}${ext}`;
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
    qualifications = [],  // Array of qualifications
    rank = '',
    status = ''
  } = req.body;

  try {
    // Fetch existing lecturer data
    const [existingLecturerRows] = await pool.query(`SELECT * FROM lecturers WHERE lid = ?`, [lid]);

    if (existingLecturerRows.length === 0) {
      return res.status(404).send('Lecturer not found');
    }

    const existingLecturer = existingLecturerRows[0];

    // Initialize fields with existing data or provided data
    let profilePictureUrl = existingLecturer.profilePicture;
    const profilePictureFile = req.files.find(file => file.fieldname === 'profilePicture');
    if (profilePictureFile) {
      profilePictureUrl = await uploadFileToSFTP(profilePictureFile.buffer, getTimestampedFilename(profilePictureFile.originalname));
    }

    // Update the lecturer in the lecturers table
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
        rank = ?, 
        status = ?
      WHERE lid = ?`;

    const updateValues = [
      profilePictureUrl,
      name || existingLecturer.name,
      contact || existingLecturer.contact,
      subject || existingLecturer.subject,
      stream || existingLecturer.stream,
      JSON.stringify(classType),
      JSON.stringify(medium),
      bio || existingLecturer.bio,
      experience || existingLecturer.experience,
      social_media_youtube || existingLecturer.social_media_youtube,
      social_media_facebook || existingLecturer.social_media_facebook,
      social_media_website || existingLecturer.social_media_website,
      rank || existingLecturer.rank,
      status || existingLecturer.status,
      lid
    ];

    await pool.query(updateQuery, updateValues);

    // Process qualifications
    for (let i = 0; i < qualifications.length; i++) {
      const { id, name, description } = qualifications[i];
      let iconUrl = null;

      // Check if the icon was uploaded in the files
      const qualificationIconFile = req.files.find(file => file.fieldname === `qualifications[${i}][icon]`);
      if (qualificationIconFile) {
        iconUrl = await uploadFileToSFTP(qualificationIconFile.buffer, getTimestampedFilename(qualificationIconFile.originalname));
      }

      if (id) {
        // Update existing qualification
        await pool.query(`
          UPDATE qualifications SET name = ?, description = ?, icon = ? WHERE id = ?
        `, [name, description, iconUrl, id]);
      } else {
        // Insert new qualification
        await pool.query(`
          INSERT INTO qualifications (lid, name, description, icon) VALUES (?, ?, ?, ?)
        `, [lid, name, description, iconUrl]);
      }
    }

    res.status(200).json({ message: 'Lecturer and qualifications updated successfully' });
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

    await connection.query("DELETE FROM qualifications WHERE lid = ?", [lid]);

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

export const getLecturersCount = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query("SELECT COUNT(*) AS count FROM lecturers");
    const count = rows[0].count;
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching lecturers count:', error); // Added logging for debugging
    res.status(500).json({ message: `Error fetching lecturers count: ${error.message}` });
  } finally {
    connection.release(); 
  }
};


// Get all lecturers
export const getAllLecturers = async (req, res) => {
  try {
    // Perform a join query to get lecturers and their qualifications
    const [rows] = await pool.query(`
      SELECT l.*, q.id AS qualification_id, q.name AS qualification_name, q.icon AS qualification_icon, q.description AS qualification_description
      FROM lecturers l
      LEFT JOIN qualifications q ON l.lid = q.lid
    `);

    // Transform the result to group qualifications under each lecturer
    const lecturers = rows.reduce((acc, row) => {
      const lecturer = acc.find(l => l.lid === row.lid);
      if (lecturer) {
        // If lecturer already exists, add the qualification to the existing qualifications array
        if (row.qualification_id) {
          lecturer.qualifications.push({
            id: row.qualification_id,
            name: row.qualification_name,
            icon: row.qualification_icon,
            description: row.qualification_description
          });
        }
      } else {
        // If lecturer does not exist, create a new lecturer entry
        acc.push({
          lid: row.lid,
          profilePicture: row.profilePicture,
          name: row.name,
          contact: row.contact,
          subject: row.subject,
          stream: row.stream,
          class_type: JSON.parse(row.class_type),
          medium: JSON.parse(row.medium),
          bio: row.bio,
          experience: row.experience,
          social_media_youtube: row.social_media_youtube,
          social_media_facebook: row.social_media_facebook,
          social_media_website: row.social_media_website,
          rank: row.rank,
          status: row.status,
          qualifications: row.qualification_id ? [{
            id: row.qualification_id,
            name: row.qualification_name,
            icon: row.qualification_icon,
            description: row.qualification_description
          }] : []
        });
      }
      return acc;
    }, []);

    res.json(lecturers);
  } catch (error) {
    console.error('Error retrieving lecturers:', error);
    res.status(500).send(`Error retrieving lecturers: ${error.message}`);
  }
};

// Get a specific lecturer by ID
export const getLecturerById = async (req, res) => {
  const { lid } = req.params;

  try {
    // Perform a join query to get lecturer details and their qualifications
    const [rows] = await pool.query(`
      SELECT l.*, q.id AS qualification_id, q.name AS qualification_name, q.icon AS qualification_icon, q.description AS qualification_description
      FROM lecturers l
      LEFT JOIN qualifications q ON l.lid = q.lid
      WHERE l.lid = ?
    `, [lid]);

    if (rows.length === 0) {
      return res.status(404).send("Lecturer not found");
    }

    // Transform the result to include qualifications under the lecturer
    const lecturer = rows.reduce((acc, row) => {
      if (!acc) {
        acc = {
          lid: row.lid,
          profilePicture: row.profilePicture,
          name: row.name,
          contact: row.contact,
          subject: row.subject,
          stream: row.stream,
          class_type: JSON.parse(row.class_type),
          medium: JSON.parse(row.medium),
          bio: row.bio,
          experience: row.experience,
          social_media_youtube: row.social_media_youtube,
          social_media_facebook: row.social_media_facebook,
          social_media_website: row.social_media_website,
          rank: row.rank,
          status: row.status,
          qualifications: []
        };
      }

      if (row.qualification_id) {
        acc.qualifications.push({
          id: row.qualification_id,
          name: row.qualification_name,
          icon: row.qualification_icon,
          description: row.qualification_description
        });
      }

      return acc;
    }, null);

    res.json(lecturer);
  } catch (error) {
    console.error('Error retrieving lecturer:', error);
    res.status(500).send(`Error retrieving lecturer: ${error.message}`);
  }
};

