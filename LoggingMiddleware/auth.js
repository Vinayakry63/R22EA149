const axios = require("axios");

const getAuthToken = async () => {
    try {
        const response = await axios.post("http://20.244.56.144/evaluation-service/auth", {
            email: "ryvinayak40@gmail.com",
            name: "Vinayak R Yadahalli",
            rollNo: "r22EA149",
            accessCode: "NJMKDW",
            clientID: "41149028-b543-4c8d-8e57-bb8c384022f1",
            clientSecret: "STUyNRuSVPMhdsZKw"
        });

        return response.data.access_token;
    } catch (error) {
        console.error("Error Fetching Token:", error.response ? error.response.data : error.message);
        return null;
    }
};

module.exports = getAuthToken;
