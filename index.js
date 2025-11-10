import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

app.get("/api/timezones", async (req, res) => {
  try {
    const agent = new https.Agent({ rejectUnauthorized: false });

    const response = await fetch("https://api.apyhub.com/data/dictionary/timezone", {
      agent,
      headers: {
        "Content-Type": "application/json",
        "apy-token": process.env.APYHUB_API_KEY
      }
    });

    const json = await response.json();
    const allZones = json.data || []; // 👈 esta línea faltaba

    // Filtrar solo zonas horarias de EE.UU.
    const usaZones = allZones.filter(
      (zone) => zone.value.startsWith("America/") && zone.key === "US"
    );

    // Simplificar la estructura antes de devolverla
    const formatted = usaZones.map((z) => ({
      country: z.key,
      timezone: z.value,
      abbreviation: z.abbreviation?.join(", "),
      utc_time: z.utc_time
    }));

    res.json({
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error("Error obteniendo zonas horarias:", error);
    res.status(500).json({ error: "No se pudieron obtener las zonas horarias" });
  }
});

// Ruta raíz
app.get("/", (_, res) => {
  res.send("🕒 Timezones Service activo. Usa /api/timezones para obtener zonas de EE.UU.");
});

app.listen(PORT, () => {
  console.log(`🕒 Timezones service corriendo en http://localhost:${PORT}`);
});
