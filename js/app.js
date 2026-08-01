"use strict";

const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const statusInput = document.getElementById("task-status");
const messageElement = document.getElementById("message");
const taskList = document.getElementById("task-list");
const saveButton = document.getElementById("save-button");

const STORAGE_KEY = "tasks";

let editingTaskId = null;

/**
 * Obtiene las tareas almacenadas en el navegador.
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
 * Genera un identificador para una tarea.
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
 * Convierte una fecha guardada a un formato legible.
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
 * Obtiene una clase CSS según el estado.
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
 * Devuelve el formulario a su estado inicial.
 */
function resetFormState() {
    editingTaskId = null;
    taskForm.reset();
    saveButton.textContent = "Guardar tarea";
    titleInput.focus();
}

/**
 * Coloca una tarea en el formulario para editarla.
 *
 * @param {string} taskId
 */
function startEditingTask(taskId) {
    const tasks = getTasks();
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
        showMessage("No fue posible encontrar la tarea.", "error");
        return;
    }

    editingTaskId = task.id;

    titleInput.value = task.title;
    descriptionInput.value = task.description;
    statusInput.value = task.status;

    saveButton.textContent = "Actualizar tarea";

    taskForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    titleInput.focus();
}

/**
 * Crea una tarjeta visual para una tarea.
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

    const dateText = task.updatedAt
        ? `Actualizada: ${formatDate(task.updatedAt)}`
        : `Creada: ${formatDate(task.createdAt)}`;

    date.textContent = dateText;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-button";
    editButton.textContent = "Editar";

    editButton.addEventListener("click", () => {
        startEditingTask(task.id);
    });

    actions.appendChild(editButton);

    article.append(header, description, date, actions);

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
        taskList.appendChild(createTaskCard(task));
    });
}

/**
 * Crea una nueva tarea.
 *
 * @param {string} title
 * @param {string} description
 * @param {string} status
 */
function createTask(title, description, status) {
    const tasks = getTasks();

    const newTask = {
        id: generateTaskId(),
        title,
        description,
        status,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks(tasks);
}

/**
 * Actualiza una tarea existente.
 *
 * @param {string} taskId
 * @param {string} title
 * @param {string} description
 * @param {string} status
 * @returns {boolean}
 */
function updateTask(taskId, title, description, status) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
        return false;
    }

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description,
        status,
        updatedAt: new Date().toISOString()
    };

    saveTasks(tasks);
    return true;
}

/**
 * Procesa el formulario.
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

    if (editingTaskId !== null) {
        const wasUpdated = updateTask(
            editingTaskId,
            title,
            description,
            status
        );

        if (!wasUpdated) {
            showMessage("No fue posible actualizar la tarea.", "error");
            return;
        }

        showMessage("La tarea fue actualizada correctamente.", "success");
    } else {
        createTask(title, description, status);
        showMessage("La tarea fue guardada correctamente.", "success");
    }

    renderTasks();
    resetFormState();
});

renderTasks();
