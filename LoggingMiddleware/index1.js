const getAuthToken = require("./auth");

(async () => {
    const token = await getAuthToken();
    console.log("Token:", token);
})();
