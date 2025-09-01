// loggingMiddleware.js
const axios = require("axios");

/**
 * Log function to send logs to the API
 * @param {string} stack - "backend" or "frontend"
 * @param {string} level - "debug", "info", "warn", "error", "fatal"
 * @param {string} pkg - Package name (see docs for allowed values)
 * @param {string} message - Descriptive message about the event
 * @param {string} token - Bearer token for authorization
 */
const Log = async (stack, level, pkg, message, token) => {
    try {
        const response = await axios.post(
            "http://20.244.56.144/evaluation-service/logs",
            {
                stack,
                level,
                package: pkg,
                message,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Log Response:", response.data);
    } catch (error) {
        console.error(
            "Error Logging:",
            error.response ? error.response.data : error.message
        );
    }
};

module.exports = Log;
