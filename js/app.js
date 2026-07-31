"use strict";

const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const statusInput = document.getElementById("task-status");
const messageElement = document.getElementById("message");

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

    taskForm.reset();
    titleInput.focus();

    showMessage("La tarea fue guardada correctamente.", "success");

    console.log("Tarea creada:", newTask);
});