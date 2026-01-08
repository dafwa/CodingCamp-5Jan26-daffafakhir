// --- DOM Elements ---
const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("date-input");
const addBtn = document.getElementById("add-btn");
const filterBtn = document.getElementById("filter-btn");
const deleteAllBtn = document.getElementById("delete-all-btn");
const todosBody = document.getElementById("todos-body");
const emptyMsg = document.getElementById("empty-msg");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalActions = document.getElementById("modal-actions");

// --- State Management ---
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let filterStatus = "all"; // Options: 'all', 'completed', 'pending'
let draggedTodoId = null;

// --- Event Listeners ---
addBtn.addEventListener("click", addTodo);
deleteAllBtn.addEventListener("click", deleteAllTodos);
filterBtn.addEventListener("click", cycleFilter);

// Listen for "Enter" key in input
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
});

// Initial Render
renderTodos();

// --- Functions ---

function addTodo() {
    const taskText = taskInput.value.trim();
    const dateValue = dateInput.value;

    // Validation
    if (taskText === "") {
        showAlert("Please enter a task!");
        return;
    }
    if (dateValue === "") {
        showAlert("Please select a due date!");
        return;
    }

    // Create Todo Object
    const newTodo = {
        id: generateId(),
        task: taskText,
        date: formatDate(dateValue), // Format date for display
        completed: false,
    };

    todos.push(newTodo);
    saveToLocalStorage();
    renderTodos();

    // Clear Inputs
    taskInput.value = "";
    dateInput.value = "";

    showToast("Task added successfully");
}

function renderTodos() {
    todosBody.innerHTML = "";

    // Filter Logic
    let filteredTodos = todos;
    if (filterStatus === "completed") {
        filteredTodos = todos.filter((todo) => todo.completed);
    } else if (filterStatus === "pending") {
        filteredTodos = todos.filter((todo) => !todo.completed);
    }

    // Empty State Check
    if (filteredTodos.length === 0) {
        emptyMsg.classList.remove("hidden");
        todosBody.innerHTML = "";
    } else {
        emptyMsg.classList.add("hidden");
    }

    // Generate HTML for each todo
    filteredTodos.forEach((todo) => {
        const row = document.createElement("tr");
        row.setAttribute("draggable", "true");
        row.dataset.id = todo.id;

        row.className = "hover:bg-slate-800 transition duration-150";
        row.style.cursor = "grab";

        // Status Colors
        const statusClass = todo.completed
            ? "text-green-400 bg-green-400/10 border-green-400/20"
            : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
        const statusText = todo.completed ? "Completed" : "Pending";
        const textDecoration = todo.completed ? "line-through text-gray-500" : "text-white";

        row.innerHTML = `
            <td class="p-4 md:table-cell block" data-label="Task">
                <span class="${textDecoration} block">${todo.task}</span>
            </td>
            <td class="p-4 md:table-cell block" data-label="Due Date">
                ${todo.date}
            </td>
            <td class="p-4 md:table-cell block" data-label="Status">
                <span class="px-2 py-1 rounded text-xs border ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="p-4 md:table-cell block md:text-center" data-label="Actions">
                <div class="flex gap-3 md:justify-center">
                    <button onclick="toggleStatus('${todo.id}')" class="cursor-pointer text-green-400 hover:text-green-300 transition p-2" title="Mark as Done/Undone">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button onclick="deleteTodo('${todo.id}')" class="cursor-pointer text-red-400 hover:text-red-300 transition p-2" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </td>
        `;

        row.addEventListener("dragstart", handleDragStart);
        row.addEventListener("dragover", handleDragOver);
        row.addEventListener("drop", handleDrop);
        row.addEventListener("dragend", handleDragEnd);

        todosBody.appendChild(row);
    });
}

