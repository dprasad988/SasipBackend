import pool from "../db.js";

export const getAllNews = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM news");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addNews = async (req, res) => {
  const { lid, title, description, whatsapp, newsStatus } = req.body;
  let newsImageUrl = null;

  if (req.files["image"] && req.files["image"][0]) {
    const fileBuffer = req.files["image"][0].buffer;
    const remoteFileName = req.files["image"][0].originalname;
    newsImageUrl = await uploadFileToSFTP(fileBuffer, remoteFileName);
  }
  if (!lid || !title || !description || !whatsapp || !newsStatus) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO news (lid, title, description, whatsapp, newsStatus, image) VALUES (?, ?, ?, ?, ?, ?)",
      [lid, title, description, whatsapp, newsStatus, newsImageUrl]
    );
    res.json({
      lid,
      title,
      description,
      whatsapp,
      newsStatus,
      newsImageUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNews = async (req, res) => {
  const { id } = req.params;
  const { lid, title, description, whatsapp, newsStatus, image } = req.body;

  if (!lid || !title || !description || !whatsapp || !newsStatus) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE news SET lid = ?, title = ?, description = ?, whatsapp = ?, newsStatus = ?, image = ? WHERE id = ?",
      [lid, title, description, whatsapp, newsStatus, image, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json({ id, lid, title, description, whatsapp, newsStatus, image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNews = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM news WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
