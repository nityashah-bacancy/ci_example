import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        // hash password
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!!"
            });
        }
        if (password?.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password length must be 6 characters!!"
            });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exsists"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            // generate JWT token
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(200).json({
                success: true,
                message: "New User Created Successfully",
                newUser
            })
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid user data",
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        };

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            createdAt: user.createdAt,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: "Internal server error",
        });
    }
};


export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: "Internal server error",
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;
        if (!profilePic) {
            return res.status(400).json({
                success: false,
                message: "Profile pic is required"
            })
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic: uploadResponse.secure_url
        }, { new: true });

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.log(error);
    }
}

export const checkAuth = async (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.log(error);
    }
}