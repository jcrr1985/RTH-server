require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cohere = require("cohere-ai");

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

const COHERE_API_KEY = process.env.COHERE_API_KEY;
cohere.init(COHERE_API_KEY);

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
  const nameOfClinicValue = req.query.name;
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

app.post("/api/getDiagnosis", async (req, res) => {
  const { symptoms } = req.body;

  const prompt = `The patient is experiencing the following symptoms: ${symptoms}. Please provide multiple possible diagnoses.`;

  try {
    const response = await cohere.generate({
      model: "command-xlarge-nightly",
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.5,
    });

    const diagnosis = response.body.generations[0].text.trim();

    res.json({ diagnosis });
  } catch (error) {
    console.error("Error during Cohere API call:", error);
    res.status(500).json({ error: "Error fetching diagnosis from Cohere API" });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
