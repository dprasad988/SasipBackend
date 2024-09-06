import pool from "../../db.js";

// Get the current flag display status
export const getFlagDisplayStatus = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT display_flag FROM feature_flags WHERE feature_name = 'fallingSnow' LIMIT 1"
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Flag display status not found" });
    }

    // Convert the integer value to a boolean
    const flagDisplay = results[0].display_flag === 1;

    res.json({ flagDisplay });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update the flag display status
export const updateFlagDisplayStatus = async (req, res) => {
  try {
    const { flagDisplay } = req.body;

    if (typeof flagDisplay !== 'boolean') {
      return res.status(400).json({ message: "Invalid flag display status provided" });
    }

    const isEnabled = flagDisplay ? 1 : 0;

    const [results] = await pool.query(
      "UPDATE feature_flags SET display_flag = ? WHERE feature_name = 'fallingSnow'",
      [isEnabled]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Flag display status not found" });
    }

    res.json({ message: "Flag display status updated successfully", flagDisplay });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
