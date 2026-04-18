const taskInput = document.getElementById('task');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('list');
const searchInput = document.getElementById('search');
const darkBtn = document.getElementById('darkMode');

let currentFilter = 'all';

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());
searchInput.addEventListener('input', renderTasks);

darkBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const tasks = getTasks();
  tasks.push({ id: Date.now(), text, completed: false });

  localStorage.setItem('tasks', JSON.stringify(tasks));
  taskInput.value = '';
  renderTasks();
}

function getTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

function renderTasks() {
  const tasks = getTasks();
  const search = searchInput.value.toLowerCase();

  list.innerHTML = '';

  tasks
    .filter(task => task.text.toLowerCase().includes(search))
    .filter(task => {
      if (currentFilter === 'completed') return task.completed;
      if (currentFilter === 'pending') return !task.completed;
      return true;
    })
        .forEach(task => {
      const li = document.createElement('li');
      li.className = task.completed ? 'completed' : '';

      li.innerHTML = `
        <span contenteditable="true">${task.text}</span>
        <div class="actions">
          <button class="complete-btn">✔</button>
          <button class="edit-btn">✏</button>
          <button class="delete-btn">✖</button>
        </div>
      `;

      const span = li.querySelector('span');

      span.addEventListener('blur', () => editTask(task.id, span.innerText));

      li.querySelector('.complete-btn').onclick = () => toggleTask(task.id);
      li.querySelector('.delete-btn').onclick = () => deleteTask(task.id);
      li.querySelector('.edit-btn').onclick = () => span.focus();

      list.appendChild(li);
    });
}

function toggleTask(id) {
  const tasks = getTasks().map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function editTask(id, newText) {
  const tasks = getTasks().map(t => t.id === id ? { ...t, text: newText } : t);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
function filterTasks(type) {
  currentFilter = type;
  renderTasks();
}

renderTasks();