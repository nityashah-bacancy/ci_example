import User from "../models/user.model.js";
import Message from '../models/message.model.js'
import cloudinary from "../lib/cloudinary.js";
import { getReciverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        // console.log(loggedInUserId);
        const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        return res.status(200).json({
            success: true,
            filteredUser
        })
    } catch (error) {
        console.log(error);
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        // console.log(userToChatId,myId);
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId }, // find all the messages between me and the other user which has been get by id
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        return res.status(200).json(messages);
    } catch (error) {
        console.log(error);
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            // upload image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        };

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        // todo: realtime functionality goes here => socket.io
        const receiverSocketId = getReciverSocketId(receiverId);
        if (receiverSocketId) { // check if the user is online 
            io.to(receiverSocketId).emit("newMessage", newMessage); // khali emit lakhyu hot to badha users ne message jat but to() ma je user ne mesaage moklavano hase ene j jase
        }

        return res.status(201).json(newMessage);
    } catch (error) {
        console.log(error);
    }
}