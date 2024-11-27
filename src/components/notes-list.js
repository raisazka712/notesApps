import { notesData } from "../data/sample-notes.js";

const notesListElement = document.querySelector("#notesList");

function createNoteItemElement({ id, title, body }) {
  const container = document.createElement("div");
  container.setAttribute("data-noteid", id);

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;

  const bodyElement = document.createElement("p");
  bodyElement.innerText = body;

  container.append(titleElement, bodyElement);

  return container;
}

// Render all sample notes
notesData.forEach((note) => {
  const element = createNoteItemElement(note);
  notesListElement.append(element);
});
