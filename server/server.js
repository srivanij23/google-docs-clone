const express = require("express");
const mongoose = require("mongoose");
const Document = require("./Document");
const { Server } = require("socket.io");
const http = require("http");

// Create an Express app and an HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost/googly-docs-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const defaultValue = " ";

// Set up a basic route for the API
app.get("/", (req, res) => {
    res.send("Welcome to the Googly Docs Clone API");
});

// Socket.IO logic
io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("get-document", async (documentId) => {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit("load-document", document.data);

        socket.on("send-changes", (delta) => {
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        socket.on("save-document", async (data) => {
            await Document.findByIdAndUpdate(documentId, { data });
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Helper function to find or create a document
async function findOrCreateDocument(id) {
    if (id == null) return;

    const document = await Document.findById(id);
    if (document) return document;
    return await Document.create({ _id: id, data: defaultValue });
}

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
