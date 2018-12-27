require("dotenv").config(); // load environment from .env file
require("./init");      // initial process

const Koa = require("koa");
const Router = require("koa-router");

const app = new Koa();
const router = new Router();
const views = require("koa-views");
const bodyparser = require("koa-bodyparser");

const path = require("path");
const api = require("./routes/index");
const logger = require("./lib/logger");
const serve = require("koa-static");


// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"]
  })
);
app.use(serve(path.join(__dirname, "/public")));

app.use(
  views(`${__dirname}/views`, {
    extension: "ejs"
  })
);


// logger
app.use(logger.logMiddleWare);


// routes
router.use("/api", api.routes());
app.use(router.routes()).use(router.allowedMethods());

// app.use(serve(path.resolve(__dirname, '../../client/build/')));

// error-handling
app.on("error", (err, ctx) => {
  ctx.status = err.status || 500;
  ctx.body = err.message;
  logger.error("server error", err);
  logger.responseLog(ctx);
});
app.listen(process.env.PORT, () => {
  logger.info(
    `${process.env.name || "devApiServer"} is listening to port ${process.env.PORT}`
  );
});
