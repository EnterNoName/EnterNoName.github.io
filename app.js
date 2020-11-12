// Important variables declaration
let items = JSON.parse(localStorage.getItem('items')) || [{text: 'Make your first task!', done: false}];
const todoList = document.querySelector('#todo');
const doneList = document.querySelector('#done');
let deleteButtons = document.querySelectorAll(".delete");

// Setting the height for the grid
const section = document.querySelector('section');
const maxHeight = getComputedStyle(section).maxHeight;

const maxHeightVH = pxToVH(maxHeight.match(/\d*\.?\d*/));
function pxToVH(px, padding = 0) {
    return (px - padding) * (100 / document.documentElement.clientHeight);
}

function updateHeight() {
    section.style.height = 'auto';
    section.style.height = pxToVH(section.scrollHeight) > maxHeightVH ? maxHeightVH + 'vh' : 'auto';
}

// List opening
document.querySelectorAll('.list-label').forEach(label => label.addEventListener('click', function() {
    this.classList.toggle('active');
    localStorage.setItem(this.htmlFor, this.classList[1] ? true : '');
    updateHeight()
}));

// Adding items
const createForm = document.querySelector('#create-task');

function addItem(e) {
    e.preventDefault();
    const text = this.querySelector('#input-field').value;
    const item = {
        text,
        done: false
    }
    items.push(item);
    localStorage.setItem('items', JSON.stringify(items));
    appendLists(items);
    this.reset();
}

function appendLists(items = [], done = false) {
    todoList.innerHTML = items.map((item,i) => {
        if(item.done != done) return;
        return  `
          <li draggable="true">
            <input type="checkbox" data-index=${i} id="item-${i}">
            <label for="item-${i}">${parseText(item.text)}</label>
          </li>
        `;
      }).join('');
    doneList.innerHTML = items.map((item,i) => {
        if(item.done == done) return;
        return  `
          <li draggable="true">
            <input type="checkbox" data-index=${i} id="item-${i}" checked>
            <label for="item-${i}">${parseText(item.text)}</label>
            <button class="delete" data-index="${i}"><i class="fas fa-trash-alt"></i></button>
          </li>
        `;
      }).join('');
      updateDeleteBtn()
      document.querySelectorAll('li').forEach(item => item.addEventListener('dragstart', dragStart))
}

function parseText(str) {
  return str.replace(/[&<>'"]/gm, match => {
    switch(match) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case "''":
        return '&apos;'
      case '""':
        return '&quot;'
    }
  });
}

createForm.addEventListener('submit', addItem);

// Toggle done
function toggleDone(e) {
    if(!e.target.matches('input')) return;
    const index = e.target.dataset.index;
    items[index].done = !items[index].done;
    
    localStorage.setItem('items', JSON.stringify(items));
    appendLists(items);
    updateDeleteBtn();
}

todoList.addEventListener('click', toggleDone);
doneList.addEventListener('click', toggleDone);

// Deleting elements
const deleteAll = document.querySelector('#clear-done');

function deleteItem() {
    items.splice(this.dataset.index,1);
    localStorage.setItem('items', JSON.stringify(items));
    this.parentNode.remove();
    appendLists(items);
}

function updateDeleteBtn() {
    deleteButtons = document.querySelectorAll(".delete");
    deleteButtons.forEach(button => button.addEventListener('click', deleteItem));
}

deleteAll.addEventListener('click', () => {
    const agree = confirm('Are you sure you want to delete all of the done tasks?');
    if(agree) {
        items = items.filter(item => !item.done);
        localStorage.setItem('items', JSON.stringify(items));
        doneList.innerHTML = '';
        appendLists(items);
    }
});

// Drag and Drop
function dragStart(e) {
    e.dataTransfer.setData('id', e.target.children[0].id);
    console.log(e.target.children[0].id)
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    const id = e.dataTransfer.getData('id');
    const elem = document.getElementById(id);
    const index = elem.dataset.index;
    const target =  document.getElementById(this.htmlFor) || this;
    target.append(elem.parentNode);

    if(target == doneList) {
      elem.checked = true;
      items[index].done = true;
    } else {
      elem.checked = false;
      items[index].done = false;
    }

    localStorage.setItem('items', JSON.stringify(items));
    appendLists(items);
    updateDeleteBtn();
}

document.querySelectorAll('ul').forEach(ul => ul.addEventListener('drop', drop));
document.querySelectorAll('ul').forEach(ul => ul.addEventListener('dragover', dragOver));

document.querySelectorAll('.list-label')
    .forEach(label => label.addEventListener('dragover', dragOver))
document.querySelectorAll('.list-label')
    .forEach(label => label.addEventListener('drop', drop))

// Change page color
const colorPicker = document.querySelector('#color-picker');

function changeColor() {
  let [hue, sat, light] = [...hexToHSL(this.value).split(' ')];
  document.documentElement.style.setProperty(`--color`, `${hue}, ${sat}`);
  document.documentElement.style.setProperty(`--l`, `${light}`);
  localStorage.setItem('color', JSON.stringify([hue,sat,light]));
}

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

colorPicker.addEventListener('change', changeColor);

// Speech recognition
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const srLangSwitch = document.querySelector('#lang-switch');
const startRecognition = document.querySelector('#speech-recognition');

recognition.interimResults = true;

function recognitionStart() {
  const i = items.length;
  const newTask = document.querySelector('#sr') || document.createElement('li');
  newTask.id = 'sr';
  newTask.innerHTML = `
  <input type="checkbox" data-index=${i} id="item-${i}">
  <label for="item-${i}">Talk...</label>
  `
  todoList.insertAdjacentElement('beforeend', newTask);
  newTask.addEventListener('click', e => e.preventDefault())

  recognition.start();
}

function enterResult(e) {
  const newTask = document.querySelector('#sr');
  const text = Array.from(e.results)
    .map(result => result[0].transcript)
    .join('');
  newTask.children[1].textContent = parseText(text);
}

function recognitionEnd() {
  const newTask = document.querySelector('#sr');
  const text = newTask.children[1].textContent;
  if(text == 'Talk...') {
    newTask.remove()
    return;
  }
  newTask.id = undefined;
  newTask.draggable = true;
  const item = {
      text,
      done: false
  }
  items.push(item);
  localStorage.setItem('items', JSON.stringify(items));
}

function changeSrLang() {
  recognition.lang = this.value;
  localStorage.setItem('srLang', this.value);
}

startRecognition.addEventListener('click', recognitionStart);
recognition.addEventListener('result', enterResult);
recognition.addEventListener('speechend', recognitionEnd);
srLangSwitch.addEventListener('change', changeSrLang)

// Restore from localStorage
function restoreValues() {
  document.querySelectorAll('.list-label').forEach(label => {
    if(localStorage.getItem(label.htmlFor)) {
      label.classList.toggle('active');
    }
  });
  const color = JSON.parse(localStorage.getItem('color'));
  if(color) {
    document.documentElement.style.setProperty(`--color`, `${color[0]}, ${color[1]}`);
    document.documentElement.style.setProperty(`--l`, `${color[2]}`);
  }
  const srLang = localStorage.getItem('srLang');
  if(srLang) {
    srLangSwitch.value = srLang;
  }
  recognition.lang = srLangSwitch.value;
}

if(localStorage.getItem('todo') == null) todoList.classList.add('active');

restoreValues();
appendLists(items);