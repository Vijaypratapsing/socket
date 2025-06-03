import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";

const io = new Server({
  cors: {
    //origin: ""http://localhost:5173""
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  if (!onlineUser.find((user) => user.userId === userId)) {
    onlineUser.push({ userId, socketId });
    console.log("User added:", userId);
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
  console.log("User removed. Current online users:", onlineUser);
};

const getUser = (userId) => {
  return onlineUser.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
      console.log(`Message sent to user ${receiverId}`);
    } else {
      console.log(`User with ID ${receiverId} is not online`);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("A user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
io.listen(PORT);
console.log(`Socket.IO server is running on port ${PORT}`);
