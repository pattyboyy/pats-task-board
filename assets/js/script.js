// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Create a function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Create a function to create a task card
function createTaskCard(task) {
  const card = $("<div>").addClass("card task-card");
  const cardBody = $("<div>").addClass("card-body");
  const title = $("<h5>").addClass("card-title").text(task.title);
  const description = $("<p>").addClass("card-text").text(task.description);
  const dueDate = $("<p>").addClass("card-text").text(`Due: ${task.dueDate}`);
  const deleteBtn = $("<button>").addClass("btn btn-danger btn-sm float-end").text("Delete");

  deleteBtn.on("click", handleDeleteTask);

  cardBody.append(title, description, dueDate, deleteBtn);
  card.append(cardBody);

  const today = dayjs();
  const deadline = dayjs(task.dueDate);
  const daysUntilDeadline = deadline.diff(today, "day");

  if (daysUntilDeadline <= 2 && daysUntilDeadline >= 0) {
    card.addClass("nearing-deadline");
  } else if (daysUntilDeadline < 0) {
    card.addClass("overdue");
  }

  return card;
}

// Create a function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach((task) => {
    const card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  $(".task-card").draggable({
    revert: "invalid",
    revertDuration: 200,
    snap: ".lane",
    snapMode: "inner",
    snapTolerance: 20, // Add this line to adjust the snapping tolerance
    start: function() {
      $(this).addClass("dragging");
    },
    stop: function() {
      $(this).removeClass("dragging");
    }
  });
}

// Create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();
  const dueDate = $("#taskDueDate").val();

  const task = {
    id: generateTaskId(),
    title: title,
    description: description,
    dueDate: dueDate,
    status: "to-do"
  };

  taskList.push(task);
  saveTaskList();
  renderTaskList();

  $("#taskTitle").val("");
  $("#taskDescription").val("");
  $("#taskDueDate").val("");
  $("#formModal").modal("hide");
}

// Create a function to handle deleting a task
function handleDeleteTask(event) {
  const card = $(event.target).closest(".task-card");
  const taskId = parseInt(card.attr("data-task-id"));

  taskList = taskList.filter((task) => task.id !== taskId);
  saveTaskList();
  renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const card = ui.draggable;
    const taskId = parseInt(card.attr("data-task-id"));
    const newStatus = $(this).attr("id");
  
    const task = taskList.find((task) => task.id === taskId);
    task.status = newStatus;
    saveTaskList();
  
    // Center the task card within the column
    const columnWidth = $(this).width();
    const cardWidth = card.width();
    const leftOffset = (columnWidth - cardWidth) / 2;
    card.css({
      left: leftOffset + "px",
      top: "0"
    });
  
    renderTaskList();
  }

// Save the task list to localStorage
function saveTaskList() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", nextId);
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#saveTask").on("click", handleAddTask);

  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  $("#taskDueDate").attr("min", dayjs().format("YYYY-MM-DD"));
});
