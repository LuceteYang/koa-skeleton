# koa-skeleton

## Basic Feature
- Use mongodb in Koa2: [mongoose](https://mongoosejs.com)
- Log Service: [winston](https://github.com/winstonjs/winston)
- Params Validation: [Joi](https://github.com/hapijs/joi)
- Template Engine: [ejs](https://github.com/mde/ejs)
- Mailer Service: [nodemailer](https://nodemailer.com)
- Authenticate User: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)



## Getting Started

```zsh
$ mkdir your-project-name
$ git clone https://github.com/LuceteYang/koa-skeleton.git your-project-name
$ cd your-project-name
$ rm -rf .git && git init
$ cp .env.copy .env
```

```zsh
$ npm install
$ npm start
```

### init
`Joi.validateThrow` If the variable validation passes, the data object is returned; if it fails, a user-level error occurs. 
`Mongo` Db connect requests.
`Mailer` send when server start
```
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
```
### logger

- request log

method user url timestamp param timestamp st message


- response log

method status user url timestamp responsetime ip param st level message


![log_sample](./public/images/log_sample.png)





