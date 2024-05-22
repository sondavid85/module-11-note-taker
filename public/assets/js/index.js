document.addEventListener('DOMContentLoaded', () => {
  setNoteListeners();
  setNewNoteListener();
  setDeleteClickListener();
  setClearFormListener();
  setInputListeners();
  setSaveClickListener();
});

function setSaveClickListener() {
  document.getElementById('save-note-button').addEventListener('click', async () => {
      let title = document.getElementById('selected-note-title').value;
      let text = document.getElementById('selected-note-text').value;
      let postObj = { title, text };

      try {
          const response = await fetch('/savenote', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(postObj)
          });

          if (response.ok) {
              const result = await response.json();
              if (!result.wasExistingNote) {
                  appendSavedNote(postObj);
                  clearForm();
                  setButtonVisibility();
              }
          } else {
              console.error('Error saving note:', await response.text());
          }
      } catch (error) {
          console.error('Error saving note:', error);
      }
  });
}

function setClearFormListener() {
  document.getElementById('clear-form-button').addEventListener('click', () => {
    clearForm();
  })
}

function appendSavedNote(note) {
  let $listGroupUl = document.getElementById('list-group');
  let currentNoteCount = document.querySelectorAll('#list-group > li').length;

  let $listGroupLi = document.createElement('li');
  $listGroupLi.setAttribute('class', 'list-group-item');
  $listGroupLi.setAttribute('id', `list-item-${currentNoteCount}`);
  $listGroupLi.setAttribute('data-id', `${currentNoteCount}`);

  let $h1 = document.createElement('h1');
  $h1.setAttribute('class', 'note-title');
  $h1.innerText = note.title.length > 25 ? note.title.substring(0, 25) + "..." : note.title;

  let $img = document.createElement('img');
  $img.src = 'assets/svg/trash.svg';
  $img.setAttribute('class', 'delete-note-button');
  $img.setAttribute('title', 'trash-icon');
  $img.setAttribute('data-id', `${currentNoteCount}`);
  $img.addEventListener('click', () => {
    event.stopPropagation();
    let id = currentNoteCount;
    let shouldContinue = confirm('Are you sure you would like to delete this note?');
    if (shouldContinue) {
      handleDeleteNoteClick(id);
    }
  })

  $listGroupLi.addEventListener('click', () => {
    handleNoteClick(currentNoteCount);
  });

  $listGroupLi.appendChild($h1);
  $listGroupLi.appendChild($img);
  $listGroupUl.appendChild($listGroupLi);
}

function clearForm() {
  document.getElementById('selected-note-title').value = '';
  document.getElementById('selected-note-text').value = '';

  document.getElementById('save-note-button').style.display = 'none';
  document.getElementById('new-note-button').style.display = 'none';
  document.getElementById('clear-form-button').style.display = 'none';
}

function setInputListeners(){
  let $title = document.getElementById('selected-note-title');
  let $content = document.getElementById('selected-note-text');

  $title.addEventListener('input', setButtonVisibility);
  $content.addEventListener('input', setButtonVisibility);
}

function setButtonVisibility(){
  let titleText = document.getElementById('selected-note-title').value;
  let contentText = document.getElementById('selected-note-text').value;

  if (!!titleText || !!contentText) {
    document.getElementById('clear-form-button').style.display = 'inline';
  }
  if (!!titleText && !!contentText) {
    document.getElementById('save-note-button').style.display = 'inline';
    document.getElementById('new-note-button').style.display = 'none';
  }
  if (!!!titleText && !!!contentText) {
    document.getElementById('save-note-button').style.display = 'none';
    document.getElementById('new-note-button').style.display = 'none';
    document.getElementById('clear-form-button').style.display = 'none';
  }
}

function setDeleteClickListener(){
  let deleteBtns = document.getElementsByClassName('delete-note-button');
  Array.from(deleteBtns).forEach(btn => {
    btn.addEventListener('click', () => {
      event.stopPropagation();
      let id = btn.getAttribute('data-id');
      let shouldContinue = confirm('Are you sure you would like to delete this note?');
      if (shouldContinue) {
        handleDeleteNoteClick(id);
      }
    })
  })
}

function setNewNoteListener(){
  document.getElementById('new-note-button').addEventListener('click', () => {
    deselectAll();
    document.getElementById('new-note-button').style.display = 'none';
    document.getElementById('save-note-button').style.display = 'none';
    document.getElementById('clear-form-button').style.display = 'none';
    document.getElementById('selected-note-title').value = '';
    document.getElementById('selected-note-text').value = '';
  });
}

function setNoteListeners(){
  let listItems = document.getElementsByClassName('list-group-item');

  Array.from(listItems).forEach(item => {
    item.addEventListener('click', () => {
      let id = item.getAttribute('data-id');
      handleNoteClick(id);
    })
  })
}

function deselectAll(){
  let currentSelected = document.getElementsByClassName('selected-list-item');
  Array.from(currentSelected).forEach(item => {
    item.classList.remove('selected-list-item');
  })
}

function handleNoteClick(index){
  fetch(`/note/${index}`)
  .then(response => response.json())
  .then(note => {
    setSelectedNote(note, index);
  })
  .catch(error => {
      console.error('Error fetching note:', error);
  });

  window.scrollTo({top: 0, behavior: 'smooth'});
}

function setNewIds(deletedIndex) {
  let currentNotes = document.getElementsByClassName('list-group-item');
  Array.from(currentNotes).forEach((note, index) => {
    let dataID = note.dataset.id;
    if (dataID > deletedIndex) {
      note.setAttribute('id', `list-item-${dataID - 1}`);
      note.setAttribute('data-id', dataID - 1);
    }
  });

  let currentDeleteButtons = document.getElementsByClassName('delete-note-button');
  Array.from(currentDeleteButtons).forEach((button, index) => {
    let dataID = button.dataset.id;
    if (dataID > deletedIndex) {
      button.setAttribute('data-id', dataID - 1);
    }
  });

  setNoteListeners();
  setDeleteClickListener();
}

function handleDeleteNoteClick(index){
  fetch(`/note/${index}`, {method: 'DELETE'})
    .then(response => {
      if (response.ok) {
        let $delete = document.getElementById(`list-item-${index}`);
        $delete.remove();
        setNewIds(index);
        clearForm();
      }
      else {
        console.error('Error fetching note:', error);
      }
      return response.json();
    })
    .catch(error => {
      console.error('Error fetching note:', error);
    });
}

function setSelectedNote(note, index){
  deselectAll();
  
  document.getElementById('new-note-button').style.display = 'inline';
  document.getElementById(`list-item-${index}`).classList.add('selected-list-item');
  document.getElementById('selected-note-title').value = note.title;
  document.getElementById('selected-note-text').value = note.text;
}