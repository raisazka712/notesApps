import { removeNotes } from "./main.js";

class NotesApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.notes = [];
    this.render();
  }

  connectedCallback() {
    this.shadowRoot
      .querySelector(".add-note")
      .addEventListener("click", () => this.addNote());
  }

  addNote() {
    this.notes.push("");
    this.render();
  }

  updateNoteContent(index, content) {
    this.notes[index] = content;
    this.render();
  }

  deleteNote(index) {
    const noteId = this.notes[index].id; // Pastikan Anda menyimpan ID catatan di array notes
    removeNotes(noteId);
  }

  render() {
    this.shadowRoot.innerHTML = `
            <style>
                ${this.getStyles()}
            </style>
            <div class="notes-container">
                ${this.notes
                  .map(
                    (note, index) => `
                    <div class="note">
                        <input type="text" value="${note}" placeholder="Type a note..." oninput="this.getRootNode().host.updateNoteContent(${index}, this.value)">
                        <button class="delete-note" onclick="this.getRootNode().host.deleteNote(${index})">X</button>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <button class="add-note">Add Note</button>
        `;
  }

  getStyles() {
    return `
            .notes-container {
                width: 300px;
                max-width: 100%;
                margin-top: 20px;
            }

            .note {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                margin: 5px 0;
                background: #f3f3f3;
                border-radius: 5px;
                border: 1px solid #ccc;
            }

            .note input[type="text"] {
                flex: 1;
                border: none;
                background: transparent;
                outline: none;
            }

            .add-note {
                margin-top: 10px;
                padding: 10px 15px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }

            .add-note:hover {
                background: #0056b3;
            }
        `;
  }
}

customElements.define("notes-app", NotesApp);
