// loggingMiddleware.js
const axios = require("axios");

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
