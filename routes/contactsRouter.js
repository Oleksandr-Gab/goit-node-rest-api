import express from "express";
import auditAcces from "../middlewares/auditAcces.js";
import auditToken from "../middlewares/auditToken.js";
import ContactsControllers from "../controllers/contactsControllers.js";

const contactsRouter = express.Router();
const jsonParcer = express.json();

contactsRouter.get("/", ContactsControllers.getAllContacts);

contactsRouter.get("/:id", auditAcces, ContactsControllers.getOneContact);

contactsRouter.delete("/:id", auditAcces, ContactsControllers.deleteContact);

contactsRouter.post(
    "/",
    jsonParcer,
    auditToken,
    ContactsControllers.createContact
);

contactsRouter.patch(
    "/:id/favorite",
    auditAcces,
    jsonParcer,
    ContactsControllers.updateStatusContact
);

contactsRouter.put("/:id", auditAcces, ContactsControllers.updateContact);

export default contactsRouter;
