// ===== PASSWORD PROTECTION =====
let isAuthenticated = false;

function initializeApp() {
    if (sessionStorage.getItem('authenticated')) {
        isAuthenticated = true;
        setupApp();
    } else {
        showLoginForm();
    }
}

function showLoginForm() {
    document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #90EE90;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
            margin: 0;
            padding: 20px;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.1);
                width: 100%;
                max-width: 320px;
            ">
                <h2 style="
                    text-align: center;
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 24px;
                ">To-Do List</h2>
                
                <p style="
                    text-align: center;
                    color: #999;
                    font-size: 14px;
                    margin: 0 0 30px 0;
                ">Password protected app</p>
                
                <input 
                    type="password" 
                    id="passwordInput"
                    placeholder="Enter password"
                    style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 14px;
                        box-sizing: border-box;
                        margin-bottom: 12px;
                    "
                />
                
                <button 
                    onclick="authenticateUser()"
                    style="
                        width: 100%;
                        padding: 12px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background 0.2s;
                    "
                    onmouseover="this.style.background='#5568d3'"
                    onmouseout="this.style.background='#667eea'"
                >
                    Login
                </button>
                
                <p id="errorMsg" style="
                    color: #ff6b6b;
                    text-align: center;
                    margin-top: 12px;
                    font-size: 13px;
                    display: none;
                "></p>
            </div>
        </div>
    `;
    
    document.getElementById('passwordInput').focus();
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') authenticateUser();
    });
}

async function authenticateUser() {
    const passwordInput = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('errorMsg');
    
    if (!passwordInput) {
        errorMsg.textContent = 'Please enter a password';
        errorMsg.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passwordInput })
        });
        
        const data = await response.json();
        
        if (data.success) {
            sessionStorage.setItem('authenticated', 'true');
            isAuthenticated = true;
            location.reload();
        } else {
            errorMsg.textContent = 'Incorrect password. Try again.';
            errorMsg.style.display = 'block';
            document.getElementById('passwordInput').value = '';
            document.getElementById('passwordInput').focus();
        }
    } catch (error) {
        errorMsg.textContent = 'Error connecting to server';
        errorMsg.style.display = 'block';
        console.error('Auth error:', error);
    }
}

function setupApp() {
    // Initialize the main to-do app
    initialize();
}

// ===== END PASSWORD PROTECTION =====

// State management
let todos = [];
let currentFilter = 'all';

// Load todos from localStorage
function loadTodos() {
    if (typeof localStorage === 'undefined') return;
    const saved = localStorage.getItem('todos');
    if (saved) {
        todos = JSON.parse(saved);
    }
}

// Save todos to localStorage
function saveTodos() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Add a new todo
function addTodo(text, priority = 'medium') {
    text = text.trim();
    
    if (text === '') {
        return null;
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
        priority = 'medium';
    }

    const todo = {
        id: Date.now() + Math.random(),
        text: text,
        priority: priority,
        completed: false
    };

    todos.push(todo);
    saveTodos();
    return todo;
}

// Delete a todo
function deleteTodo(id) {
    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== id);
    const wasDeleted = todos.length < initialLength;
    saveTodos();
    return wasDeleted;
}

// Toggle todo completion status
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        return true;
    }
    return false;
}

// Update todo priority
function updateTodoPriority(id, priority) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
        return false;
    }
    
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.priority = priority;
        saveTodos();
        return true;
    }
    return false;
}

// Clear all completed todos
function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    return completedCount;
}

// Get active todos count
function getActiveTodosCount() {
    return todos.filter(todo => !todo.completed).length;
}

// Get all todos
function getAllTodos() {
    return [...todos];
}

// Filter todos based on filter type
function getFilteredTodos(filter) {
    switch (filter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        case 'all':
        default:
            return todos;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Clear all todos (for testing purposes)
function clearAllTodos() {
    todos = [];
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('todos');
    }
}

// Set todos state (for testing purposes)
function setTodos(newTodos) {
    todos = newTodos;
    saveTodos();
}

// Get current todos state
function getTodos() {
    return todos;
}

// DOM Rendering and Event Handling (only if DOM elements exist)
function initializeDOMElements() {
    const todoInput = document.getElementById('todoInput');
    const addBtn = document.getElementById('addBtn');
    const todoList = document.getElementById('todoList');
    const taskCount = document.getElementById('taskCount');
    const clearBtn = document.getElementById('clearBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (!todoInput || !addBtn || !todoList) {
        return null;
    }

    return {
        todoInput,
        addBtn,
        todoList,
        taskCount,
        clearBtn,
        filterBtns
    };
}

// Update task count display
function updateTaskCount(taskCountElement) {
    if (!taskCountElement) return;
    const activeTodos = getActiveTodosCount();
    taskCountElement.textContent = `${activeTodos} ${activeTodos === 1 ? 'task' : 'tasks'} remaining`;
}

// Render the todo list
function render(elements = null) {
    const els = elements || initializeDOMElements();
    if (!els) return;

    const filteredTodos = getFilteredTodos(currentFilter);
    
    els.todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">✓</div>
            <div class="empty-state-text">
                ${currentFilter === 'completed' ? 'No completed tasks yet' : 
                  currentFilter === 'active' ? 'No active tasks' : 
                  'No tasks yet. Add one to get started!'}
            </div>
        `;
        els.todoList.appendChild(emptyState);
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority || 'medium'}`;
            li.setAttribute('data-todo-id', todo.id);
            
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <select class="priority-picker" data-id="${todo.id}">
                    <option value="low" ${(todo.priority || 'medium') === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${(todo.priority || 'medium') === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${(todo.priority || 'medium') === 'high' ? 'selected' : ''}>High</option>
                </select>
                <button class="delete-btn" data-id="${todo.id}">Delete</button>
            `;
            
            els.todoList.appendChild(li);
        });
    }

    updateTaskCount(els.taskCount);
}

