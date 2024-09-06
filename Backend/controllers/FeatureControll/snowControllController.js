import pool from "../../db.js";

export const getSnowEffectStatus = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT is_enabled FROM feature_flags WHERE feature_name = 'fallingSnow' LIMIT 1"
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Snow effect not found" });
    }

    const snowEffect = results[0].is_enabled === 1;

    res.json({ snowEffect });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const updateSnowEffectStatus = async (req, res) => {
  try {
    const { snowEffect } = req.body;

    if (typeof snowEffect !== 'boolean') {
      return res.status(400).json({ message: "Invalid snowEffect status provided" });
    }

    const isEnabled = snowEffect ? 1 : 0;

    const [results] = await pool.query(
      "UPDATE feature_flags SET is_enabled = ? WHERE feature_name = 'fallingSnow'",
      [isEnabled]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Snow effect not found" });
    }

    res.json({ message: "Snow effect status updated successfully", snowEffect });
  } catch (error) {
    res.status(500).send(error.message);
  }
};



