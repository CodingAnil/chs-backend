const { FRONTEND_URL } = require("../configs");
const { deleteS3File } = require("../configs/s3");
const sendSms = require("../configs/sendSms");
const doctorProfile = require("../models/doctorProfile");
const patientProfile = require("../models/patientProfile");
const pharmaProfile = require("../models/pharmaProfile");
const pathologyLabProfile = require("../models/PathologyLabProfile");
const nurseProfile = require("../models/nurseProfile");
const User = require("../models/user");
const UserOtp = require("../models/userOtp");
const {
  sendResponse,
  generateToken,
  handleingError,
  capitalizeFirstLetter,
} = require("../utils");
const bcrypt = require("bcryptjs");
// const { forSendEmail } = require("../utils/helpers/sendEmail");

const signUp = async (req, res) => {
  try {
    const { name, phoneNumber, email, password, address, role } = req.body;

    if (!phoneNumber || !password) {
      return sendResponse(res, 400, "Phone number and password are required!");
    }

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return sendResponse(res, 400, "This phone number is already registered");
    }
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return sendResponse(res, 400, "This email is already used");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(role, "role");
    console.log("Creating New profile", "action");

    let newProfile = null;
    if (role?.toLowerCase() == "patient") {
      newProfile = new patientProfile({
        firstName: name,
        phoneNumber,
        email: email?.toLowerCase(),
        address,
      });
    } else if (role?.toLowerCase() == "doctor") {
      newProfile = new doctorProfile({
        firstName: name,
        displayName: name,
        phoneNumber,
        email: email?.toLowerCase(),
        address,
      });
    } else if (role?.toLowerCase() == "pharmacy retailers") {
      newProfile = new pharmaProfile({
        firstName: name,
        phoneNumber,
        email: email?.toLowerCase(),
        address,
      });
    } 
    else if (role?.toLowerCase() == "nursing") {
      newProfile = new nurseProfile({
        firstName: name,
        phoneNumber,
        email: email?.toLowerCase(),
        address,
      });
    }
    else if (role?.toLowerCase() == "pathology") {
      newProfile = new pathologyLabProfile({
        firstName: name,
        phoneNumber,
        email: email?.toLowerCase(),
        address,
      });
    }

    await newProfile.save();

    const newUser = new User({
      name,
      phoneNumber,
      email: email?.toLowerCase(),
      password: hashedPassword,
      address,
      role: capitalizeFirstLetter(role),
      profile: newProfile?._id,
      isVerified: false,
    });

    await newUser.save();

    await sendOtpToPhoneNumber(phoneNumber);

    const user = await getUserWithProfile(newUser?._id);

    return sendResponse(
      res,
      201,
      "Registration successful. An OTP has been sent to your phone number for verification.",
      user
    );
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User?.findOne({ phoneNumber: req.body.phoneNumber });
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    await sendOtpToPhoneNumber(user?.phoneNumber);

    return sendResponse(res, 200, "Otp sent to phone number successfully.");
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { phoneNumber, otp, password } = req.body;

    const userOtp = await UserOtp.findOne({ phoneNumber, otp });
    if (!userOtp) {
      return sendResponse(res, 400, "No otp found ");
    }

    if (userOtp?.otp !== otp || userOtp?.otpExpiry < Date.now()) {
      return sendResponse(res, 400, "Invalid or expired OTP");
    }

    await UserOtp.findByIdAndDelete(userOtp?._id);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await User?.findOneAndUpdate(
      { phoneNumber },
      { password: hashedPassword }
    );

    return sendResponse(
      res,
      200,
      "Password reset successfully",
      getUserWithProfile(user?._id)
    );
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const userOtp = await UserOtp.find({ phoneNumber });
    if (!userOtp) {
      return sendResponse(res, 400, "No otp found ");
    }

    const otps = userOtp.map((e) => e.otp);

    if (!otps.includes(otp)) {
      return sendResponse(res, 400, "Invalid or expired OTP");
    }

    await UserOtp.findByIdAndDelete(userOtp?._id);
    let user = await User?.findOneAndUpdate(
      { phoneNumber },
      { isVerified: true }
    );

    return sendResponse(
      res,
      200,
      "OTP verified successfully",
      getUserWithProfile(user?._id)
    );
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

const userEmialVerify = async (req, res) => {
  try {
    const userId = req.user?._id;
    const user = await User.findByIdAndUpdate(userId, { emailVerified: true });
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }
    const userDetails = await getUserWithProfile(user._id);

    return sendResponse(
      res,
      200,
      "Email verification successfully",
      userDetails
    );
  } catch (error) {
    return handleingError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params?.userId;
    if (!userId) {
      return sendResponse(res, 400, "User ID is required");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    // if (!user.emailVerified) {
    //   return sendResponse(res, 400, "Please verify your email first!");
    // }

    const updateFields = {};

    const {
      password,
      oldPassword,
      coverImage,
      fileKey,
      role,
      profile,
      notification,
    } = req.body;

    if (profile) updateFields.profile = profile;
    if (typeof notification !== "undefined")
      updateFields.notification = notification;

    if (password) {
      // if (typeof oldPassword !== undefined) {
      //   const isOldPasswordSame = await bcrypt.compare(
      //     oldPassword,
      //     user.password
      //   );
      //   if (!isOldPasswordSame) {
      //     return sendResponse(
      //       res,
      //       400,
      //       "Previous password is incorrect. Please enter a valid previous password."
      //     );
      //   }
      // }

      const isPasswordSame = await bcrypt.compare(password, user.password);
      if (isPasswordSame) {
        return sendResponse(
          res,
          400,
          "Please use a different password than your current one"
        );
      }
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    if (role) {
      updateFields.role = capitalizeFirstLetter(role);
    }

    if (coverImage) {
      updateFields.coverImage = coverImage;
      updateFields.fileKey = fileKey;
    }

    // Update the user with only the provided fields
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updatedUser) {
      return sendResponse(res, 404, "User not found");
    }

    const userDetails = await getUserWithProfile(updatedUser._id);
    return sendResponse(
      res,
      200,
      "User profile updated successfully",
      userDetails
    );
  } catch (error) {
    return handleingError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return sendResponse(res, 400, "Phone number and Password are required!");
    }

    let user = await User.findOne({ phoneNumber });
    if (!user) {
      return sendResponse(res, 400, "This account does not exist.");
    }

    // Check if the user's email is verified
    // if (!user.emailVerified) {
    //   return sendResponse(res, 400, "Please verify your email first!");
    // }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return sendResponse(res, 400, "Incorrect password.");
    }

    user = await getUserWithProfile(user?._id);

    const token = generateToken(user);

    return sendResponse(res, 200, "Login successful", {
      ...user,
      accessToken: token,
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, error.message);
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return sendResponse(res, 400, "Email or Username is required!");
    }
    if (!password) {
      return sendResponse(res, 400, "Password is required!");
    }

    const user = await User.findOne({
      $or: [{ name: email }, { email }],
    });
    if (!user || user.role !== "Admin") {
      return sendResponse(
        res,
        400,
        !user ? "This account does not exist." : "Only admins can log in."
      );
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return sendResponse(res, 400, "Incorrect password.");
    }

    const userProfile = await getUserWithProfile(user._id);
    const accessToken = generateToken(userProfile);

    return sendResponse(res, 200, "Login successful", {
      ...userProfile,
      accessToken,
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, error.message);
  }
};

const getUpdatedProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    let user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 400, "This account does not exist.");
    }

    user = await getUserWithProfile(user?._id);

    const token = generateToken(user);

    return sendResponse(res, 200, "getting updatedData successful", {
      ...user,
      accessToken: token,
    });
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, error.message);
  }
};

const deleteUserDp = async (req, res) => {
  try {
    const userId = req.params?.userId;
    if (!userId) {
      return sendResponse(res, 400, "User ID is required");
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    // Check if the user has a fileKey before attempting to delete
    if (user.fileKey) {
      try {
        await deleteS3File(user.fileKey);
      } catch (err) {
        console.error("Error deleting file from S3:", err);
        return sendResponse(
          res,
          500,
          "Failed to delete profile picture from storage."
        );
      }
    }

    // Update user profile by removing the cover image and file key
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { coverImage: null, fileKey: null },
      { new: true }
    );

    return sendResponse(
      res,
      200,
      "User profile picture deleted successfully",
      updatedUser
    );
  } catch (error) {
    return handleingError(res, error);
  }
};

const updateDp = async (req, res) => {
  try {
    const userId = req.user._id;
    const { file } = req;

    let user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }
    if (file) {
      user.coverImage = file.location;
    }
    await user.save();

    user = await getUserWithProfile(user?._id);

    return sendResponse(
      res,
      200,
      "User profile pic updated successfully",
      user
    );
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

const getUser = async (req, res) => {
  try {
    const { _id } = req.user;
    let user = await User.findById(_id);
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    user = await getUserWithProfile(user?._id);

    return sendResponse(res, 200, "User Detail getting successfully", user);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const {
      currentPage = 1,
      limit = 10,
      search = "",
      type = "patient",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const query = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ],
    };

    // Pagination and sorting
    const skip = (currentPage - 1) * limit;
    let users;
    let total;
    if (type == "doctor") {
      users = await doctorProfile
        .find(query)
        .sort({ [sort]: order === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit));
      total = await doctorProfile.countDocuments(query);
    } else {
      users = await patientProfile
        .find(query)
        .sort({ [sort]: order === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit));
      total = await patientProfile.countDocuments(query);
    }

    return sendResponse(res, 200, "Users retrieved successfully", users, {
      total,
      page: parseInt(currentPage),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

const getUserWithProfile = async (id) => {
  try {
    console.log(id, "geting User details");
    
    if (!id) throw new Error("User id is required.");

    const user = await User.findOne({ _id: id });
    if (!user) return null;
    console.log(user.profile, "geting User details");
    ({ password, notification, ...withoutSensitiveInfo } = user.toObject());

    console.log(id, "geting dedicated profile");
    const profile =
      user.role == "Doctor"
        ? await doctorProfile.findById(user.profile)
        : user.role == "Pathology" ? await pathologyLabProfile.findById(user.profile)
        : user.role?.toLowerCase() == "nursing" ? await nurseProfile.findById(user.profile.toString())
        : await patientProfile.findById(user.profile);

    console.log(profile, "profile");
    console.log(user.role, "user.role");
    return {
      ...withoutSensitiveInfo,
      profile: profile ? profile.toObject() : null,
    };
  } catch (error) {
    console.error("Error fetching user with profile:", error);
    throw new Error("Failed to fetch user with profile.");
  }
};

const sendOtpToPhoneNumber = async (phoneNumber) => {
  const otp = Math.floor(1000 + Math.random() * 9000);

  const newUserOtp = new UserOtp({
    otp,
    otpExpiry: Date.now() + 10 * 60 * 1000,
    phoneNumber,
  });
  await newUserOtp.save();

  console.log("Otp : ", otp);
  const message = `Your verification code is ${otp}. It is valid for 10 minutes.`;
  await sendSms(phoneNumber, message);
};

module.exports = {
  signUp,
  login,
  adminLogin,
  updateUser,
  updateDp,
  deleteUserDp,
  getUser,
  forgotPassword,
  userEmialVerify,
  getUserWithProfile,
  getUpdatedProfile,
  verifyOtp,
  resetPassword,

  getAllUsers,
};
