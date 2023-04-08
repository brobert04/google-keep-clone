const form = document.querySelector('#add-note-form');
const notesContainer = document.querySelector('#notes-container');


document.querySelector('.note-text').addEventListener('click', ()=> {
  document.getElementById("add_note").hidden = false;
  document.querySelector(".form-container").hidden = true;
});


document.querySelector('.close-btn').addEventListener('click', ()=> {
  document.getElementById("add_note").hidden = true;
  document.querySelector(".form-container").hidden = false;
});

let notes = [];

// FUNCTIILE DE DISPLAY NOTES
fetch('http://localhost:3000/notes')
  .then(response => response.json())
  .then(data => {
    notes = data;
    displayNotes();
  });

  
function displayNotes(notesToShow) {
    notesContainer.innerHTML = '';
    const notesToDisplay = notesToShow || notes;
    notesToDisplay.forEach(note => {
      const noteElement = document.createElement('div');
      noteElement.classList.add('note');
      noteElement.dataset.noteId = note.id;
      noteElement.style.backgroundColor = note.color;
      noteElement.innerHTML = `
        <div class="note-header"></div>
        <div class="title">${note.title}</div>
        <div class="text">${note.content}</div> 
        <div class="note-footer">
          <div class="tooltip">
            <span class="material-icons-outlined hover small-icon edit-note-color-btn">palette</span>
            <span class="tooltip-text">Change Color</span>
          </div>
          <div class="tooltip">
            <span class="material-icons-outlined hover small-icon add-image-btn">image</span>
            <span class="tooltip-text">Add Image</span>
          </div>
          <div class="tooltip">
            <span class="material-icons-outlined hover small-icon  edit-note-btn">edit</span>
            <span class="tooltip-text">Edit content</span>
          </div>
          <div class="tooltip">
            <span class="material-icons-outlined hover zoom-note-btn">zoom_in</span>
            <span class="tooltip-text">zoom</span>
          </div>
          <div class="tooltip">
            <span class="material-icons-outlined hover small-icon delete-note-btn">delete</span>
            <span class="tooltip-text">Delete</span>
          </div>
        </div>
    `;
      if (note.image) {
        const header = noteElement.querySelector('.note-header');
        header.style.height = '180px';
        header.style.width = '100%';
        header.style.display = 'block';
        header.style.borderTopLeftRadius = 'calc(0.25rem - 1px)';
        header.style.borderTopRightRadius = 'calc(0.25rem - 1px)';
        header.style.verticalAlign = 'middle';
        header.style.borderStyle = 'none';
        header.style.overflowClipMargin = 'content-box';
        header.style.overflow = 'clip';
        header.style.borderRadius = '8px 8px 0 0 ';
        header.style.backgroundImage = `url(${note.image})`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center';
        noteElement.style.height = 'auto';
      }else{
        noteElement.style.height = '100%';
      }
      if(note.color === '#000000'){
        noteElement.style.color = 'white';
      }
      notesContainer.appendChild(noteElement);
  });
}


// FUNCTIILE DE ADAUGARE A UNEI NOI NOTE

//functia pentru a converti imaginea in base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

//functia pentru a adauga o nota
async function addNote(){
  const title = document.querySelector('#note-title').value;
  const content = document.querySelector('#note-content').value;
  const color = document.querySelector('#note-color').value;
  const image = document.getElementById('note-image').files[0];

  let imageData = '';
  if (image) {
    imageData = await toBase64(image);
  }
  
  const note = {
    title,
    content,
    color,
    image: imageData
};

  // Add note to JSON server
  fetch('http://localhost:3000/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(note)
  })
    .then(response => response.json())
    .then(data => {
      displayNotes();
      form.reset();
    });
}

document.querySelector('.overlay-submit').addEventListener('click', event => {
  if(document.querySelector('#note-title').value === '' || document.querySelector('#note-content').value === ''){
    event.preventDefault();
  }
else{
  event.preventDefault();
  addNote();
}
});

