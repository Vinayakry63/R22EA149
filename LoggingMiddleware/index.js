const axios = require("axios");

const register = async () => {
    try {
        const response = await axios.post("http://20.244.56.144/evaluation-service/register", {
            email: "ryvinayak40@gmail.com",          
            name: "Vinayak R Yadahalli",
            mobileNo: "9019461252",
            githubusername: "vinayak-r-yadahalli", // Replace with your GitHub username
            rollNo: "R22EA149",                  // Replace with your roll number // Use your university email
            accessCode: "NJMKDW"                 // Replace with the access code you received
        });

        console.log("Registration Successful:", response.data);
    } catch (error) {
        console.error("Error Registering:", error.response ? error.response.data : error.message);
    }
};

// Call the function
register();
