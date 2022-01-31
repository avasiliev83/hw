require("dotenv").config();

module.exports = {
	port: process.env.PORT || 3000,
	axiosOptions: {
		method: "get",
		baseURL: "http://slowpoke.desigens.com",
		responseType: "json",
		timeout: 6000,
	},
	newsUrl: "/json/1/7000",
	phrasesUrl: "/json/2/3000",
};