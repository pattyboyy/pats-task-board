let taskList = [];
let nextId = 1;

function generateTaskId() {
  return nextId++;
}

function createTaskCard(task) {
    const taskCard = $('<div class="card task-card mb-3">');
    taskCard.attr('id', `task-${task.id}`);
    taskCard.attr('data-task', JSON.stringify(task));
  
    const cardBody = $('<div class="card-body">');
    const taskTitle = $('<h5 class="card-title">').text(task.title);
    const taskDescription = $('<p class="card-text">').text(task.description);
    const taskDeadline = $('<p class="card-text">').text(`Deadline: ${task.deadline}`);
    const deleteButton = $('<button class="btn btn-danger delete-task">').text('Delete');
  
    cardBody.append(taskTitle, taskDescription, taskDeadline, deleteButton);
    taskCard.append(cardBody);
  
    // Check due date and apply CSS classes
    const dueDate = new Date(task.deadline);
    const currentDate = new Date();
    const oneWeekFromNow = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
  
    if (dueDate < currentDate) {
      taskCard.addClass('overdue');
    } else if (dueDate <= oneWeekFromNow) {
      taskCard.addClass('near-due');
    }
  
    return taskCard;
  }

  function renderTaskList() {
    $('#todo-cards, #in-progress-cards, #done-cards').empty();
  
    taskList.forEach(task => {
      const taskCard = createTaskCard(task);
      taskCard.draggable({
        containment: '.swim-lanes',
        cursor: 'move',
        revert: 'invalid',
        start: function () {
          $(this).addClass('dragging');
        },
        stop: function () {
          $(this).removeClass('dragging');
        }
      });
  
      // Check if task.status is defined and non-empty, otherwise use a default value
      const status = task.status && task.status.trim() !== '' ? task.status : 'todo-cards';
      const safeStatus = status.replace(/[^a-zA-Z0-9-_]/g, '');
      $(`#${safeStatus}`).append(taskCard);
    });
  
    // Make the task cards draggable again after rendering
    $(".task-card").draggable({
      revert: false,
      start: function (event, ui) {
        $(this).addClass("dragging");
        $(this).css('zIndex', 1000); // Set a high zIndex value
      },
      stop: function (event, ui) {
        $(this).removeClass("dragging");
        $(this).css('zIndex', ''); // Reset the zIndex to its default value
      },
    });
  }

function handleAddTask(event) {
  event.preventDefault();

  const title = $('#task-title').val();
  const description = $('#task-description').val();
  const deadline = $('#task-deadline').val();

  if (title && description && deadline) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      status: 'todo-cards'
    };

    taskList.push(newTask);
    saveTasksToLocalStorage();

    renderTaskList();

    $('#task-title').val('');
    $('#task-description').val('');
    $('#task-deadline').val('');
    $('#formModal').modal('hide');
  }
}

function handleDeleteTask(event) {
  const taskCard = $(event.target).closest('.task-card');
  const taskId = parseInt(taskCard.attr('id').split('-')[1]);

  taskList = taskList.filter(task => task.id !== taskId);
  saveTasksToLocalStorage();

  taskCard.remove();
}

function handleDrop(event, ui) {
    const taskCard = ui.draggable;
    const taskId = parseInt(taskCard.attr("id").split('-')[1]);
    const droppedLane = $(event.target).closest('.card-body').parent().attr('id');
    const originalLane = taskCard.parent().parent().attr('id');
  
    // Find the task in the taskList and update its status
    const task = taskList.find(task => task.id === taskId);
    if (task) {
      // Remove the task card from its current lane
      taskCard.detach();
  
      // Update the task status if the lane has changed
      if (droppedLane !== originalLane) {
        task.status = droppedLane;
        saveTasksToLocalStorage();
      }
  
      // Append the task card to the new lane or reorder within the same lane
      $(event.target).closest('.card-body').append(taskCard);
  
      // Prevent snapping to the left
      taskCard.css({
        position: 'relative',
        left: 0,
        top: 0
      });
    }
  }
  

function saveTasksToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

function loadTasksFromLocalStorage() {
  const storedTasks = localStorage.getItem("tasks");
  const storedNextId = localStorage.getItem("nextId");

  if (storedTasks) {
    taskList = JSON.parse(storedTasks);
  }

  if (storedNextId) {
    nextId = JSON.parse(storedNextId);
  }
}

$(document).ready(function () {
    loadTasksFromLocalStorage();
    renderTaskList();
  
    $('#add-task-form').on('submit', handleAddTask);
    $('.swim-lanes').on('click', '.delete-task', handleDeleteTask);
  
    $('.card-body').droppable({
      accept: '.task-card',
      drop: handleDrop
    });
  
    $('#task-deadline').datepicker();
    $('#add-task-button').on('click', function () {
      $('#formModal').modal('show');
    });
  });