/**
 * Created by sanghwan on 2018. 12. 2..
 */
const winston = require('winston');
require('winston-daily-rotate-file');
const moment = require('moment');

const colors = {
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
};
const transports = [
    new (winston.transports.Console)({
        format: winston.format.combine(
            winston.format.printf((info) => {
                let printString = JSON.stringify(info);
                if (info.message === 'res') {
                    let statusCode = info.status;
                    if (statusCode === 200 || statusCode === 304) {
                        statusCode = colors.green + statusCode + colors.reset;
                    } else if (statusCode === 404) {
                        statusCode = colors.yellow + statusCode + colors.reset;
                    } else {
                        statusCode = colors.red + statusCode + colors.reset;
                    }
 
                    printString = `${statusCode} - ${`${colors.cyan}${info.method}${colors.reset}`} - ${`${colors.green}${info.url}${colors.reset}`}  `
                    + `${info.user &&`/ user : ${info.user}`}  `
                    + `${info.ip &&`/ ip : ${info.ip}`}  `
                    + `${info.responsetime &&`/ responsetime : ${info.responsetime}`}  `
                    + `${info.timestamp &&`/ timestamp : ${info.timestamp}`}  `
                    + `${info.message &&`/ ${info.message}`}  `;
                }
                return printString;
            })
        )
    })
];

if (process.env.NODE_ENV === 'production') {
    transports.push(new (winston.transports.DailyRotateFile)({
        filename: `./${process.env.NAME}_%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        dirname: `${__dirname}/../logs`
    }));
}

const logger = winston.createLogger({
    transports
});
const token = require('./token');

let notLogParamList;
if (process.env.NODE_ENV === 'production') {
    notLogParamList = ['pw', 'lat', 'lon', 'si', 'gu', 'dong', 'old-pw', 'new-pw'];
} else {
    notLogParamList = [];
}
function getParamFuc(ctx) {
    let param = {};
    if (ctx.method === 'GET') {
        param = ctx.request.query;
    } else if (ctx.method === 'POST') {
        param = ctx.request.body;
    }
    const copy = JSON.parse(JSON.stringify(param));
    for (let keys = Object.keys(copy), i = 0, end = keys.length; i < end; i++) {
        const key = keys[i];
        if (notLogParamList.indexOf(key) !== -1) {
            delete copy[key];
        }
    }
    return copy;
}

exports.info = function (...msg) {
    logger.info('info', { msg });
};
exports.error = function (...msg) {
    msg = msg.map(item=>{
        if(item instanceof Error){
            return item.message;
        }
        return item;
    })
    logger.error(msg);
};

exports.fileParamlog = function (url, userId, param) {
    logger.info('req', {
        method: 'POST', user: userId, url, param: JSON.stringify(param)
    });
};
const responseLog = function (ctx) {
    logger.info('res', {
        method: ctx.method,
        status: ctx.status,
        user: ctx.state.tokenInfo.id,
        url: ctx.url,
        timestamp: ctx.state.timestamp,
        responsetime: `${new Date() - ctx.state.start} ms`,
        ip: ctx.get('x-forwarded-for'),
        st: ctx.state.reqId
    });
};
exports.responseLog = responseLog;
const requestLog = function (ctx) {
    logger.info('req', {
        method: ctx.method,
        user: ctx.state.tokenInfo.id,
        url: ctx.url,
        timestamp: ctx.state.timestamp,
        param: getParamFuc(ctx),
        st: ctx.state.reqId
    });
};
exports.requestLog = requestLog;

exports.logMiddleWare = async (ctx, next) => {
    ctx.state.tokenInfo = { id: 'none' };
    if (ctx.cookies.get('access_token')) {
        try {
            ctx.state.tokenInfo = await token.decodeToken(ctx.cookies.get('access_token'));
        } catch (e) {}
    }
    const start = new Date();
    ctx.state.start = start;
    ctx.state.reqId = moment(start).format('YYYYMMDDHHmmss');
    ctx.state.timestamp = moment(start).format('YYYY.MM.DD HH:mm:ss');
    requestLog(ctx);
    try {
        await next();
    } catch (err) {
        ctx.status = err.status || 500;
        if (process.env.NODE_ENV !== 'production') {
            ctx.body = err.message;
        }
    }
    responseLog(ctx);
};
