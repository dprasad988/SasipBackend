import db from "../db.js";

// Function to get the current visit count
export const getCount = async (req, res) => {
  try {
    const [result] = await db.query('SELECT count FROM visit_counter WHERE id = 1');
    res.json({ count: result[0].count });
    console.log(result);
    
  } catch (error) {
    console.error('Error fetching visit count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to update (increment) the visit count
export const updateCount = async (req, res) => {
  try {
    await db.query('UPDATE visit_counter SET count = count + 1 WHERE id = 1');
    res.json({ success: true, message: 'Visit count updated successfully' });
  } catch (error) {
    console.error('Error updating visit count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
