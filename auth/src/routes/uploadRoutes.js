const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadCSV, getAllCities } = require("../controllers/UploadController");

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("csvfile"), uploadCSV);
router.get("/cities", getAllCities)

module.exports = router;
