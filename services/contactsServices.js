import * as fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";

const contactsPath = path.resolve("db", "contacts.json");

async function listContacts() {
    const data = await fs.readFile(contactsPath, { encoding: "utf-8" });
    return JSON.parse(data);
}

async function getContactById(id) {
    const contacts = await listContacts();
    const contact = contacts.find((item) => item.id === id);
    return contact || null;
}

async function removeContact(id) {
    const contacts = await listContacts();
    const index = contacts.findIndex((item) => item.id === id);
    if (index === -1) {
        return null;
    }

    const removedContact = contacts[index];
    const newContacts = [
        ...contacts.slice(0, index),
        ...contacts.slice(index + 1),
    ];
    await fs.writeFile(contactsPath, JSON.stringify(newContacts, undefined, 2));

    return removedContact;
}

async function addContact({ name, email, phone }) {
    const contacts = await listContacts();
    const newContact = { id: nanoid(), ...{ name, email, phone } };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));

    return newContact;
}

async function updateContact(id, { name, email, phone }) {
    const contacts = await listContacts();
    const index = contacts.findIndex((item) => item.id === id);
    if (index === -1) {
        return null;
    }

    contacts[index] = { id, ...{ name, email, phone } };
    await fs.writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));

    return contacts[index];
}

export default {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact,
};
