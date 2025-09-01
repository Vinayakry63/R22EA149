// urlShortener.js
const crypto = require("crypto");

const urlDatabase = new Map();

// Generate a random shortcode (6 alphanumeric chars)
const generateShortcode = () => {
    return crypto.randomBytes(3).toString("hex");
};

// Create short URL
const createShortURL = ({ url, validity = 30, shortcode }) => {
    if (!shortcode) {
        shortcode = generateShortcode();
    } else {
        // Ensure shortcode is unique
        if (urlDatabase.has(shortcode)) {
            throw new Error("Shortcode already exists");
        }
    }
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + validity * 60000); // validity in minutes

    urlDatabase.set(shortcode, {
        url,
        shortcode,
        validity,
        createdAt,
        expiresAt,
        clicks: 0,
    });

    return {
        shortLink: `http://localhost:3001/${shortcode}`,
        expiry: expiresAt.toISOString(),
    };
};

module.exports = {
    createShortURL,
    urlDatabase,
};
