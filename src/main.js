import Swal from "sweetalert2";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Apply parallax effect to any element with a data-speed attribute
gsap.to("[data-speed]", {
  y: (i, el) =>
    (1 - parseFloat(el.getAttribute("data-speed"))) *
    ScrollTrigger.maxScroll(window),
  ease: "none",
  scrollTrigger: {
    start: 0,
    end: "max",
    invalidateOnRefresh: true,
    scrub: 0,
  },
});

// Animate boxes inside box-container
gsap.fromTo(
  ".box",
  {
    y: 50,
    opacity: 0,
  },
  {
    y: 0,
    opacity: 1,
    stagger: 0.2,
    duration: 1,
    ease: "power2.out",
  },
);

// Add a floating animation for boxes
gsap.to(".box", {
  y: -20,
  repeat: -1,
  yoyo: true,
  duration: 2,
  ease: "sine.inOut",
});

const baseUrl = "https://notes-api.dicoding.dev/v2";

// Menampilkan indikator loading
const showLoading = () => {
  const loader = document.createElement("div");
  loader.className = "loading-indicator";
  loader.textContent = "Loading...";
  document.body.appendChild(loader);
};

// Menghilangkan indikator loading
const hideLoading = () => {
  const loader = document.querySelector(".loading-indicator");
  if (loader) loader.remove();
};

const showResponseMessage = (
  message = "Check your internet connection",
  isError = false,
) => {
  Swal.fire({
    icon: isError ? "error" : "info",
    title: isError ? "Error" : "Info",
    text: message,
  });
};

// Menampilkan all notes - getNotes
const getNotes = async () => {
  showLoading();
  try {
    const response = await fetch(`${baseUrl}/notes`, {
      method: "GET",
      headers: { Authorization: "Bearer your-access-token" },
    });
    const result = await response.json();
    if (response.ok) {
      addNoteToActive;
      renderAllNotes(result.data);
    } else {
      showResponseMessage(result.message);
    }
  } catch (error) {
    showResponseMessage(error.message);
  } finally {
    hideLoading();
  }
};

// Get archived notes
const getArchivedNotes = async () => {
  showLoading();
  try {
    const response = await fetch(`${baseUrl}/notes/archived`, {
      method: "GET",
      headers: { Authorization: "Bearer your-access-token" },
    });
    const result = await response.json();
    if (response.ok) {
      renderAllArchivedNotes(result.data);
    } else {
      showResponseMessage(result.message);
    }
  } catch (error) {
    showResponseMessage(error.message);
  } finally {
    hideLoading();
  }
};

// insertNotes (add)
const insertNotes = async (note) => {
  showLoading();
  try {
    const response = await fetch(`${baseUrl}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer your-access-token",
      },
      body: JSON.stringify(note),
    });
    const result = await response.json();
    if (response.ok) {
      getNotes(); // Refresh notes list

      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Notes berhasil ditambahkan!",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      showResponseMessage(result.message, true);
    }
  } catch (error) {
    showResponseMessage(error.message, true);
  } finally {
    hideLoading();
  }
};

// removeNotes

const removeNotes = async (noteId) => {
  const swalWithBootstrapButtons = Swal.mixin({
    position: "top-center",
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        showLoading();
        try {
          const response = await fetch(`${baseUrl}/notes/${noteId}`, {
            method: "DELETE",
            headers: {
              Authorization: "Bearer your-access-token",
            },
          });
          const result = await response.json();
          if (response.ok) {
            const noteElement = document.querySelector(`#note-${noteId}`);
            if (noteElement) noteElement.remove();
            getNotes(); // Refresh notes list (both active and archived)
            getArchivedNotes();

            swalWithBootstrapButtons.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success",
            });
          } else {
            showResponseMessage(result.message, true);
          }
        } catch (error) {
          showResponseMessage(error.message, true);
        } finally {
          hideLoading();
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your imaginary file is safe :)",
          icon: "error",
        });
      }
    });
};

// Archive note
const archiveNote = async (noteId) => {
  showLoading();
  try {
    const response = await fetch(`${baseUrl}/notes/${noteId}/archive`, {
      method: "POST",
      headers: { Authorization: "Bearer your-access-token" },
    });
    const result = await response.json();
    if (response.ok) {
      getNotes(); // Refresh active notes list
      showResponseMessage("Note archived successfully!");
    } else {
      showResponseMessage(result.message);
    }
  } catch (error) {
    showResponseMessage(error.message);
  } finally {
    hideLoading();
  }
};

