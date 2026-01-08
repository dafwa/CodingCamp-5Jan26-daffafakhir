// --- DOM Elements ---
const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("date-input");
const addBtn = document.getElementById("add-btn");
const filterBtn = document.getElementById("filter-btn");
const deleteAllBtn = document.getElementById("delete-all-btn");
const todosBody = document.getElementById("todos-body");
const emptyMsg = document.getElementById("empty-msg");

// --- State Management ---
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let filterStatus = "all"; // Options: 'all', 'completed', 'pending'

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
        row.className = "hover:bg-slate-800 transition duration-150";

        // Status Colors
        const statusClass = todo.completed
            ? "text-green-400 bg-green-400/10 border-green-400/20"
            : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
        const statusText = todo.completed ? "Completed" : "Pending";
        const textDecoration = todo.completed ? "line-through text-gray-500" : "text-white";

        row.innerHTML = `
            <td class="p-4 ${textDecoration}">${todo.task}</td>
            <td class="p-4">${todo.date}</td>
            <td class="p-4">
                <span class="px-2 py-1 rounded text-xs border ${statusClass}">
                    ${statusText}
                </span>
            </td>
            <td class="p-4 text-center flex justify-center gap-2">
                <button onclick="toggleStatus('${todo.id}')" class="cursor-pointer text-green-400 hover:text-green-300 transition" title="Mark as Done/Undone">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
                <button onclick="deleteTodo('${todo.id}')" class="cursor-pointer text-red-400 hover:text-red-300 transition" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </td>
        `;
        todosBody.appendChild(row);
    });
}

function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    saveToLocalStorage();
    renderTodos();
}

function deleteAllTodos() {
    if (confirm("Are you sure you want to delete all tasks?")) {
        todos = [];
        saveToLocalStorage();
        renderTodos();
    }
}

function toggleStatus(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToLocalStorage();
        renderTodos();
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

// Helper: Simple Alert (can be replaced with a modal)
function showAlert(message) {
    alert(message);
}
