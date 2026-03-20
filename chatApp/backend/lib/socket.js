import { Server } from "socket.io";
import http from "http";

import express from "express";

const app = express();
const server = http.createServer(app); //This allows both HTTP requests (handled by Express) and WebSocket connections (handled by socket.io) to work on the same server.

const io = new Server(server, { // ana thi socket.io ma je Server class che eno instance banse ane uper je server banayu e ama nakhi devanu
    cors: {
        origin: true 
    }
});

export function getReciverSocketId(userId) {
    return userSocketMap[userId];
};

// used to store online users
const userSocketMap = {}; // {userId:socketId}

// 1. io.on("connection", callback)

// Fires when a new client connects to the WebSocket server.
// The callback function receives a socket object, which represents the connected client.
// The socket.id is a unique identifier for each connected client.
// Inside the connection event:

// 2. We can listen for other events using socket.on.
// When a client disconnects, the "disconnect" event fires.


io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    // console.log(userId);
    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // getOnlineUsers aana badle koi pan name apay
    // console.log(Object.keys(userSocketMap));

    socket.on("disconnect", () => { // "disconnect ek event che je disconnect thava par trigger thay"
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export { io, server, app };
