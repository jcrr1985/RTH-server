require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 5000;

const multer = require("multer");

const { Storage } = require("@google-cloud/storage");
const storage = new Storage();

const url =
  "mongodb+srv://jcrr1985:Tumama4$@cluster0.zi7qsgn.mongodb.net/fullapp";
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

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

const bucketName = "namekusein";

const upload = multer({
  storage: multer.memoryStorage(),
});

// Ruta para subir archivos
app.post("/cars", upload.single("file"), async (req, res) => {
  console.log("url", req.body.url);
  try {
    const {
      make,
      model,
      package,
      color,
      year,
      category,
      mileage,
      price,
      forSell,
    } = req.body;
    const file = req.file;

    // Verificar si el archivo existe
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Subir el archivo a Google Cloud Storage
    const blob = storage.bucket(bucketName).file(file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      console.error("Error al subir archivo a GCP:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;

      // Crear un nuevo auto con la URL del archivo
      const newCar = new Car({
        make,
        model,
        package,
        color,
        year,
        category,
        mileage,
        price,
        filename: file.originalname,
        forSell,
      });

      try {
        const savedCar = await newCar.save();
        res.status(201).json(savedCar);
      } catch (error) {
        console.error("Error al guardar el coche en la base de datos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
      }
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener todos los coches
app.get("/cars", async (req, res) => {
  try {
    const cars = await Car.find();
    console.log("Cars from DB:", cars);
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
