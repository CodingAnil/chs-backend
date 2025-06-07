const PatientAppointment = require("../../models/userAppointment");
const User = require("../../models/user");
const { sendResponse } = require("../../utils");

const getAllAppointments = async (req, res) => {
  try {
    const {
      currentPage = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      status,
      dateField = "date", // Can be updatedAt or prescriptionDate
    } = req.query;

    let page = currentPage;
    // Build query
    let query = {};

    // Search by name or testName
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { testName: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      if (status === "Pending") {
        query.status = { $in: ["Pending", "Created", "Accepted"] };
      } else {
        query.status = status;
      }
    }

    // Filter by date range
    if (startDate && endDate) {
      query[dateField] = {};
      if (startDate) {
        query[dateField].$gte = new Date(startDate);
      }
      if (endDate) {
        query[dateField].$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await PatientAppointment.countDocuments(query);

    // Get appointments with populated doctor and patient details
    const appointments = await PatientAppointment.find(query)
      .populate({
        path: "refDoctor",
        select: "firstName lastName email phoneNumber coverImage",
      })
      .populate({
        path: "patientId",
        select: "firstName lastName email phoneNumber coverImage",
      })
      .sort({ [dateField]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return sendResponse(
      res,
      200,
      "Appointments retrieved successfully",
      appointments,
      {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage,
        hasPrevPage,
      }
    );
  } catch (error) {
    console.error("Error in getAllAppointments:", error);
    return sendResponse(res, 500, "Error retrieving appointments", null, error);
  }
};

module.exports = {
  getAllAppointments,
};
