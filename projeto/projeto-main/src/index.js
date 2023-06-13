const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const http = require('http')
const fs = require('fs')
const app = express();

app.use(bodyParser.json());


//Chamadas CORS
app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization"
  );
  app.use(cors());
  next();
});

app.use("", require("./routes/message.routes"))

http.createServer(app).listen(process.env.PORT, function () {
  console.log("Express server listening on port " + process.env.PORT);
});
