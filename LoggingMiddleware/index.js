const axios = require("axios");

const register = async () => {
    try {
        const response = await axios.post("http://20.244.56.144/evaluation-service/register", {
            email: "ryvinayak40@gmail.com",          
            name: "Vinayak R Yadahalli",
            mobileNo: "9019461252",
            githubusername: "Vinayakry63", 
            rollNo: "R22EA149",                  
            accessCode: "NJMKDW"                 
        });

        console.log("Registration Successful:", response.data);
    } catch (error) {
        console.error("Error Registering:", error.response ? error.response.data : error.message);
    }
};

// Call the function
register();
