const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 5000;

app.use(express.json({ limit: "15mb" })); // Permite que el servidor recibe request de tipo Json.
app.use(express.urlencoded({ extended: true, limit: "15mb" })); // Permite recibir request de tipo "multimedia"

app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },

    credentials: true,

    methods: "POST,GET,PUT,OPTIONS,DELETE",
  })
);

app.get("/places", async (req, res) => {
  // const apiUrl = req.query.apiUrl;

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

app.listen(port, () => {
  console.log("server started on port 5000");
});
