import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "node:path";

import "./db.js";

import routes from "./routes/index.js";

const app = express();

app.use("/avatars", express.static(path.resolve("public/avatars")));

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/", routes);

app.use((_, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Server error" } = err;
    res.status(status).json({ message });
});

const PORT = process.env.PORT || 9393;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
