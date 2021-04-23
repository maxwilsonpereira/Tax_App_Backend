"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emails_1 = require("../controllers/emails");
const router = express_1.Router();
// PATH IS: /emails --> app.use("/emails", usersRoutes);
router.post('/', emails_1.sendEmail);
exports.default = router;
