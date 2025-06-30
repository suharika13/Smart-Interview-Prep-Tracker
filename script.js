document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  initDragAndDrop();
  updateChart();
});

function addTask(columnId) {
  const taskText = prompt("Enter task:");
  if (!taskText) return;

  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.innerText = taskText;

  document.getElementById(`${columnId}-list`).appendChild(task);
  saveTasks();
  initDragAndDrop();
  updateChart();
}

function saveTasks() {
  const columns = ["todo", "in-progress", "done"];
  const data = {};
  columns.forEach(col => {
    const list = document.getElementById(`${col}-list`);
    data[col] = Array.from(list.children).map(item => item.innerText);
  });
  localStorage.setItem("kanbanTasks", JSON.stringify(data));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem("kanbanTasks")) || {};
  Object.entries(data).forEach(([col, tasks]) => {
    const list = document.getElementById(`${col}-list`);
    list.innerHTML = '';
    tasks.forEach(text => {
      const task = document.createElement("div");
      task.className = "task";
      task.draggable = true;
      task.innerText = text;
      list.appendChild(task);
    });
  });
  initDragAndDrop();
  updateChart();
}

function initDragAndDrop() {
  const tasks = document.querySelectorAll(".task");
  const lists = document.querySelectorAll(".task-list");

  tasks.forEach(task => {
    task.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", task.innerText);
      task.classList.add("dragging");
    });

    task.addEventListener("dragend", e => {
      task.classList.remove("dragging");
    });
  });

  lists.forEach(list => {
    list.addEventListener("dragover", e => {
      e.preventDefault();
    });

    list.addEventListener("drop", e => {
      e.preventDefault();
      const data = e.dataTransfer.getData("text/plain");
      const newTask = document.createElement("div");
      newTask.className = "task";
      newTask.draggable = true;
      newTask.innerText = data;
      list.appendChild(newTask);
      saveTasks();
      initDragAndDrop();
      updateChart();
    });
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function exportTasks() {
  const dataStr = localStorage.getItem("kanbanTasks");
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "prep-tracker.json";
  a.click();
}

function importTasks(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    localStorage.setItem("kanbanTasks", e.target.result);
    loadTasks();
  };
  reader.readAsText(file);
}

let chart;
function updateChart() {
  const data = JSON.parse(localStorage.getItem("kanbanTasks")) || {};
  const counts = ["todo", "in-progress", "done"].map(col => data[col]?.length || 0);

  if (chart) chart.destroy();
  const ctx = document.getElementById("progressChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["To Do", "In Progress", "Done"],
      datasets: [{
        data: counts,
        backgroundColor: ["#f39c12", "#3498db", "#2ecc71"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
