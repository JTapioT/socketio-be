import express from "express";
import cors from "cors"
import { createServer } from "http";
import { Server } from "socket.io";

// We are configuring our Express application 
const app = express();

let onlineUsers = []

app.use(cors())
app.get("/online-users", (req, res) => {
    res.send({ onlineUsers })
})

// We are creating an instance of a standard HTTP server based on our express config
const httpServer = createServer(app);

// We are creating a io server based on our HTTP server
const io = new Server(httpServer, { /* options */ });

// We are defining all of our event handlers
io.on("connection", (socket) => {
    console.log(socket.id)

    // We are setting the username for the user
    // This doubles as a "login" event since we dont have an auth system
    socket.on("setUsername", ({ username, room }) => {
        onlineUsers.push({ username: username, socketId: socket.id, room: room })

        socket.join(room)
        console.log(socket.rooms)

        socket.emit("loggedin")
        socket.to(room).emit("newConnection")
    })

    // When we get a message from the frontend we broadcast it to all users in the room
    socket.on("sendmessage", ({ message, room }) => {
        //socket.broadcast.emit("message", message) // this is sending to all users except the sender
        //console.log(room);
        //console.log(message);
        socket.to(room).emit("message", message)
        //socket.broadcast.emit("message", message) 
    })


    /*  socket.on("privatemessage", ({message, room}) => {

        console.log("THE ROOM IS:", room);

        if(!socket.rooms.has(room)) {
            //socket.join(room);
            console.log("Rooms after");
            console.log(socket.rooms);
            console.log(message);
            socket.emit("roomchange", room);
            socket.emit("newConnection");
            socket.to(room).emit("usermessage", message);
        }
    }) */


    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`)
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)
    })
});

// We are starting our HTTP server and NOT our Express app
// Starting app.listen here would initialize and start another instance of a HTTP Server,
// which would be not including our io configuration
httpServer.listen(3030, () => {
    console.log("Listening on port 3030");
});