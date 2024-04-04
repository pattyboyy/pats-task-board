// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Create a task card
function createTaskCard(task) {
  const card = $('<div>').addClass('card mb-3 task-card').attr('data-task-id', task.id);
  const cardBody = $('<div>').addClass('card-body');
  const title = $('<h5>').addClass('card-title').text(task.title);
  const description = $('<p>').addClass('card-text').text(task.description);
  const dueDate = $('<p>').addClass('card-text due-date').text('Due: ' + task.due);

  // Color-code tasks based on deadline
  const currentDate = dayjs();
  const taskDate = dayjs(task.due);
  if (taskDate.isBefore(currentDate)) {
    card.addClass('bg-danger text-white');
  } else if (taskDate.diff(currentDate, 'day') <= 2) {
    card.addClass('bg-warning');
  }

  const deleteBtn = $('<button>').addClass('btn btn-danger delete-task').text('Delete');

  cardBody.append(title, description, dueDate, deleteBtn);
  card.append(cardBody);
  return card;
}

// Render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards').empty();
  $('#in-progress-cards').empty();
  $('#done-cards').empty();

  taskList.forEach(function (task) {
    const card = createTaskCard(task);
    card.draggable({
      revert: 'invalid',
      start: function (event, ui) {
        $(this).addClass('dragging');
      },
      stop: function (event, ui) {
        $(this).removeClass('dragging');
      }
    });

    if (task.status === 'todo') {
      $('#todo-cards').append(card);
    } else if (task.status === 'in-progress') {
      $('#in-progress-cards').append(card);
    } else if (task.status === 'done') {
      $('#done-cards').append(card);
    }
  });
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $('#task-title').val();
  const description = $('#task-description').val();
  const dueDate = $('#task-due').val();

  if (title && description && dueDate) {
    const newTask = {
      id: generateTaskId(),
      title: title,
      description: description,
      due: dueDate,
      status: 'todo'
    };

    taskList.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    localStorage.setItem('nextId', nextId);

    $('#formModal').modal('hide');
    $('#task-title').val('');
    $('#task-description').val('');
    $('#task-due').val('');
    renderTaskList();
  }
}

// Handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.task-card').data('task-id');
  taskList = taskList.filter(function (task) {
    return task.id !== taskId;
  });

  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskCard = ui.draggable;
  const newStatus = $(event.target).attr('id').split('-')[0];

  const taskId = taskCard.data('task-id');
  const task = taskList.find(function (task) {
    return task.id === taskId;
  });
  task.status = newStatus;

  localStorage.setItem('tasks', JSON.stringify(taskList));
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and initialize the datepicker
$(document).ready(function () {
  renderTaskList();

  $('#save-task').on('click', handleAddTask);
  $(document).on('click', '.delete-task', handleDeleteTask);

  $('.card-body').droppable({
    accept: '.task-card',
    drop: handleDrop
  });

  $('#task-due').datepicker({
    dateFormat: 'yy-mm-dd',
    minDate: 0
  });
});