/* =====================================
   TASKFLOW - TODO APPLICATION
   ===================================== */


/* =====================================
   DOM ELEMENTS
===================================== */

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const allCount = document.getElementById("allCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const filterButtons = document.querySelectorAll(".filter-btn");

const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");

const clearCompleted = document.getElementById("clearCompleted");

const editModal = document.getElementById("editModal");
const editInput = document.getElementById("editInput");
const closeModal = document.getElementById("closeModal");
const cancelEdit = document.getElementById("cancelEdit");
const saveEdit = document.getElementById("saveEdit");


/* =====================================
   APPLICATION STATE
===================================== */

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

let currentFilter = "all";

let editingTaskId = null;


/* =====================================
   SAVE TASKS
===================================== */

function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );
}


/* =====================================
   CREATE UNIQUE ID
===================================== */

function createTaskId() {

    return Date.now().toString() +
        Math.random().toString(16).slice(2);
}


/* =====================================
   ADD TASK
===================================== */

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        return;
    }

    const newTask = {

        id: createTaskId(),

        text: text,

        completed: false,

        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);

    saveTasks();

    taskInput.value = "";

    renderTasks();

    taskInput.focus();
});


/* =====================================
   FILTER TASKS
===================================== */

function getFilteredTasks() {

    if (currentFilter === "active") {

        return tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {

        return tasks.filter(task => task.completed);
    }

    return tasks;
}


/* =====================================
   RENDER TASKS
===================================== */

function renderTasks() {

    const filteredTasks = getFilteredTasks();

    taskList.innerHTML = "";

    filteredTasks.forEach(task => {

        const li = document.createElement("li");

        li.className = "task-item";

        li.dataset.id = task.id;

        if (task.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? "checked" : ""}
                aria-label="Mark task as completed"
            >

            <span class="task-text"></span>

            <div class="task-actions">

                <button
                    type="button"
                    class="action-btn edit-btn"
                    data-action="edit"
                    aria-label="Edit task"
                >
                    ✏️
                </button>

                <button
                    type="button"
                    class="action-btn delete-btn"
                    data-action="delete"
                    aria-label="Delete task"
                >
                    🗑️
                </button>

            </div>
        `;

        /*
         * Using textContent prevents user-entered HTML
         * from being interpreted as markup.
         */
        li.querySelector(".task-text").textContent = task.text;

        taskList.appendChild(li);
    });

    updateStatistics();

    updateEmptyState(filteredTasks);
}


/* =====================================
   UPDATE STATISTICS
===================================== */

function updateStatistics() {

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = tasks.length - completed;

    totalTasks.textContent = tasks.length;

    allCount.textContent = tasks.length;

    activeCount.textContent = active;

    completedCount.textContent = completed;
}


/* =====================================
   EMPTY STATE
===================================== */

function updateEmptyState(filteredTasks) {

    if (filteredTasks.length > 0) {

        emptyState.style.display = "none";

        return;
    }

    emptyState.style.display = "flex";

    if (tasks.length === 0) {

        emptyTitle.textContent = "No tasks yet";

        emptyMessage.textContent =
            "Add your first task and start getting things done.";

        return;
    }

    if (currentFilter === "active") {

        emptyTitle.textContent = "No active tasks";

        emptyMessage.textContent =
            "Great! You have completed all your tasks.";

        return;
    }

    if (currentFilter === "completed") {

        emptyTitle.textContent = "No completed tasks";

        emptyMessage.textContent =
            "Complete a task and it will appear here.";

        return;
    }
}


/* =====================================
   FILTER BUTTON CLICK
===================================== */

filterButtons.forEach(button => {

    button.addEventListener("click", function () {

        currentFilter = this.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        renderTasks();
    });

});


/* =====================================
   EVENT DELEGATION
===================================== */

taskList.addEventListener("click", function (event) {

    const taskItem = event.target.closest(".task-item");

    if (!taskItem) {
        return;
    }

    const taskId = taskItem.dataset.id;

    const actionButton =
        event.target.closest("[data-action]");


    /* -------------------------------
       DELETE
    -------------------------------- */

    if (
        actionButton &&
        actionButton.dataset.action === "delete"
    ) {

        deleteTask(taskId);

        return;
    }


    /* -------------------------------
       EDIT
    -------------------------------- */

    if (
        actionButton &&
        actionButton.dataset.action === "edit"
    ) {

        openEditModal(taskId);

        return;
    }
});


/* =====================================
   CHECKBOX CHANGE
===================================== */

taskList.addEventListener("change", function (event) {

    if (!event.target.classList.contains("task-checkbox")) {
        return;
    }

    const taskItem =
        event.target.closest(".task-item");

    const taskId = taskItem.dataset.id;

    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) {
        return;
    }

    task.completed = event.target.checked;

    saveTasks();

    renderTasks();
});


/* =====================================
   DELETE TASK
===================================== */

function deleteTask(taskId) {

    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) {
        return;
    }

    const confirmed = confirm(
        `Delete "${task.text}"?`
    );

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(
        task => task.id !== taskId
    );

    saveTasks();

    renderTasks();
}


/* =====================================
   OPEN EDIT MODAL
===================================== */

function openEditModal(taskId) {

    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) {
        return;
    }

    editingTaskId = taskId;

    editInput.value = task.text;

    editModal.classList.add("show");

    editModal.setAttribute("aria-hidden", "false");

    setTimeout(() => {
        editInput.focus();
        editInput.select();
    }, 50);
}


/* =====================================
   CLOSE EDIT MODAL
===================================== */

function closeEditModal() {

    editModal.classList.remove("show");

    editModal.setAttribute("aria-hidden", "true");

    editingTaskId = null;
}


/* =====================================
   SAVE EDIT
===================================== */

saveEdit.addEventListener("click", function () {

    const updatedText = editInput.value.trim();

    if (!updatedText) {

        editInput.focus();

        return;
    }

    const task = tasks.find(
        task => task.id === editingTaskId
    );

    if (!task) {
        return;
    }

    task.text = updatedText;

    saveTasks();

    renderTasks();

    closeEditModal();
});


/* =====================================
   MODAL BUTTONS
===================================== */

closeModal.addEventListener(
    "click",
    closeEditModal
);

cancelEdit.addEventListener(
    "click",
    closeEditModal
);


/* =====================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
===================================== */

editModal.addEventListener("click", function (event) {

    if (event.target === editModal) {

        closeEditModal();
    }
});


/* =====================================
   ESCAPE KEY
===================================== */

document.addEventListener("keydown", function (event) {

    if (
        event.key === "Escape" &&
        editModal.classList.contains("show")
    ) {

        closeEditModal();
    }
});


/* =====================================
   CLEAR COMPLETED
===================================== */

clearCompleted.addEventListener("click", function () {

    const completedTasks =
        tasks.filter(task => task.completed);

    if (completedTasks.length === 0) {

        alert("There are no completed tasks to clear.");

        return;
    }

    const confirmed = confirm(
        `Delete ${completedTasks.length} completed task(s)?`
    );

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(
        task => !task.completed
    );

    saveTasks();

    renderTasks();
});


/* =====================================
   INITIALIZE APPLICATION
===================================== */

renderTasks();