// Setup event listeners
function setupEventListeners(elements = null) {
    const els = elements || initializeDOMElements();
    if (!els) return;

    const addTodoHandler = () => {
        const text = els.todoInput.value;
        if (addTodo(text) !== null) {
            els.todoInput.value = '';
            render(els);
        }
        els.todoInput.focus();
    };

    els.addBtn.addEventListener('click', addTodoHandler);

    els.todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodoHandler();
        }
    });

    els.clearBtn.addEventListener('click', () => {
        clearCompleted();
        render(els);
    });

    els.filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            els.filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            render(els);
        });
    });

    els.todoList.addEventListener('change', (e) => {
        if (e.target.classList.contains('todo-checkbox')) {
            const id = parseFloat(e.target.dataset.id);
            toggleTodo(id);
            render(els);
        }
    });

    els.todoList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseFloat(e.target.dataset.id);
            deleteTodo(id);
            render(els);
        }
    });

    els.todoList.addEventListener('change', (e) => {
        if (e.target.classList.contains('priority-picker')) {
            const id = parseFloat(e.target.dataset.id);
            const priority = e.target.value;
            updateTodoPriority(id, priority);
            render(els);
        }
    });
}

// Initialize on page load
function initialize() {
    loadTodos();
    const elements = initializeDOMElements();
    if (elements) {
        setupEventListeners(elements);
        render(elements);
        elements.todoInput.focus();
    }
}

// Auto-initialize if script is loaded in browser
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeApp);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addTodo,
        deleteTodo,
        toggleTodo,
        updateTodoPriority,
        clearCompleted,
        getActiveTodosCount,
        getAllTodos,
        getFilteredTodos,
        escapeHtml,
        clearAllTodos,
        setTodos,
        getTodos,
        loadTodos,
        saveTodos,
        updateTaskCount,
        render,
        initialize
    };
}
