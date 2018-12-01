const Joi = require("joi");
const mongoose = require("mongoose");
const logger = require('./lib/logger');

Joi.validateThrow = function validateThrow(...args) {
  const result = Joi.validate(...args);
  const err = result.error;
  if (err) {
    err.status = 400;
    throw err;
  } else {
    return result.value;
  }
};
// mongodb connet
mongoose.Promise = global.Promise; // Use Native Promise
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true
    })
    .catch(err => {
        logger.error("mongodb connect failed", err);
    });

// mailer send when server start
if (process.env.NODE_ENV === "production") {
  require("./lib/mailer")
    .serverStart()
    .catch(err => {
      logger.error("sendmailer serverStart error ", err);
    });
}
