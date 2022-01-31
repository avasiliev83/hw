const express = require("express");
const router = express.Router();
const axios = require("axios");
const config = require("../config");
const moment = require("moment");
require("moment/locale/ru");
const logger = require("../logger");


const formatDate = function (ptime) {
	let now = moment();
	let post = moment.unix(ptime);
	let df = now.diff(post,"year");
	if (df>0)
		return post.format("DD MMMM YYYY г.");
	else
		return post.fromNow();
};

const prepareData = function ({resNews, resPhrases}, query) {
	if (resNews) {
		resNews = resNews.map(v=> {
			v.ptime = formatDate(v.ptime); //1643160491-60*60*13);
			return v;
		});
	}
	if (resPhrases) {
		let _query = new Set(query.toLowerCase().split(" "));
		resPhrases = resPhrases.map((v) => {
			return {
				tagged: v.split(" ").map((w) => {
					if (_query.has(w.toLowerCase()))
						return `<b>${w}</b>`;
					else return w;
				}).join(" "),
				notags: v
			};
		});
	}
	return {resNews, resPhrases};
};

const getData =  function () {
	return new Promise((resolve) => {
		let resNews, resPhrases;
		let timeStart = new Date().getTime();
		axios.get(config.phrasesUrl, config.axiosOptions).then(response => {
			resPhrases = response.data;
			logger.info(`Phrases got on ${new Date().getTime() - timeStart} ms`);
		}).catch( (err) => {
			if (err.code !== "ECONNABORTED") {
				logger.error(err.message || err.reason);
			}
		});
		axios.get(config.newsUrl, config.axiosOptions).then(response => {
			resNews = response.data;
			logger.info(`News got on ${new Date().getTime() - timeStart} ms`);
			if (!resPhrases) {
				logger.error(`Phrases were not awaited, because news were faster. Delay: ${new Date().getTime() - timeStart} ms`);
			}
			resolve({resNews, resPhrases});
		}).catch( (err) => {
			if (err.code === "ECONNABORTED") {
				logger.error(`News were not awaited. Delay: ${new Date().getTime() - timeStart}`);
				if (!resPhrases) {
					logger.error(`Phrases were not awaited. Delay: ${new Date().getTime() - timeStart} ms`);
				}
			} else {
				logger.error(err.message || err.reason);
			}
			resolve({resNews, resPhrases});
		});
	});
};

/* GET home page. */
router.get("/", async (req, res, next) => {
	let query = req.query.query || "";
	let {resNews, resPhrases} = prepareData(await getData(), query);
	// res.setHeader("Content-Type", "application/json");
	// res.send(JSON.stringify({resNews, resPhrases}));
	res.render("index", { title: "Homework", query: query, news: resNews, phrases: resPhrases });
});

module.exports = router;
