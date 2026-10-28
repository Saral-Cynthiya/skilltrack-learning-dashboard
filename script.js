
const $ = (id) => document.getElementById(id);

function loadData(key, fallback) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : fallback;
    } catch {
        return fallback;
    }
}

let skills = loadData("skilltrack-skills", [
    { id: 1, name: "HTML & CSS", level: 75 },
    { id: 2, name: "JavaScript", level: 25 },
    { id: 3, name: "Communication", level: 50 }
]);

let tasks = loadData("skilltrack-tasks", [
    { id: 1, name: "Practice coding for 30 minutes", done: false },
    { id: 2, name: "Learn one new concept", done: true }
]);

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[character]));
}

function saveData() {
    localStorage.setItem("skilltrack-skills", JSON.stringify(skills));
    localStorage.setItem("skilltrack-tasks", JSON.stringify(tasks));
}

function renderDashboard() {
    $("totalSkills").textContent = skills.length;

    $("completedTasks").textContent =
        tasks.filter(task => task.done).length;

    const average = skills.length
        ? Math.round(
            skills.reduce((sum, skill) => sum + skill.level, 0)
            / skills.length
        )
        : 0;

    $("averageProgress").textContent = average + "%";

    $("skillsList").innerHTML = skills.length
        ? skills.map(skill => `
            <div class="skill-item">
                <div class="skill-heading">
                    <strong>${escapeHTML(skill.name)}</strong>
                    <span>${skill.level}%</span>
                </div>

                <progress
                    value="${skill.level}"
                    max="100"
                    aria-label="${escapeHTML(skill.name)} progress">
                </progress>

                <div class="actions">
                    <button data-action="increase" data-id="${skill.id}">
                        +25%
                    </button>

                    <button data-action="reset" data-id="${skill.id}">
                        Reset
                    </button>

                    <button class="delete-btn"
                        data-action="delete" data-id="${skill.id}">
                        Delete
                    </button>
                </div>
            </div>
        `).join("")
        : '<p class="empty-message">Add your first skill to begin!</p>';

    $("tasksList").innerHTML = tasks.length
        ? tasks.map(task => `
            <label class="task-item ${task.done ? "done" : ""}">
                <input type="checkbox"
                    data-id="${task.id}"
                    ${task.done ? "checked" : ""}>
                <span>${escapeHTML(task.name)}</span>
            </label>
        `).join("")
        : '<p class="empty-message">No tasks yet. Add one above!</p>';
}

// Add a new skill
$("skillForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = $("skillName").value.trim();
    const level = Number($("skillLevel").value);

    if (!name) return;

    skills.push({
        id: Date.now(),
        name,
        level
    });

    saveData();
    renderDashboard();
    this.reset();
});

// Add a new task
$("taskForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = $("taskName").value.trim();

    if (!name) return;

    tasks.push({
        id: Date.now(),
        name,
        done: false
    });

    saveData();
    renderDashboard();
    this.reset();
});

// Update or delete a skill
$("skillsList").addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    switch (button.dataset.action) {
        case "increase":
            skills = skills.map(skill =>
                skill.id === id
                    ? { ...skill, level: Math.min(100, skill.level + 25) }
                    : skill
            );
            break;

        case "reset":
            skills = skills.map(skill =>
                skill.id === id ? { ...skill, level: 0 } : skill
            );
            break;

        case "delete":
            skills = skills.filter(skill => skill.id !== id);
            break;
    }

    saveData();
    renderDashboard();
});

// Mark tasks complete or incomplete
$("tasksList").addEventListener("change", function (event) {
    if (event.target.type !== "checkbox") return;

    const id = Number(event.target.dataset.id);

    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, done: event.target.checked }
            : task
    );

    saveData();
    renderDashboard();
});

// Display saved data when the website opens
renderDashboard();
