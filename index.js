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

// CARS

const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  package: String,
  color: String,
  year: String,
  category: String,
  mileage: String,
  price: String,
  filename: String,
  forSell: String,
});

const Car = mongoose.model("Car", carSchema);

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

// Obtener todos los coches
app.get("/cars", async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.log("err::", err);
    res.status(500).json({ message: err.message });
  }
});

// Obtener un coche por ID
app.get("/cars/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      res.status(404).json({ message: "car not found" });
    }
    res.json(car);
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ message: error.message });
  }
});

// Actualizar un coche por ID
app.put("/cars/:id", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      hireDate,
      department,
      phone,
      address,
      isActive,
      forSell,
    } = req.body;
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        hireDate,
        department,
        phone,
        address,
        isActive,
        forSell,
      },
      { new: true }
    );

    console.log("updatedCar en server", updatedCar);

    if (!updatedCar) {
      res.status(404).json({ message: "car not found" });
    }
    res.json(updatedCar);
  } catch (error) {
    console.log("error.message", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Eliminar un coche por ID
app.delete("/cars/:id", async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(deletedCar);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error deleting car" });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
