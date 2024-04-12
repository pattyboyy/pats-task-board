$(document).ready(function() {
  // Load tasks from localStorage
  loadTasks();

  // New task button click event
  $('#new-task').click(function() {
    $('#task-modal').removeClass('hidden');
  });

  // Save task button click event
  $('#save-task').click(function() {
    const title = $('#task-title').val();
    const description = $('#task-description').val();
    const deadline = $('#task-deadline').val();

    if (title && description && deadline) {
      const task = {
        id: Date.now(),
        title: title,
        description: description,
        deadline: deadline,
        status: 'not-started'
      };

      saveTasks(task);
      clearTaskForm();
      $('#task-modal').addClass('hidden');
      renderTaskList();
    }
  });

  // Cancel task button click event
  $('#cancel-task').click(function() {
    clearTaskForm();
    $('#task-modal').addClass('hidden');
  });

  // Delete task button click event
  $(document).on('click', '.delete-task', function() {
    const taskId = $(this).data('task-id');
    deleteTask(taskId);
    renderTaskList();
  });

  renderTaskColumns();
  renderTaskList();
});

// Save tasks to localStorage
function saveTasks(task) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  return tasks;
}

// Render task columns
function renderTaskColumns() {
  const taskColumns = ['not-started', 'in-progress', 'completed'];

  taskColumns.forEach(function(status) {
    const columnId = `${status}-column`;
    const columnTitle = status.replace(/-/g, ' ');

    const taskColumn = `
      <div class="task-column bg-gray-200 p-4" id="${columnId}" data-status="${status}">
        <h2 class="text-xl font-bold mb-4">${columnTitle}</h2>
      </div>
    `;

    $('.task-board').append(taskColumn);
  });

  // Make columns droppable
  $('.task-column').droppable({
    accept: '.task-card',
    drop: function(event, ui) {
      const taskCard = ui.draggable;
      const taskId = taskCard.data('task-id');
      const newStatus = $(this).data('status');

      updateTaskStatus(taskId, newStatus);
      renderTaskList(); // Re-render the entire task list
    }
  });
}

// Render task list
function renderTaskList() {
  const tasks = loadTasks();
  const taskColumns = $('.task-column');
  taskColumns.empty(); // Clear existing task cards

  tasks.forEach(function(task) {
    const taskCard = `
      <div class="task-card bg-white p-4 rounded shadow mb-4" data-task-id="${task.id}">
        <div class="font-bold">${task.title}</div>
        <div>${task.description}</div>
        <div class="text-sm text-gray-500">${formatDeadline(task.deadline)}</div>
        <button class="delete-task text-red-500 hover:text-red-700 float-right" data-task-id="${task.id}">Delete</button>
      </div>
    `;
    $(`#${task.status}-column`).append(taskCard);
  });

  // Initialize draggable functionality for task cards
  $('.task-card').draggable({
    revert: 'invalid',
    containment: '.task-board',
    helper: 'clone',
    cursor: 'move',
    start: function() {
      $(this).addClass('dragging');
    },
    stop: function() {
      $(this).removeClass('dragging');
    }
  });
}

// Update task status
function updateTaskStatus(taskId, newStatus) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
    return task;
  });
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

// Delete task from localStorage
function deleteTask(taskId) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks = tasks.filter(function(task) {
    return task.id !== taskId;
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Clear task form
function clearTaskForm() {
  $('#task-title').val('');
  $('#task-description').val('');
  $('#task-deadline').val('');
}

// Format deadline date
function formatDeadline(deadline) {
  return dayjs(deadline).format('YYYY-MM-DD');
}