"use strict";

const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const statusInput = document.getElementById("task-status");
const messageElement = document.getElementById("message");
const taskList = document.getElementById("task-list");

const STORAGE_KEY = "tasks";

/**
 * Obtiene las tareas guardadas en el navegador.
 *
 * @returns {Array}
 */
function getTasks() {
    try {
        const storedTasks = localStorage.getItem(STORAGE_KEY);

        if (!storedTasks) {
            return [];
        }

        const tasks = JSON.parse(storedTasks);

        return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
        console.error("No fue posible leer las tareas:", error);
        return [];
    }
}

/**
 * Guarda las tareas en localStorage.
 *
 * @param {Array} tasks
 */
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Muestra un mensaje de confirmación o error.
 *
 * @param {string} text
 * @param {"success"|"error"} type
 */
function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;

    setTimeout(() => {
        messageElement.textContent = "";
        messageElement.className = "message";
    }, 3000);
}

/**
 * Genera un identificador para una nueva tarea.
 *
 * @returns {string}
 */
function generateTaskId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Convierte la fecha guardada a un formato legible.
 *
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Fecha no disponible";
    }

    return date.toLocaleString("es-DO", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

/**
 * Obtiene una clase CSS según el estado de la tarea.
 *
 * @param {string} status
 * @returns {string}
 */
function getStatusClass(status) {
    switch (status) {
        case "Completada":
            return "completed";

        case "En proceso":
            return "in-progress";

        default:
            return "pending";
    }
}

/**
 * Crea visualmente una tarjeta de tarea.
 *
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createTaskCard(task) {
    const article = document.createElement("article");
    article.className = "task-card";
    article.dataset.taskId = task.id;

    const header = document.createElement("div");
    header.className = "task-card-header";

    const title = document.createElement("h3");
    title.textContent = task.title;

    const status = document.createElement("span");
    status.className = `task-status ${getStatusClass(task.status)}`;
    status.textContent = task.status;

    header.append(title, status);

    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description || "Sin descripción.";

    const date = document.createElement("small");
    date.className = "task-date";
    date.textContent = `Creada: ${formatDate(task.createdAt)}`;

    article.append(header, description, date);

    return article;
}

/**
 * Muestra todas las tareas almacenadas.
 */
function renderTasks() {
    const tasks = getTasks();

    taskList.replaceChildren();

    if (tasks.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "No hay tareas registradas.";

        taskList.appendChild(emptyMessage);
        return;
    }

    tasks.forEach((task) => {
        const taskCard = createTaskCard(task);
        taskList.appendChild(taskCard);
    });
}

/**
 * Procesa el registro de una tarea.
 */
taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const status = statusInput.value;

    if (title === "") {
        showMessage("Debes escribir el título de la tarea.", "error");
        titleInput.focus();
        return;
    }

    const newTask = {
        id: generateTaskId(),
        title,
        description,
        status,
        createdAt: new Date().toISOString()
    };

    const tasks = getTasks();

    tasks.push(newTask);
    saveTasks(tasks);

    renderTasks();

    taskForm.reset();
    titleInput.focus();

    showMessage("La tarea fue guardada correctamente.", "success");
});

renderTasks();