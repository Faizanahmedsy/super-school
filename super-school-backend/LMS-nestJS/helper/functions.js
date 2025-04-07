"use strict";
const bcrypt = require("bcrypt");
const { Readable } = require("stream");

Object.defineProperty(exports, "__esModule", { value: true });

exports.randomSixDigit = exports.replaceNullToBlankString = void 0;

const randomSixDigit = () => {
    return Math.floor(100000 + Math.random() * 900000);
};
exports.randomSixDigit = randomSixDigit;
const randomFourDigits = () => {
    const randomArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const random1 = randomArray[Math.floor(Math.random() * randomArray.length)];
    const random2 = randomArray[Math.floor(Math.random() * randomArray.length)];
    const random3 = randomArray[Math.floor(Math.random() * randomArray.length)];
    const random4 = randomArray[Math.floor(Math.random() * randomArray.length)];
    const otp = random4 + random3 + random2 + random1;
    return otp;
};
exports.randomFourDigits = randomFourDigits;
const replaceNullToBlankString = async (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] == null) {
            obj[key] = "";
        }
    });
    return obj;
};
exports.replaceNullToBlankString = replaceNullToBlankString;

exports.decryptPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

exports.comparePassword = async (enteredPassword, dbPassword) => {
    return await bcrypt.compare(enteredPassword, dbPassword);
};

/*
 * Convert buffer into Stream
 */
exports.bufferToStream = (buffer) => {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // End the stream
    return stream;
};
