"use strict";
// *** RUN THE SERVER with auto compilation from TS file to JS with "watch mode"
// TERMINAL 1: tsc -w / TERMINAL 2: nodemon
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
// https://www.npmjs.com/package/cors
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs")); // file system (read, create, uodate, delete, rename files)
const path_1 = __importDefault(require("path")); // provides a way of working with directories and file paths
const users_1 = __importDefault(require("./routes/users"));
const emails_1 = __importDefault(require("./routes/emails"));
const app = express_1.default();
app.use(body_parser_1.json());
dotenv.config();
// saving login infos with morgan
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(__dirname, 'access.log'), 
// flags: "a" means that NEW data will be added
{ flags: 'a' });
app.use(morgan_1.default('combined', { stream: accessLogStream }));
app.use(helmet_1.default()); // middleware that will add security headers
// // options for cors midddleware:
// const corsOptions: cors.CorsOptions = {
//   allowedHeaders: [
//     'Origin',
//     'X-Requested-With',
//     'Content-Type',
//     'Accept',
//     'X-Access-Token',
//     // "Access-Control-Allow-Origin",
//     // "ssid",
//     // Authorization MUST BE ENABLED TO USE AUTHENTICATION:
//     'Access-Control-Allow-Headers',
//     'Content-Type, Authorization',
//   ],
//   credentials: true,
//   methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
//   origin: '*', // DEV MODE
//   //  origin: API_URL, // PRODUCTION MODE
//   preflightContinue: false,
// };
// app.use(cors(corsOptions));
// // app.options("*", cors(options)); // enable pre-flight
app.use(cors_1.default());
app.use('/users', users_1.default);
app.use('/emails', emails_1.default);
// ERROR HANDLER MIDDLEWARE will be fired if ANY ERROR occurs
app.use((err, req, res, next) => {
    res.status(400).json({ message: err.message });
    console.log(err.message);
});
// ENVIROMENT VARIABLES
// DEV MODE with nodemon: nodemon.json file
// PRODUCTION MODE: .env file
// console.log(process.env.MONGO_USER);
// connection string: https://www.mongodb.com/cloud/atlas
const URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-lywhn.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
mongoose_1.default
    .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then((result) => {
    app.listen(process.env.PORT || 8080);
    console.log('API simulator running at port 8080');
})
    .catch((err) => console.log(err));
