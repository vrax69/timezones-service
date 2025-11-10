import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.get("/api/timezones", async (req, res) => {
  try {
    const response = await fetch("https://api.apyhub.com/data/dictionary/timezone", {
      headers: {
        "Content-Type": "application/json",
        "apy-token": process.env.APYHUB_API_KEY
      }
    });

    const json = await response.json();
    const allZones = json.data || {};

    // Filtrar solo zonas horarias de EE.UU.
    const usaZones = Object.entries(allZones)
      .filter(([key]) => key.startsWith("America/"))
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    res.json({
      count: Object.keys(usaZones).length,
      data: usaZones
    });
  } catch (error) {
    console.error("Error obteniendo zonas horarias:", error);
    res.status(500).json({ error: "No se pudieron obtener las zonas horarias" });
  }
});

app.listen(PORT, () => {
  console.log(`🕒 Timezones service corriendo en http://localhost:${PORT}`);
});
