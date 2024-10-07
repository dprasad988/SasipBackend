import db from "../db.js";
import { uploadFileToSFTP } from "../ftpUpload.js";
import { deleteFileFromSFTP } from "../ftpUpload.js";

// Create a new record
export const createRecord = async (req, res) => {
  const { rank, status } = req.body;
  let imageUrl = null;

  if (req.files["image"] && req.files["image"][0]) {
    const fileBuffer = req.files["image"][0].buffer;
    const remoteFileName = req.files["image"][0].originalname;
    try {
      imageUrl = await uploadFileToSFTP(fileBuffer, remoteFileName);
    } catch (error) {
      return res.status(500).json({ error: "Failed to upload image" });
    }
  }

  const query =
    "INSERT INTO landing_data (image, rank, status) VALUES (?, ?, ?)";
  try {
    const [results] = await db.execute(query, [imageUrl, rank, status]);
    res
      .status(201)
      .json({ id: results.insertId, image: imageUrl, rank, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a record by ID
export const updateRecordById = async (req, res) => {
  const { id } = req.params;
  let { rank, status } = req.body;

  // Ensure `rank` and `status` are not undefined
  if (rank === undefined || status === undefined) {
    return res.status(400).json({ error: "Rank and status must be provided" });
  }

  // Convert undefined to null (if you prefer handling it this way)
  rank = rank === undefined ? null : rank;
  status = status === undefined ? null : status;

  const query = "UPDATE landing_data SET rank = ?, status = ? WHERE id = ?";

  try {
    await db.execute(query, [rank, status, id]);
    res.status(200).json({ id, rank, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Other controllers
export const getAllRecords = async (req, res) => {
  const query = "SELECT * FROM landing_data";
  try {
    const [results] = await db.execute(query);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRecordById = async (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM landing_data WHERE id = ?";
  try {
    const [results] = await db.execute(query, [id]);
    if (results.length === 0)
      return res.status(404).json({ message: "Record not found" });
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRecordById = async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM landing_data WHERE id = ?";
  try {
    // Retrieve the image URL before deleting the news
    const [rows] = await db.query("SELECT image FROM landing_data WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "News not found" });
    }
    // const newsImageUrl = rows[0].image;

    // // // Delete the image from SFTP if it exists
    // if (newsImageUrl) {
    //   await deleteFileFromSFTP(newsImageUrl);
    // }
    const [results] = await db.execute(query, [id]);
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "Record not found" });
    res.status(200).json({ message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
