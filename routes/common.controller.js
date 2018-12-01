
const Joi = require('joi');

exports.templateRender = async (ctx) => {
    await ctx.render('index', {
        title: 'Hello Koa 2!',
    });
};

exports.stringRender = async (ctx) => {
    ctx.body = 'koa2 string';
};

exports.jsonRender = async (ctx) => {
    let query = Joi.validateThrow(ctx.request.query, {
        username: Joi.string().alphanum().min(4).max(15).required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6)
    });
    ctx.body = {
        title: 'koa2 json'
    };
};
