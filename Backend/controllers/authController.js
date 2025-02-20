
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/userModel.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        //refresh token is saved in db along with user

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");

    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if ([username, email, password, confirmPassword].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required!")
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(400, "User with same email or username exist");
    }

    if (username.length < 3) {
        throw new ApiError(400, "Username must be at least 3 characters")
    }

    const user = await User.create({
        username,
        email,
        password,
    });

    //remove password field and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
        throw new ApiError(400, "All fields are required is required");
    }

    const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist!");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password you entered is incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password ")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, {
            user: loggedInUser, refreshToken, accessToken
        },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
        new ApiResponse(200, {}, "User Logged Out!")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unautharized request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is Expired")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user?._id)

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(
        new ApiResponse(
            200,
            {
                accessToken, refreshToken: newRefreshToken
            },
            "Access token refreshed"
        )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User Fetched successfully!")
    )
})

// const getAllNotes = asyncHandler(async (req, res) => {
//     const userId = req.user._id;
//     let { page = 1, limit = 10, sort = "createdAt", order = "desc", search = "", favourite } = req.query;

//     // Convert page and limit to integers
//     page = parseInt(page, 10);
//     limit = parseInt(limit, 10);

//     // Build the query object
//     const query = {
//         user: userId, // Fetch only the notes of the authenticated user
//         title: { $regex: search, $options: "i" }, // Case-insensitive search on title
//     };

//     // Filter by favourite if specified
//     if (favourite !== undefined) { 
//         query.favourite = favourite === "true";
//     }

//     const totalNotes = await Note.countDocuments(query);
//     const notes = await Note.find(query)
//         .sort({ [sort]: order === "desc" ? -1 : 1 })
//         .skip((page - 1) * limit)
//         .limit(limit);

//     if (notes.length === 0) {
//         return res.status(404).json(new ApiResponse(404, [], "No notes found"));
//     }

//     res.status(200).json(
//         new ApiResponse(200, {
//             totalNotes,
//             currentPage: page,
//             totalPages: Math.ceil(totalNotes / limit),
//             notes,
//         }, "Notes fetched successfully")
//     );
// })


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser
}