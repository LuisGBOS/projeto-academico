const express = require("express");
const router = express.Router();
const {
  send,
  trainer,
  //createFineTune,
  listFineTunes,
  deleteFineTune,
  listFineTuneEvents,
  //uploadFile
} = require("../controllers/messageControllers");

router.post("/message", send);
router.post("/trainer", trainer)
//router.post("/createFineTune", createFineTune)
//router.post("/uploadFile", uploadFile)
router.delete("/deleteFineTune", deleteFineTune)
router.get("/listFineTunes", listFineTunes)
router.get("/listFineTuneEvents", listFineTuneEvents)

module.exports = router;
