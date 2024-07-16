require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 5000;

const url =
  "mongodb+srv://jcrr1985:Tumama4$@cluster0.zi7qsgn.mongodb.net/fullapp";
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  next();
});

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

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

app.get("/clinics", async (req, res) => {
  const apiKey = "AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k";
  const apiUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${nameOfClinicValue}&inputtype=textquery&fields=name,formatted_address,rating,opening_hours,geometry,place_id&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    console.log("response.data", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error al hacer la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
