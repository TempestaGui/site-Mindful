document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('tasks-list');
    const filterTasks = document.getElementById('filter-tasks');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Estado da aplicação
    let tasks = loadTasksFromLocalStorage();

    // Inicializar a aplicação
    
    renderTasks();
    updateEmptyState();
    // Event Listeners
    taskForm.addEventListener('submit', addTask);
    filterTasks.addEventListener('change', renderTasks);

    // Carregar as tarefas do localStorage
    function loadTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            try {
                return JSON.parse(savedTasks);
            } catch (error) {
                console.error('ERRO AO CARREGAR TAREFAS DO LOCALSTORAGE', error);
                return [];
            }
        }
        return [];
    }

    // Salvar as tarefas no localStorage
    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Adicionar uma tarefa
    function addTask(event) {
        event.preventDefault();

        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const dateInput = document.getElementById('task-date');
        const timeInput = document.getElementById('task-time');

        const newTask = {
            id: Date.now().toString(),
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            date: dateInput.value,
            time: timeInput.value,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        tasks.push(newTask);
        saveTasksToLocalStorage();

        // Limpar formulário
        taskForm.reset();

        // Atualizar UI
        updateEmptyState();
        renderTasks();
        showToast('Atividade adicionada com sucesso!');
    }

    // Marcar uma tarefa como concluída ou pendente
    function toggleTaskStatus(taskID) {
        tasks = tasks.map(task => {
            if (task.id === taskID) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });

        saveTasksToLocalStorage();
        renderTasks();

        const task = tasks.find(t => t.id === taskID);
        const status = task.completed ? 'concluída' : 'pendente';
        showToast(`Atividade marcada como ${status}!`);
    }

    // Remover uma tarefa
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToLocalStorage();
        updateEmptyState();
        renderTasks();
        showToast('Atividade removida com sucesso!');
    }

    // Atualizar o estado vazio
    function updateEmptyState() {
        if (tasks.length === 0) {
            taskList.innerHTML = '<p class="empty-state">Nenhuma tarefa adicionada ainda.</p>';
        } else {
            taskList.innerHTML = '';
        }
    }

    // Renderizar as tarefas na UI
    function renderTasks() {
        const filterValue = filterTasks.value;
        let filteredTasks = tasks.filter(task => {
            if (filterValue === 'pending') return !task.completed;
            if (filterValue === 'completed') return task.completed;
            return true;
        });

        // Ordenar tarefas por data/hora
        filteredTasks.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        // Limpar lista antes de renderizar
        taskList.innerHTML = '';
        if (filteredTasks.length === 0) {
            updateEmptyState();
            return;
        }

        // Renderizar cada tarefa
        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    // Criar um elemento DOM para uma tarefa
    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;

        // Formatar data
        const taskDate = new Date(task.date);
        const formattedDate = taskDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        taskElement.innerHTML = `
            <div class="task-tile"> ${task.title}</div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <span class="task-date-time">${formattedDate} às ${task.time}</span>
                <span class="task-status">${task.completed ? 'Concluída' : 'Pendente'}</span>
            </div>
            <div class="task-actions">
            
                <button class="task-action-btn complete">${task.completed ? 'Desmarcar' : 'Concluir'}</button>
                <button class="task-action-btn delete">Excluir</button>
            </div>
        `;

        // Adicionar event listeners aos botões
        taskElement.querySelector('.task-action-btn.complete').addEventListener('click', () => toggleTaskStatus(task.id));
        taskElement.querySelector('.task-action-btn.delete').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir essa atividade?')) deleteTask(task.id);
        });

        return taskElement;
    }

    // Exibir mensagem de toast
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
});
