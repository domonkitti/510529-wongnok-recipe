const express = require('express');
const { authenticate, authorize } = require('./auth');

const rolecheck = express.Router();

// ใช้ the authentication
rolecheck.use(authenticate);

// ระดับขั้นที่ตะเช็ค
rolecheck.use(authorize([1]));

//ตอนนี้มีแค่ระดับเดียว ถ้ามี ระดับอื่นจะสร้างโมดูลเพิ่ม
module.exports = rolecheck;