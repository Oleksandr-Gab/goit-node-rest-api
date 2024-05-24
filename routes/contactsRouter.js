import express from "express";
import ContactsControllers from "../controllers/contactsControllers.js";

const contactsRouter = express.Router();
const jsonParcer = express.json();

contactsRouter.get("/", ContactsControllers.getAllContacts);

contactsRouter.get("/:id", ContactsControllers.getOneContact);

contactsRouter.delete("/:id", ContactsControllers.deleteContact);

contactsRouter.post("/", jsonParcer, ContactsControllers.createContact);

contactsRouter.patch(
    "/:id/favorite",
    jsonParcer,
    ContactsControllers.updateStatusContact
);

contactsRouter.put("/:id", jsonParcer, ContactsControllers.updateContact);

export default contactsRouter;
