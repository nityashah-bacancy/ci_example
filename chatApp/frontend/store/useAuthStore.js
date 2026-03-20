import { create } from "zustand";
import { axiosInstance } from '../src/lib/axios.js'
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_SOCKET_URL;
export const useAuthStore = create((set, get) => ({ //set is a function provided by Zustand to update the state.
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,


    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log(error);
            set({ authUser: null });
        }
        finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        try {
            set({ isSigningUp: true });
            const res = await axiosInstance.post("/auth/signup", data);
            // set({ authUser: res.data });
            toast.success("Account created successfully");

            // get().connectSocket(); // aa off rakhyu che beacuse ena pramane jevu signup kare evu login thay pan me evu nathi rakhyu

            return { success: true }; // Add this line to indicate a successful signup


        } catch (error) {
            toast.error(error.response.data.message);

            return { success: false }; // Add this line to handle failure
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        try {
            set({ isLoggingIn: true });
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in Successfully");

            // implement socket after login 
            get().connectSocket(); // ana thi connectSokcet vadu function call thase
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            const res = await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async (data) => {
        try {
            set({ isUpdatingProfile: true });
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully")
        } catch (error) {
            toast.error(error.response.data.message);
            console.log(error);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return; //  return if the user is already connected or is not authenticated
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id // aa userId server pase jase ane ema aapde socket.handsake.query ma thi aane extract karie che
            },
        }); //  Think of io(BASE_URL) as opening a new WebSocket connection with the server.
        socket.connect();
        set({ socket: socket });
        //What does socket.connect() do? basically used to listen the events
        // Explicitly initiates the connection to the server.
        // In most cases, io(BASE_URL) automatically connects to the server.
        // However, if the socket was previously disconnected, socket.connect() reconnects it.

        socket.on("getOnlineUsers", (userIds) => { // ahiya user Id madse beacuse backend ma aapde userId mokliye che
            set({ onlineUsers: userIds });
        }) // backend thi frontend ma moklta time e io.emit ma getOnlineUsers lakhyu tu etle e same name j hovu joie

    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },

}));