function deleteTodo(id) {
    showModal({
        title: "Delete Task",
        message: "This task will be permanently removed.",
        type: "confirm",
    }).then((confirmed) => {
        if (!confirmed) return;
        todos = todos.filter((todo) => todo.id !== id);
        saveToLocalStorage();
        renderTodos();

        showToast("Task deleted");
    });
}

function deleteAllTodos() {
    showModal({
        title: "Delete All Tasks",
        message: "Are you sure you want to delete all tasks?",
        type: "confirm",
    }).then((confirmed) => {
        if (!confirmed) return;
        todos = [];
        saveToLocalStorage();
        renderTodos();

        showToast("All tasks deleted", "error");
    });
}

function toggleStatus(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToLocalStorage();
        renderTodos();

        showToast(todo.completed ? "Task marked as completed" : "Task marked as pending", "info");
    }
}

function cycleFilter() {
    if (filterStatus === "all") {
        filterStatus = "pending";
        filterBtn.innerText = "FILTER: PENDING";
    } else if (filterStatus === "pending") {
        filterStatus = "completed";
        filterBtn.innerText = "FILTER: COMPLETED";
    } else {
        filterStatus = "all";
        filterBtn.innerText = "FILTER: ALL";
    }
    renderTodos();
}

// Helper: Save to browser storage so data persists on refresh
function saveToLocalStorage() {
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Helper: Generate unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// Helper: Format Date (YYYY-MM-DD to cleaner format)
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Modal Helper
function showModal({ title, message, type = "alert" }) {
    return new Promise((resolve) => {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalActions.innerHTML = "";

        if (type === "confirm") {
            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "Cancel";
            cancelBtn.className =
                "cursor-pointer bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition";

            const confirmBtn = document.createElement("button");
            confirmBtn.textContent = "Confirm";
            confirmBtn.className =
                "cursor-pointer bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition";

            cancelBtn.onclick = () => close(false);
            confirmBtn.onclick = () => close(true);

            modalActions.append(cancelBtn, confirmBtn);
        } else {
            const okBtn = document.createElement("button");
            okBtn.textContent = "OK";
            okBtn.className =
                "cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition";
            okBtn.onclick = () => close(true);
            modalActions.appendChild(okBtn);
        }

        function close(result) {
            modal.classList.add("hidden");
            modal.classList.remove("show");
            resolve(result);
        }

        modal.classList.remove("hidden");
        modal.classList.add("show");

        modal.onclick = (e) => {
            if (e.target === modal) close(false);
        };
    });
}

function showAlert(message) {
    return showModal({
        title: "Required",
        message,
        type: "alert",
    });
}

// Toast Helper
const toastContainer = document.getElementById("toast-container");

function showToast(message, type = "success") {
    const toast = document.createElement("div");

    const styles = {
        success: "bg-green-500/10 text-green-400 border-green-400/20",
        error: "bg-red-500/10 text-red-400 border-red-400/20",
        info: "bg-indigo-500/10 text-indigo-400 border-indigo-400/20",
    };

    toast.className = `
        toast pointer-events-auto
        border rounded-lg px-4 py-3 text-sm shadow-lg
        ${styles[type] || styles.success}
    `;

    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Drag Handlers
function handleDragStart(e) {
    draggedTodoId = this.dataset.id;
    this.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add("drag-over");
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove("drag-over");

    const targetId = this.dataset.id;
    if (draggedTodoId === targetId) return;

    reorderTodos(draggedTodoId, targetId);
}

function handleDragEnd() {
    this.classList.remove("dragging");
    document.querySelectorAll(".drag-over").forEach((el) => el.classList.remove("drag-over"));
}

function reorderTodos(sourceId, targetId) {
    const sourceIndex = todos.findIndex((t) => t.id === sourceId);
    const targetIndex = todos.findIndex((t) => t.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const [movedTodo] = todos.splice(sourceIndex, 1);
    todos.splice(targetIndex, 0, movedTodo);

    saveToLocalStorage();
    renderTodos();

    showToast("Task order updated", "info");
}
