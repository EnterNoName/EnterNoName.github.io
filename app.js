// Shift checking
let checkboxes = document.querySelectorAll('.item input[type="checkbox"]'),
    checked = document.querySelectorAll('.item input[type="checkbox"]:checked'),
    checkedIndex,
    lastChecked;

function handleChecking(e) {
  if(this.checked && e.shiftKey) {
  let between = false;
    checkboxes.forEach(checkbox => {
      if(checkbox == this || checkbox == lastChecked) between = !between;
      if(between) checkbox.checked = true;
    });
  }
  
  updateValues()
  
  lastChecked = this;
}

checkboxes.forEach(checkbox => checkbox.addEventListener('click', handleChecking));



// Create new note
const createNoteBtn = document.querySelector('#add-note');
const notesList = document.querySelector('.notes');
const noteInput = document.querySelector('#note-text');
// Note creation function
function createNote() {
  if(noteInput.value == '') return;
  
  let newNote = document.createElement('div');
  newNote.classList.add('item');
  newNote.innerHTML =
    `<input type="checkbox">
     <p>${noteInput.value}</p>`
  notesList.appendChild(newNote);
  noteInput.value = '';
  
  updateValues();
}
// Create note triggers
createNoteBtn.addEventListener('click', createNote);
noteInput.addEventListener('keydown', e => {
  if(e.key == 'Enter') createNote();
});



// Delete note
const deleteNoteBtn = document.querySelector('#delete-note');

function deleteNotes() {
  checkboxes.forEach(checkbox => {
    if(checkbox.checked) {
      checkbox.parentNode.remove();
    }
  });
  updateValues();
}

deleteNoteBtn.addEventListener('click', deleteNotes);



// Value updates
function updateValues() {
  checkboxes = document.querySelectorAll('.item input[type="checkbox"]');
  checkboxes.forEach(checkbox => checkbox.addEventListener('click', handleChecking));
  checked = document.querySelectorAll('.item input[type="checkbox"]:checked');
  if(checked.length > 0) {
    deleteNoteBtn.style.display = 'block';
  } else {
    deleteNoteBtn.style.display = 'none';
  }
  
  let tempValue = '';
  checkboxes.forEach(checkbox => {
    if(checkbox.checked) {
      for(let i = 0;i < notesList.childNodes.length;i++) {
        if(notesList.childNodes[i].firstElementChild == checkbox) tempValue += i;
      }
    }
  });
  checkedIndex = tempValue;
  storageSave();
}
//checkbox.parentElement


// Color selection
const colorPick = document.querySelector('.footer-item input[type="color"]');
colorPick.addEventListener('change', changeColor);
// Color convertion HEX to HSL
function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}
// Color changing fuction
function changeColor() {
  let [hue, sat, light] = [...hexToHSL(this.value).split(' ')];
  document.documentElement.style.setProperty(`--color`, `${hue}, ${sat}`);
  document.documentElement.style.setProperty(`--l`, `${light}`);
  updateValues();
}



// Erase the value of the input field
const clearBtn = document.querySelector('#erase-field');

clearBtn.addEventListener('click', () => noteInput.value = '');



// Speech recongition note creation
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en_US';

let speechOn = false;
const speechBtn = document.querySelector('#speech');

speechBtn.addEventListener('click', () => {
  if(!speechOn) {
    let speechNote = document.createElement('div');
    speechNote.classList.add('item', 'speech-to-text');
    speechNote.innerHTML =
      `<input type="checkbox">
      <p style="color: #808080">Talk...</p>`
    notesList.appendChild(speechNote);
    speechNote.scrollIntoView({block: 'center', behavior: 'smooth'});

    speechOn = !speechOn;
    recognition.start();
  } else {
    let speechNote = document.querySelector('.speech-to-text');

    if(speechNote.lastChild.textContent == "Talk...") {speechNote.remove()}
    else {speechNote.classList.remove('speech-to-text')}

    speechOn = !speechOn;
    recognition.stop();
    updateValues();
  }
});

recognition.addEventListener('result', e => {
  const text = Array.from(e.results)
    .map(result => result[0].transcript)
    .join('');
  
  let speechNote = document.querySelector('.speech-to-text');
  speechNote.innerHTML =
    `<input type="checkbox">
    <p>${text}</p>`;
});



// Speech recognition language selection
const langSwitch = document.querySelector('.footer-item select');
langSwitch.addEventListener('change', function() {
  recognition.lang = this.value;
  updateValues();
});



// LocalStorage make a save
function storageSave() {
  localStorage.setItem('notes', notesList.innerHTML);
  localStorage.setItem('state', `${checkedIndex}:${document.documentElement.style.getPropertyValue('--color')}:${document.documentElement.style.getPropertyValue('--l')}:${langSwitch.value}`);
}



// Restore previous state
if(localStorage.length > 0) {
  notesList.innerHTML = localStorage.getItem('notes');
  let [indexes, color, l, lang] = [...localStorage.getItem('state').split(':')]
  if(color != '') {
    document.documentElement.style.setProperty(`--color`, color);
    document.documentElement.style.setProperty(`--l`, l);
  }
  if(indexes != '') {
    for(let n of indexes) {
      notesList.childNodes[n].firstChild.checked = true
    }
  }
  if(lang != '') {
    recognition.lang = lang;
    langSwitch.value = lang;
    updateValues();
  }
}

updateValues();