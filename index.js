require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
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

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "api.openai.com/v1",
});

app.get("/chat", async (req, res) => {
  try {
    console.log("chat");
    let response = await main();
    res.json({ message: response });
  } catch (error) {
    console.error("Error during /chat request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Cambiado a un modelo compatible
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: "Hola, ¿cómo estás?",
      },
    ],
    temperature: 0.7,
    max_tokens: 128,
  });

  console.log("AI/ML API:\n", completion.choices[0].message.content);

  return completion.choices[0].message.content;
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
