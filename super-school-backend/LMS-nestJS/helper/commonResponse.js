"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unAuthentication =
    exports.notFound =
    exports.CustomError =
    exports.paginationResponse =
    exports.customResponse =
    exports.customSuccess =
    exports.success =
    exports.error =
        void 0;
const en_messages_1 = require("../helper/resources/en_messages");
const af_messages_1 = require("../helper/resources/af_messages");
const zu_messages_1 = require("../helper/resources/zu_messages");
const constants_1 = require("./constants");
const getMessage = (languageCode, code, defaultcode) => {
    if (languageCode === "af") {
        return af_messages_1.af[code] ? af_messages_1.af[code] : af_messages_1.af[defaultcode];
    } else if (languageCode === "is") {
        return zu_messages_1.zu[code] ? zu_messages_1.zu[code] : zu_messages_1.zu[defaultcode];
    } else {
        return en_messages_1.en[code] ? en_messages_1.en[code] : en_messages_1.en[defaultcode];
    }
};
const error = (languageCode = constants_1.LANGUAGE_CODE.EN, res, message, statusCode = 400, data = {}) => {
    const resData = {
        statusCode: statusCode,
        error: false,
        message: getMessage(languageCode, message, "DEFAULT"),
        data,
    };
    return res.status(statusCode).json(resData);
};
exports.error = error;

const success = (languageCode = constants_1.LANGUAGE_CODE.EN, res, message, statusCode = 200, data = {}) => {
    const resData = {
        statusCode: statusCode,
        error: false,
        message: getMessage(languageCode, message, "DEFAULT"),
        data,
    };
    return res.status(statusCode).json(resData);
};
exports.success = success;

const customSuccess = (res, response) => {
    return res.status(200).json(response);
};

exports.customSuccess = customSuccess;

exports.customSuccess = customSuccess;
const customResponse = (languageCode = constants_1.LANGUAGE_CODE.EN, res, message, statusCode = 200, data = {}) => {
    const resData = {
        statusCode: statusCode,
        error: true,
        message: getMessage(languageCode, message, "DEFAULT"),
        data,
    };
    return res.status(statusCode).json(resData);
};
exports.customResponse = customResponse;

const paginationResponse = (languageCode = constants_1.LANGUAGE_CODE.EN, res, message, statusCode = 200, data = []) => {
    data.data = data.list;
    delete data.list;
    const resData = {
        statusCode: statusCode,
        error: true,
        message: getMessage(languageCode, message, "DEFAULT"),
        ...data,
    };
    return res.status(statusCode).json(resData);
};
exports.paginationResponse = paginationResponse;

const CustomError = (languageCode = constants_1.LANGUAGE_CODE.EN, res, code = "", statusCode = 400, data = {}, message) => {
    const resData = {
        statusCode: statusCode,
        error: false,
        message: getMessage(languageCode, message, "DEFAULT"),
        data: data,
    };
    return res.status(statusCode).json(resData);
};
exports.CustomError = CustomError;

const notFound = (languageCode = constants_1.LANGUAGE_CODE.EN, res, code, statusCode = 404) => {
    const resData = {
        statusCode: statusCode,
        error: false,
        message: getMessage(languageCode, "", "DEFAULTER") || "Invalid request data",
        data: {},
    };
    return res.status(statusCode).send(resData);
};
exports.notFound = notFound;

const unAuthentication = (languageCode = constants_1.LANGUAGE_CODE.EN, res, message, statusCode = 401, data = {}) => {
    const resData = {
        statusCode: statusCode,
        error: false,
        message: getMessage(languageCode, message, "DEFAULT_AUTH"),
        data,
    };
    return res.status(statusCode).json(resData);
};
exports.unAuthentication = unAuthentication;