// Unarchive note
const unarchiveNote = async (noteId) => {
  showLoading();
  try {
    const response = await fetch(`${baseUrl}/notes/${noteId}/unarchive`, {
      method: "POST",
      headers: { Authorization: "Bearer your-access-token" },
    });
    const result = await response.json();
    // console.log('Response result:', result);
    // console.log('Unarchived note data:', result.data);
    if (response.ok) {
      // Optimistic UI update: Move the note element to active notes
      const archivedNoteElement = document.querySelector(`#note-${noteId}`);
      if (archivedNoteElement) {
        const listNotesElement = document.querySelector("#notesList");
        archivedNoteElement.classList.remove("archived-note"); // Optional styling
        listNotesElement.insertAdjacentHTML(
          "beforeend",
          archivedNoteElement.outerHTML,
        );
        archivedNoteElement.remove(); // Remove from archived list
      }
      getNotes();
      getArchivedNotes(); // Refresh archived notes list
      showResponseMessage("Note unarchived successfully!");
    } else {
      showResponseMessage(result.message || "Failed to unarchive note.");
    }
  } catch (error) {
    showResponseMessage(error.message);
  } finally {
    hideLoading();
  }
};

const addNoteToActive = (note) => {
  const listBookElement = document.querySelector("#notesList");
  const existingNoteElement = document.querySelector(`#note-${note.id}`);
  if (existingNoteElement) {
    existingNoteElement.remove();
  }
  const noteCardHTML = `
            <div class="note-cards" id="note-${note.id}">
                <h2>${note.title}</h2>
                <p>${note.body}</p>
                <small>Created At: ${new Date(note.createdAt).toLocaleString()}</small>
                 <div class="note-buttons">
                    <button class="btn-archive" id="${note.id}">Archive</button>
                    <button class="btn-delete" id="${note.id}">Delete</button>
                </div>
            </div>
        `;
  listBookElement.insertAdjacentHTML("beforeend", noteCardHTML);

  // Tambahkan event listener untuk tombol baru
  const archiveButton = document.querySelector(`#note-${note.id} .btn-archive`);
  archiveButton.addEventListener("click", () => archiveNote(note.id));

  const deleteButton = document.querySelector(`#note-${note.id} .btn-delete`);
  deleteButton.addEventListener("click", () => removeNotes(note.id));
};

// Render active notes
const renderAllNotes = (notes) => {
  const listBookElement = document.querySelector("#notesList");
  listBookElement.innerHTML = "";
  notes.forEach((note) => {
    listBookElement.innerHTML += `
                <div class="note-cards">
                    <h2>${note.title}</h2>
                    <p>${note.body}</p>
                    <small>Created At: ${new Date(note.createdAt).toLocaleString()}</small>
                    <div class="note-buttons">
                        <button class="btn-archive" id="${note.id}">Archive</button>
                        <button class="btn-delete" id="${note.id}">Delete</button>
                    </div>
                </div>
            `;
  });

  document.querySelectorAll(".btn-archive").forEach((button) => {
    button.addEventListener("click", (event) => {
      const noteId = event.currentTarget.id;
      if (!noteId) {
        console.error("Button ID is missing:", event.currentTarget); // Debugging
        return;
      }
      archiveNote(noteId);
    });
  });

  document.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", (event) => {
      const noteId = event.currentTarget.id;
      removeNotes(noteId);
    });
  });
};

// Render archived notes
const renderAllArchivedNotes = (notes) => {
  const archivedNotesElement = document.querySelector("#archivedNotesList");
  archivedNotesElement.innerHTML = "";
  notes.forEach((note) => {
    archivedNotesElement.innerHTML += `
                <div class="note-cards" id="note-${note.id}">
                    <h2>${note.title}</h2>
                    <p>${note.body}</p>
                    <small>Created At: ${new Date(note.createdAt).toLocaleString()}</small>
                    <div class="note-buttons">
                        <button class="btn-unarchive" id="${note.id}">Unarchive</button>
                        <button class="btn-delete" id="${note.id}">Delete</button>
                    </div>
                </div>
            `;
  });

  // Add event listeners for unarchive buttons
  document.querySelectorAll(".btn-unarchive").forEach((button) => {
    button.addEventListener("click", (event) => {
      const noteId = event.target.id;
      unarchiveNote(noteId);
    });
  });

  // Add event listeners for delete buttons
  document.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", (event) => {
      const noteId = event.target.id;
      removeNotes(noteId);
    });
  });
};

/*
        Event Listeners
    */

document.addEventListener("DOMContentLoaded", () => {
  const activeNotesSection = document.getElementById("activeNotesSection");
  const archivedNotesSection = document.getElementById("archivedNotesSection");

  const activeNotesButton = document.getElementById("activeNotesButton");
  const archivedNotesButton = document.getElementById("archivedNotesButton");

  document.getElementById("activeNotesButton").addEventListener("click", () => {
    document.getElementById("activeNotesSection").style.display = "block";
    document.getElementById("archivedNotesSection").style.display = "none";
    getNotes();
  });

  document
    .getElementById("archivedNotesButton")
    .addEventListener("click", () => {
      document.getElementById("archivedNotesSection").style.display = "block";
      document.getElementById("activeNotesSection").style.display = "none";
      getArchivedNotes();
    });

  // Event listeners for navigation buttons
  document.querySelectorAll(".btn-unarchive").forEach((button) => {
    button.addEventListener("click", (event) => {
      const noteId = event.target.id;
      unarchiveNote(noteId);
    });
  });

  getNotes(); // Fetch and display active notes on load
});

export { getNotes, insertNotes, removeNotes };
