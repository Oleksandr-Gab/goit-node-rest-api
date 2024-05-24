import express from "express";
import {
    getAllContacts,
    getOneContact,
    deleteContact,
    createContact,
    updateStatusContact,
    updateContact,
} from "../controllers/contactsControllers.js";

const contactsRouter = express.Router();
const jsonParcer = express.json();

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", getOneContact);

contactsRouter.delete("/:id", deleteContact);

contactsRouter.post("/", jsonParcer, createContact);

contactsRouter.patch("/:id/favorite", jsonParcer, updateStatusContact);

contactsRouter.put("/:id", updateContact);

export default contactsRouter;
