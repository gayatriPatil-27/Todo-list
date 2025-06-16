let tasks = [];
let currentFilter = 'all';

// DOM Elements
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDate');
const priorityInput = document.getElementById('priority');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskCounter = document.getElementById('taskCounter');
const clearCompletedBtn = document.getElementById('clearCompleted');

console.log("JS Loaded");

// Load tasks from localStorage & upgrade old ones
if (localStorage.getItem('tasks')) {
  tasks = JSON.parse(localStorage.getItem('tasks')).map(task => ({
    ...task,
    priority: task.priority || 'medium' // fix for missing priority
  }));
  renderTasks();
}

// Add Task
addTaskBtn.addEventListener('click', () => {
  console.log("Add button clicked");
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;

  if (text !== '') {
    const newTask = {
      id: Date.now(),
      text,
      dueDate,
      priority,
      completed: false
    };
    tasks.push(newTask);
    taskInput.value = '';
    dueDateInput.value = '';
    priorityInput.value = 'medium';
    renderTasks();
  }
});

// Render Tasks
function renderTasks() {
  taskList.innerHTML = '';

  let filteredTasks = tasks;
  if (currentFilter === 'active') {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(task => task.completed);
  }

  filteredTasks.forEach(task => {
    const priority = task.priority || 'medium';

    const li = document.createElement('li');
    li.className = 'flex justify-between items-center bg-gray-100 px-4 py-2 rounded-md';

    const left = document.createElement('div');
    left.className = 'flex items-center gap-2';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      task.completed = !task.completed;
      renderTasks();
    });

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex flex-col sm:flex-row sm:items-center sm:gap-2';

    const span = document.createElement('span');
    span.textContent = task.text;
    span.className = 'cursor-pointer';
    if (task.completed) span.classList.add('line-through', 'opacity-60');
    span.addEventListener('click', () => editTask(task.id));

    if (task.dueDate) {
      const dateSpan = document.createElement('small');
      dateSpan.textContent = ` (Due: ${task.dueDate})`;
      dateSpan.className = 'text-sm text-gray-500 ml-1';
      span.appendChild(dateSpan);
    }

    const priorityLabel = document.createElement('span');
    const safePriority = task.priority || 'medium';
priorityLabel.textContent = safePriority.charAt(0).toUpperCase() + safePriority.slice(1);
priorityLabel.className = `ml-0 sm:ml-2 mt-1 sm:mt-0 px-2 py-0.5 text-xs rounded-full text-white ${getPriorityColor(safePriority)}`;


    contentWrapper.appendChild(span);
    contentWrapper.appendChild(priorityLabel);

    left.appendChild(checkbox);
    left.appendChild(contentWrapper);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑';
    deleteBtn.className = 'hover:text-red-500';
    deleteBtn.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      renderTasks();
    });

    li.appendChild(left);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  taskCounter.textContent = `All: ${tasks.length} | Active: ${activeCount} | Completed: ${completedCount}`;

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Edit Task
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newText = prompt('Edit your task:', task.text);
  if (newText !== null && newText.trim() !== '') {
    task.text = newText.trim();
    renderTasks();
  }
}

// Filter Buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});


// Clear Completed Tasks
clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  renderTasks();
});


// Enable drag-and-drop with SortableJS
new Sortable(taskList, {
  animation: 150,
  onEnd: function () {
    const newOrder = [];
    const listItems = taskList.querySelectorAll('li');
    listItems.forEach(item => {
      const text = item.querySelector('span').childNodes[0].nodeValue.trim();
      const match = tasks.find(t => t.text === text);
      if (match) newOrder.push(match);
    });
    tasks = newOrder;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
  }
});

// Priority color mapping
function getPriorityColor(priority) {
  switch (priority) {
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
}