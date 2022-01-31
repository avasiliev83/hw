const { createLogger, format, transports } = require('winston');
const path = require("path");
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
	return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
	format: combine(
		label({ label: "hw" }),
		timestamp(),
		myFormat
	),
	transports: [new transports.Console(), new transports.File({ filename: path.join(__dirname, "logs", "all.log") })]
});

module.exports = logger;