const express = require(`express`);
const presensiController = require(`../controllers/presensi.controllers`);
const app = express();
app.use(express.json());

app.post("/", presensiController.Presensi);
app.get("/history/:id", presensiController.getPresensiById); // Mendapatkan semua data presensi
app.get("/history", presensiController.findPresensi); // Mendapatkan semua data presensi
app.get("/summary/:iduser", presensiController.Summary); // Ringkasan presensi
app.post("/:id/analysis", presensiController.Analysis); // Analisis presensi

module.exports = app;