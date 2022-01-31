const createError = require("http-errors");
const express = require("express");
const app = express();
const path = require("path");
const {Liquid} = require("liquidjs");
const engine = new Liquid({
	cache: process.env.NODE_ENV === 'production'
});

const indexRouter = require("./routes/index");


// view engine setup
app.engine("liquid", engine.express());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "liquid");

app.use(express.static(path.join(__dirname, 'public')));
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	let error = req.app.get("env") === "development" ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render("error", {title: "Error page", message: err.message, error: error});
});

module.exports = app;
