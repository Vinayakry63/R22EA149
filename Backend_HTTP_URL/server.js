// server.js
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const Log = require("./loggingMiddleware");
const cors = require("cors");

const app = express();
const port = 3001;
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJuaWtoaWxjaGVubmE4QGdtYWlsLmNvbSIsImV4cCI6MTc1NjcwOTY2OSwiaWF0IjoxNzU2NzA4NzY5LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiN2JmMTcxNDItZWVlMC00M2YyLTg2Y2YtN2ViZDAwZTcyYzBhIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibmlraGlsIGMiLCJzdWIiOiJiNjNlNmNkNS03OGI3LTQ5ZGQtYWZlYS0yNDQyYmI2ZmMyOTgifSwiZW1haWwiOiJuaWtoaWxjaGVubmE4QGdtYWlsLmNvbSIsIm5hbWUiOiJuaWtoaWwgYyIsInJvbGxObyI6InIyM2VhODAzIiwiYWNjZXNzQ29kZSI6Ik5KTUtEVyIsImNsaWVudElEIjoiYjYzZTZjZDUtNzhiNy00OWRkLWFmZWEtMjQ0MmJiNmZjMjk4IiwiY2xpZW50U2VjcmV0IjoiU3lWV1pLVVFZTmpBTUVydyJ9.G72FYgi8OpNbxoYH1UETU3us67lJCltTI3meebe_KJQ"; // Replace with your actual token

// Enable CORS middleware before routes
app.use(cors());
app.use(bodyParser.json());

// In-memory URL database
const urlDatabase = new Map();

const generateShortcode = () => crypto.randomBytes(3).toString("hex");

const createShortURL = ({ url, validity = 30, shortcode }) => {
    if (!shortcode) {
        shortcode = generateShortcode();
    } else {
        if (urlDatabase.has(shortcode)) {
            throw new Error("Shortcode already exists");
        }
    }

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + validity * 60000);

    urlDatabase.set(shortcode, {
        url,
        shortcode,
        validity,
        createdAt,
        expiresAt,
        clicks: 0,
    });

    return {
        shortLink: `http://localhost:${port}/${shortcode}`,
        expiry: expiresAt.toISOString(),
    };
};

app.get("/", (req, res) => {
    res.send("URL Shortener Microservice is running");
});

app.post("/shorturls", async (req, res) => {
    try {
        const { url, validity, shortcode } = req.body;

        if (!url || typeof url !== "string") {
            await Log("backend", "error", "handler", "Invalid or missing URL", AUTH_TOKEN);
            return res.status(400).json({ error: "Invalid or missing URL" });
        }

        if (validity !== undefined && (!Number.isInteger(validity) || validity <= 0)) {
            await Log("backend", "error", "handler", "Validity must be a positive integer", AUTH_TOKEN);
            return res.status(400).json({ error: "Validity must be a positive integer" });
        }

        if (shortcode !== undefined && (typeof shortcode !== "string" || shortcode.length === 0)) {
            await Log("backend", "error", "handler", "Shortcode must be a non-empty string", AUTH_TOKEN);
            return res.status(400).json({ error: "Shortcode must be a non-empty string" });
        }

        const result = createShortURL({ url, validity, shortcode });
        await Log("backend", "info", "handler", `Short URL created: ${result.shortLink}`, AUTH_TOKEN);
        res.status(201).json(result);
    } catch (error) {
        if (error.message === "Shortcode already exists") {
            await Log("backend", "fatal", "handler", "Shortcode collision detected", AUTH_TOKEN);
            res.status(409).json({ error: error.message });
        } else {
            await Log("backend", "fatal", "handler", `Internal server error: ${error.message}`, AUTH_TOKEN);
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

app.get("/shorturls/:shortcode", async (req, res) => {
    const { shortcode } = req.params;
    const urlEntry = urlDatabase.get(shortcode);

    if (!urlEntry) {
        await Log("backend", "error", "handler", `Shortcode not found: ${shortcode}`, AUTH_TOKEN);
        return res.status(404).json({ error: "Shortcode not found" });
    }

    await Log("backend", "info", "handler", `Stats retrieved for shortcode: ${shortcode}`, AUTH_TOKEN);

    res.json({
        shortcode: urlEntry.shortcode,
        url: urlEntry.url,
        createdAt: urlEntry.createdAt,
        expiresAt: urlEntry.expiresAt,
        clicks: urlEntry.clicks,
    });
});

app.get("/:shortcode", async (req, res) => {
    const { shortcode } = req.params;
    if (shortcode === "shorturls") {
        return res.status(404).send("Not found");
    }

    const urlEntry = urlDatabase.get(shortcode);

    if (!urlEntry) {
        await Log("backend", "error", "handler", `Redirect attempted for unknown shortcode: ${shortcode}`, AUTH_TOKEN);
        return res.status(404).send("Shortcode not found");
    }

    if (new Date() > urlEntry.expiresAt) {
        await Log("backend", "warn", "handler", `Redirect attempted for expired shortcode: ${shortcode}`, AUTH_TOKEN);
        return res.status(410).send("Shortened URL has expired");
    }

    urlEntry.clicks++;
    await Log("backend", "info", "handler", `Redirected shortcode: ${shortcode}`, AUTH_TOKEN);

    res.redirect(urlEntry.url);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
