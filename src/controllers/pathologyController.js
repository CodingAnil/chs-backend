const PathologyLabProfile = require("../models/PathologyLabProfile");

// GET /pathology/:id - Fetch pathology lab profile
const getPathologyLabProfile = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Pathology lab ID is required",
      });
    }

    const lab = await PathologyLabProfile.findById(id);

    if (!lab) {
      return res.status(404).json({
        status: false,
        message: "Pathology lab not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Pathology lab profile fetched successfully",
      data: lab,
    });
  } catch (error) {
    console.error("Error fetching pathology profile:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// PUT /pathology/:id - Update pathology lab profile
const updatePathologyLabProfile = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Pathology lab ID is required",
      });
    }

    const updatedLab = await PathologyLabProfile.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedLab) {
      return res.status(404).json({
        status: false,
        message: "Pathology lab not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Pathology lab profile updated successfully",
      data: updatedLab,
    });
  } catch (error) {
    console.error("Error updating pathology profile:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getPathologyLabProfile,
  updatePathologyLabProfile,
};
