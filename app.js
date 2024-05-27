import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import "./db.js";

import contactsRouter from "./routes/contactsRouter.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/contacts", contactsRouter);

app.use((_, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Server error" } = err;
    res.status(status).json("Server error");
});


const PORT = process.env.PORT || 9595;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});