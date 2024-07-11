const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");

const { Client, Storage, Database } = require("node-appwrite");

const app = express();
const port = process.env.PORT || 5000;

const url =
  "mongodb+srv://jcrr1985:Tumama4$@cluster0.zi7qsgn.mongodb.net/feedbackdb";
app.use(express.json());

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use(cors());

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("Connected to MongoDB"));

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  comment: { type: String, required: true },
});

const Feedback = mongoose.model("feedback", feedbackSchema);

// CARS

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.julio.aora",
  projectId: "664d1f5500235511f8b7",
  databaseId: "664d2112001a9fab9699",
  userCollectionId: "664d23ae001f7c3125bb",
  videoCollectionId: "664d23ca002b95e7ccd2",
  storageId: "664d2709002b146f1594",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = appwriteConfig;

const client = new Client();
client.setEndpoint(endpoint).setProject(projectId);

// Configuración del servicio de almacenamiento
const storage = new Storage(client);
const database = new Database(client);

app.get("/places", async (req, res) => {
  const apiKey = "AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k";
  const apiUrl = `${req.query.apiUrl}&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    console.log("response.data", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error al hacer la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta para subir archivos
app.post("/upload", async (req, res) => {
  try {
    const file = req.file;

    const uploadedFile = await storage.createFile(
      file.buffer,
      file.mimetype,
      ["*"],
      file.originalname
    );

    res.json({ fileId: uploadedFile.$id });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
