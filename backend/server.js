const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Quick-Aid');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quick-Aid API is running!' });
});

app.get("/live", (req, res) => {
  res.json({ status: "alive" });
});

app.get("/ready", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;

  if (dbReady) {
    return res.json({ status: "ready" });
  }

  res.status(503).json({ status: "not_ready" });
});

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });
