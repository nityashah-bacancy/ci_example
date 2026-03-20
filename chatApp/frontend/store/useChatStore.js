import { create } from 'zustand';
import { axiosInstance } from '../src/lib/axios'
import toast from "react-hot-toast"
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        try {
            set({ isUsersLoading: true });
            const res = await axiosInstance.get("/messages/users");
            // console.log(res);
            set({ users: res?.data?.filteredUser });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        try {
            set({ isMessagesLoading: true });
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    sendMessage: async (messageData) => {
        try {
            const { selectedUser, messages } = get() // ana thi uper je state banaya che e madse
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            console.log(res);
            set({ messages: [...messages, res.data] });
            console.log("5")
        } catch (error) {
            console.log("4");
            console.log(error);
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            if(newMessage.senderId !== selectedUser._id) return; // aa nai lakhyu hoy to message badha ne jase
            set({ messages: [...get().messages, newMessage] })
        })
    },

    unSubscribeFromMessages:() => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser }),

}))