// FUNCTIILE REGASITE IN CARD
notesContainer.addEventListener('click', async e => {

  //functia pentru a sterge o nota
    if (e.target.classList.contains('delete-note-btn')) {
      const noteId = e.target.closest('.note').dataset.noteId;
      fetch(`http://localhost:3000/notes/${noteId}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(() => {
          notes = notes.filter(note => note.noteId != noteId);
          displayNotes();
        });
    }

    //functia pentru a schimba edita o nota
    if (e.target.classList.contains('edit-note-btn')) {
      const noteId = e.target.closest('.note').dataset.noteId;
      const note = notes.find(note => note.id == noteId);
      const title = prompt('Enter new title:', note.title);
      const content = prompt('Enter new content:', note.content);
      const updatedNote = {
        title,
        content,
        color: note.color,
        image: note.image
      };
      fetch(`http://localhost:3000/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedNote)
      })
        .then(response => response.json())
        .then(data => {
          const index = notes.findIndex(note => note.id == noteId);
          notes[index] = data;
          displayNotes();
        });
    }

    //functia pentru a schimba culoarea unei note
    if (e.target.classList.contains('edit-note-color-btn')) {
      const noteId = e.target.closest('.note').dataset.noteId;
      const note = notes.find(note => note.id == noteId);
      const modal = document.querySelector(".modal");
      const overlay = document.querySelector(".overlay");
      const image = document.querySelector('#image');
      modal.classList.remove("hidden");
      overlay.classList.remove("hidden");
      image.classList.add("hidden");
      document.querySelector('.modal-close-btn').addEventListener('click', () => {
        modal.classList.add("hidden");
        overlay.classList.add("hidden");
        image.classList.remove("hidden");
      });
      document.querySelector('#edit-note-color').value = note.color;
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
          color = document.querySelector('#edit-note-color').value;
          const updatedNote = {
            title: note.title,
            content: note.content,
            color: color,
            image: note.image
          };
      fetch(`http://localhost:3000/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedNote)
      })
        .then(response => response.json())
        .then(data => {
          const index = notes.findIndex(note => note.id == noteId);
          notes[index] = data;

          displayNotes();
        });
        }
      })
    }

    //functia pentru a adauga o imagine unei note
    if (e.target.classList.contains('add-image-btn')){
      const noteId = e.target.closest('.note').dataset.noteId;
      const note = notes.find(note => note.id == noteId);
      const color = document.querySelector('#edit-note-color');
      const modal = document.querySelector(".modal");
      const overlay = document.querySelector(".overlay");
      modal.classList.remove("hidden");
      overlay.classList.remove("hidden");
      color.classList.add("hidden");
      document.querySelector('.modal-close-btn').addEventListener('click', () => {
        modal.classList.add("hidden");
        overlay.classList.add("hidden");
        color.classList.remove("hidden");
      });
      overlay.addEventListener('click', async (event) => {
        if (event.target === overlay) {
          const image = document.querySelector('#add-note-image').files[0]; 
          let imageData = '';
          if(!image){
            console.log('no image')
          }
          else{
           imageData = await toBase64(image);
          }
          const updatedNote = {
            title: note.title,
            content: note.content,
            color: note.color,
            image: imageData
          };
            // Update note on JSON server
        fetch(`http://localhost:3000/notes/${noteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedNote)
        })
          .then(response => response.json())
          .then(data => {
            const index = notes.findIndex(note => note.id == noteId);
            notes[index] = data;
            displayNotes();
          });
      }})
    }

    //functia pentru a da zoom unei note
    if(e.target.classList.contains('zoom-note-btn')){
      const noteId = e.target.closest('.note').dataset.noteId;
      const note = notes.find(note => note.id == noteId);
      const modal = document.querySelector("#modal");
      const overlay = document.querySelector(".overlay");
      modal.classList.remove("hidden");
      overlay.classList.remove("hidden");
      const modalContent = document.querySelector('#content');
      const noteElement = document.createElement('div');
      noteElement.classList.add('note');
      noteElement.dataset.noteId = note.id;
      noteElement.style.width = '100%';
      noteElement.style.backgroundColor = note.color;
      noteElement.innerHTML = `
        <div class="note-header"></div>
        <div class="title">${note.title}</div>
        <div class="text">${note.content}</div> 
        <div class="note-footer">
        </div>
    `;
      if (note.image) {
        const header = noteElement.querySelector('.note-header');
        header.style.height = '280px';
        header.style.width = '100%';
        header.style.display = 'block';
        header.style.borderTopLeftRadius = 'calc(0.25rem - 1px)';
        header.style.borderTopRightRadius = 'calc(0.25rem - 1px)';
        header.style.verticalAlign = 'middle';
        header.style.borderStyle = 'none';
        header.style.overflowClipMargin = 'content-box';
        header.style.overflow = 'clip';
        header.style.borderRadius = '8px 8px 0 0 ';
        header.style.backgroundImage = `url(${note.image})`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center';
        const delBtn = document.createElement('div');
        delBtn.classList.add('tooltip');
        delBtn.style.position = 'absolute';
        delBtn.style.top = '0';
        delBtn.style.right = '0';
        delBtn.innerHTML = `
          <span class="material-icons-outlined hover small-icon delete-note-btn">delete</span>
          <span class="tooltip-text">Delete image</span>
        `
        header.appendChild(delBtn);
        noteElement.style.height = 'auto';
        delBtn.addEventListener('click', (event) => {
          const updatedNote = {
            title: note.title,
            content: note.content,
            color: note.color,
            image: ''
          };
          // Update note on JSON server
        fetch(`http://localhost:3000/notes/${noteId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedNote)

        }).then(response => response.json())
          .then(data => {
            const index = notes.findIndex(note => note.id == noteId);
            notes[index] = data;
            displayNotes();
          });
      })
    }else{
        noteElement.style.height = '100%';
      }
      if(note.color === '#000000'){
        noteElement.style.color = 'white';
      }
      modalContent.appendChild(noteElement);


      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
          modal.classList.add("hidden");
          overlay.classList.add("hidden");
          modalContent.innerHTML = '';
        }
      })

    }
});

// FUNCTIA DE CAUTARE A NOTELOR
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(searchTerm) || note.content.toLowerCase().includes(searchTerm));
  displayNotes(filteredNotes);
});
