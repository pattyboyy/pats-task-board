// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
    let currentId = nextId;
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return currentId;
}

// Create a task card
function createTaskCard(task) {
    let isNearing = dayjs().isAfter(dayjs(task.deadline).subtract(3, 'day'), 'day');
    let isOverdue = dayjs().isAfter(dayjs(task.deadline), 'day');
    let colorClass = isOverdue ? 'bg-danger' : isNearing ? 'bg-warning' : 'bg-light';
    return `
        <div class="card ${colorClass}" data-task-id="${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text">Deadline: ${task.deadline}</p>
                <button class="btn btn-danger" onclick="handleDeleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `;
}

// Render the task list and reinitialize draggable
function renderTaskList() {
    ['to-do', 'in-progress', 'done'].forEach(status => {
        let container = document.getElementById(`${status}-cards`);
        if (!container) {
            console.error(`Container not found for status: ${status}`);
            return;
        }
        container.innerHTML = '';
        taskList.filter(task => task.status === status).forEach(task => {
            container.innerHTML += createTaskCard(task);
        });
    });
    initializeDraggable();
}

// Initialize draggable and droppable
function initializeDraggable() {
  $(".card").draggable({
      revert: "invalid",  // Reverts the draggable to its original position if not dropped in a valid drop target
      cursor: "move",
      helper: "clone"  // Creates a clone of the draggable element, could be useful for visual feedback
  });

  $(".lane").droppable({
      accept: ".card",
      hoverClass: "lane-hover",
      drop: function(event, ui) {
          let newStatus = this.id.replace('-cards', '');
          let taskId = $(ui.draggable).data("task-id");
          updateTaskStatus(taskId, newStatus);
          ui.draggable.detach().appendTo($(this).find('.card-body'));  // This moves the card to the new column
      }
  });
}


// Handle adding a new task
function handleAddTask() {
    let title = document.getElementById("task-title").value;
    let description = document.getElementById("task-description").value;
    let deadline = document.getElementById("task-deadline").value;

    if (!title || !description || !deadline) {
        alert("All fields are required.");
        return;
    }

    let newTask = {
        id: generateTaskId(),
        title: title,
        description: description,
        deadline: deadline,
        status: 'to-do'
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();

    // Clear the fields
    document.getElementById("task-title").value = '';
    document.getElementById("task-description").value = '';
    document.getElementById("task-deadline").value = '';

    // Close the modal
    let modalInstance = bootstrap.Modal.getInstance(document.getElementById('formModal'));
    modalInstance.hide();
}

// Update task status
function updateTaskStatus(taskId, newStatus) {
    taskList = taskList.map(task => {
        if (task.id === taskId) {
            task.status = newStatus;
        }
        return task;
    });
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

function initializeDraggable() {
    $(".card").draggable({
        revert: "invalid",  // Reverts the draggable to its original position if not dropped in a valid drop target
        cursor: "move",
        helper: "clone"  // Creates a clone of the draggable element, could be useful for visual feedback
    });

    $(".lane").droppable({
        accept: ".card",
        hoverClass: "lane-hover",
        drop: function(event, ui) {
            let newStatus = this.id.replace('-cards', '');
            let taskId = $(ui.draggable).data("task-id");
            updateTaskStatus(taskId, newStatus);
            ui.draggable.detach().appendTo($(this).find('.card-body'));  // This moves the card to the new column
        }
    });
}


// Handle deleting a task
function handleDeleteTask(id) {
    taskList = taskList.filter(task => task.id !== id);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Initial setup when document is ready
$(document).ready(function () {
    renderTaskList();
    initializeDraggable();
});
