const ContactUs = require("../../models/contactus");
const TeamApplication = require("../../models/teamAplication");

const { sendResponse } = require("../../utils");

// 1. Add new feedback
const createContact = async (req, res) => {
  const { name, email, phone, services, message ,userId } = req.body;

  try {
    // Store in MongoDB
    const newContact = new ContactUs({
      name,
      email,
      phone,
      services,
      message,
      userId
    });

    await newContact.save();

    // Email configuration

    return sendResponse(
      res,
      201,
      "Contact form submitted successfully!",
      newContact
    );
  } catch (error) {
    console.error("Error:", error);
    return sendResponse(res, 500, error.message);
  }
};

// 2. Get all feedbacks
async function getAllFeedbacks(req, res) {
  try {
    let page = Math.max(1, parseInt(req.query.currentPage) || 1);
    let limit = Math.max(1, parseInt(req.query.limit) || 10);

    const totalWords = await ContactUs.countDocuments();

    let paginatedData = await ContactUs.find()
      .populate("userId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalWords / limit);

    if (paginatedData?.length <= 0) {
      page = 1;
      paginatedData = await ProhibitedWords.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    return sendResponse(
      res,
      200,
      "All feedbacks fetched successfully.",
      paginatedData,
      {
        currentPage: page,
        limit,
        totalWords,
        totalPages,
      }
    );
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return sendResponse(res, 500, error.message);
  }
}

// 3. Get all feedbacks of a user by userId
async function getFeedbacksByUserId(req, res) {
  try {
    const { userId } = req.params;
    const feedbacks = await ContactUs.find({ userId })
      .populate("userId")
      .sort({ createdAt: -1 });
    return sendResponse(
      res,
      200,
      "Feedbacks fetched successfully for the user.",
      feedbacks
    );
  } catch (error) {
    console.error("Error fetching feedbacks by userId:", error);
    return sendResponse(res, 500, error.message);
  }
}

// 4. Update feedback by ID
async function updateFeedback(req, res) {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedFeedback = await ContactUs.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedFeedback) {
      return sendResponse(res, 404, "Feedback not found.", null);
    }

    return sendResponse(
      res,
      200,
      "Feedback updated successfully.",
      updatedFeedback
    );
  } catch (error) {
    console.error("Error updating feedback:", error);
    return sendResponse(res, 500, error.message);
  }
}

// 5. Delete feedback by ID
async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;
    const deletedFeedback = await ContactUs.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return sendResponse(res, 404, "Feedback not found.", null);
    }

    return sendResponse(
      res,
      200,
      "Feedback deleted successfully.",
      deletedFeedback
    );
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return sendResponse(res, 500, error.message);
  }
}

// ✅ 1. Create Application
const createApplication = async (req, res) => {
  const { name, phone, email, experience, designation, message, resumeUrl,resumeKey,userId } =
    req.body;

  try {
    const newApplication = new TeamApplication({
      name,
      phone,
      email,
      experience,
      designation,
      message,
      resumeUrl,
      resumeKey,
      userId
    });

    await newApplication.save();
    return sendResponse(
      res,
      201,
      "Application submitted successfully!",
      newApplication
    );
  } catch (error) {
    console.error("Error:", error);
    return sendResponse(res, 500, error.message);
  }
};

// ✅ 2. Get All Applications
const getAllApplications = async (req, res) => {
  try {
    const applications = await TeamApplication.find();
    return sendResponse(
      res,
      200,
      "Application fetched successfully!",
      applications
    );
  } catch (error) {
    console.error("Error:", error);
    return sendResponse(res, 500, error.message);
  }
};

// ✅ 3. Get Application by ID
const getApplicationById = async (req, res) => {
  const { id } = req.params;

  try {
    const application = await TeamApplication.findById(id);
    if (!application) {
      return sendResponse(res, 404, "Application not found");
    }
    return sendResponse(res, 200, "Application fetched", application);
  } catch (error) {
    console.error("Error:", error);
    return sendResponse(res, 500, error.message);
  }
};

// ✅ 4. Update Application (Status or Details)
const updateApplication = async (req, res) => {
  const { id } = req.params;
  const { status, ...updateData } = req.body;

  try {
    const updatedApplication = await TeamApplication.findByIdAndUpdate(
      id,
      { $set: { ...updateData, status } },
      { new: true }
    );

    if (!updatedApplication) {
      return sendResponse(res, 404, "Application not found");
    }

    return sendResponse(
      res,
      200,
      "Application updated successfully",
      updatedApplication
    );
  } catch (error) {
    console.error("Error:", error);
    return sendResponse(res, 500, error.message);
  }
};

module.exports = {
  createContact,
  getAllFeedbacks,
  getFeedbacksByUserId,
  updateFeedback,
  deleteFeedback,
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
};
