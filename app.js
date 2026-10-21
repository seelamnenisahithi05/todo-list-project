
const form = document.getElementById("form");
const input = document.getElementById("text");
const list = document.getElementById("list");
const count = document.getElementById("count");
const clearButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll("[data-filter]");

let tasks = [];
let currentFilter = "all";

// Load saved tasks safely
function load() {
  try {
    const saved = localStorage.getItem("tasks");
    const data = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(data)) return [];

    return data.filter(
      task =>
        task &&
        typeof task.id === "number" &&
        typeof task.text === "string" &&
        typeof task.done === "boolean"
    );
  } catch (error) {
    return [];
  }
}

// Save tasks in the browser
function save() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks:", error);
  }
}

// Display tasks and update the counter
function render() {
  list.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.done;
    if (currentFilter === "done") return task.done;
    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.dataset.id = task.id;

    if (task.done) item.classList.add("done");

    const label = document.createElement("span");
    label.textContent = task.text;

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.textContent = task.done ? "Undo" : "Done";
    toggleButton.dataset.action = "toggle";
    toggleButton.setAttribute(
      "aria-label",
      `${task.done ? "Mark active" : "Complete"}: ${task.text}`
    );

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.action = "delete";
    deleteButton.setAttribute("aria-label", `Delete: ${task.text}`);

    item.append(label, toggleButton, deleteButton);
    list.append(item);
  });

  const remaining = tasks.filter(task => !task.done).length;
  count.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;

  filterButtons.forEach(button => {
    const active = button.dataset.filter === currentFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

// Add a new task
form.addEventListener("submit", event => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  tasks.push({
    id: Date.now() + Math.random(),
    text: text,
    done: false
  });

  input.value = "";
  save();
  render();
  input.focus();
});

// Handle Done, Undo, and Delete clicks
list.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const item = button.closest("li");
  if (!item) return;

  const id = Number(item.dataset.id);

  if (button.dataset.action === "delete") {
    tasks = tasks.filter(task => task.id !== id);
  } else if (button.dataset.action === "toggle") {
    tasks.forEach(task => {
      if (task.id === id) task.done = !task.done;
    });
  }

  save();
  render();
});

// Filter tasks
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

// Remove completed tasks
clearButton.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.done);
  save();
  render();
});

// Restore saved tasks when the page opens
tasks = load();
render();
