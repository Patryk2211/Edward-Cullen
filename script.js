// State management
const state = {
  currentModule: 'habits',
  habits: JSON.parse(localStorage.getItem('habits') || '[]'),
  transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
  todos: JSON.parse(localStorage.getItem('todos') || '[]'),
  wishes: JSON.parse(localStorage.getItem('wishes') || '[]'),
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear()
};

// Utility functions
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pl-PL');
}

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
  return new Date(year, month, 1).getDay();
}

// Navigation
function initNavigation() {
  document.querySelectorAll('.navItem').forEach(item => {
    item.addEventListener('click', () => {
      const module = item.dataset.module;
      switchModule(module);
    });
  });
}

function switchModule(module) {
  state.currentModule = module;
  
  // Update active nav item
  document.querySelectorAll('.navItem').forEach(item => {
    item.classList.toggle('active', item.dataset.module === module);
  });
  
  // Hide all modules
  document.querySelectorAll('.module').forEach(m => m.classList.add('hidden'));
  
  // Show current module
  const currentModuleEl = document.getElementById(`${module}-module`);
  if (currentModuleEl) {
    currentModuleEl.classList.remove('hidden');
  }
  
  // Update title
  const titles = {
    habits: 'Habit Tracker',
    budget: 'Kosztorys',
    todo: 'TodoList',
    calendar: 'Calendar View',
    wishlist: 'WishList'
  };
  document.getElementById('moduleTitle').textContent = titles[module] || '';
  
  // Initialize module
  if (module === 'habits') initHabitsModule();
  if (module === 'budget') initBudgetModule();
  if (module === 'todo') initTodoModule();
  if (module === 'calendar') initCalendarModule();
  if (module === 'wishlist') initWishlistModule();
}

// Habit Tracker Module
function initHabitsModule() {
  renderHabits();
  
  const addHabitBtn = document.getElementById('addHabitBtn');
  const habitModal = document.getElementById('habitModal');
  const saveHabitBtn = document.getElementById('saveHabitBtn');
  const closeModal = habitModal.querySelector('.close');
  
  addHabitBtn.addEventListener('click', () => {
    habitModal.style.display = 'block';
    document.getElementById('habitName').value = '';
  });
  
  closeModal.addEventListener('click', () => {
    habitModal.style.display = 'none';
  });
  
  saveHabitBtn.addEventListener('click', () => {
    const name = document.getElementById('habitName').value.trim();
    if (name) {
      const habit = {
        id: Date.now(),
        name: name,
        completedDates: []
      };
      state.habits.push(habit);
      saveToStorage('habits', state.habits);
      renderHabits();
      habitModal.style.display = 'none';
    }
  });
}

function renderHabits() {
  const habitsList = document.getElementById('habitsList');
  habitsList.innerHTML = '';
  
  if (state.habits.length === 0) {
    habitsList.innerHTML = '<p style="text-align: center; color: #888;">Brak nawyków. Dodaj pierwszy nawyk!</p>';
    return;
  }
  
  state.habits.forEach(habit => {
    const habitCard = document.createElement('div');
    habitCard.className = 'habit-card';
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    
    let calendarHTML = '<div class="habit-calendar">';
    const daysOfWeek = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
    daysOfWeek.forEach(day => {
      calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    
    for (let i = 0; i < firstDay; i++) {
      calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isCompleted = habit.completedDates.includes(dateStr);
      const dayDate = new Date(currentYear, currentMonth, day);
      const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = dayDate.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      
      let dayClass = 'calendar-day';
      if (isCompleted) {
        dayClass += ' completed';
      } else if (isPast) {
        dayClass += ' missed';
      }
      if (isToday) {
        dayClass += ' today';
      }
      
      calendarHTML += `<div class="${dayClass}" data-date="${dateStr}" data-habit-id="${habit.id}">${day}</div>`;
    }
    
    calendarHTML += '</div>';
    
    const completedCount = habit.completedDates.length;
    const progress = Math.round((completedCount / daysInMonth) * 100);
    
    habitCard.innerHTML = `
      <div class="habit-header">
        <h3>${habit.name}</h3>
        <button class="btn-delete" data-habit-id="${habit.id}">🗑️</button>
      </div>
      ${calendarHTML}
      <div class="habit-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="progress-text">${progress}%</span>
      </div>
    `;
    
    habitsList.appendChild(habitCard);
    
    habitCard.querySelectorAll('.calendar-day:not(.empty)').forEach(dayEl => {
      dayEl.addEventListener('click', () => {
        const dateStr = dayEl.dataset.date;
        const habitId = parseInt(dayEl.dataset.habitId);
        const habit = state.habits.find(h => h.id === habitId);
        
        if (habit) {
          const index = habit.completedDates.indexOf(dateStr);
          if (index > -1) {
            habit.completedDates.splice(index, 1);
          } else {
            habit.completedDates.push(dateStr);
          }
          saveToStorage('habits', state.habits);
          renderHabits();
        }
      });
    });
    
    habitCard.querySelector('.btn-delete').addEventListener('click', () => {
      state.habits = state.habits.filter(h => h.id !== habit.id);
      saveToStorage('habits', state.habits);
      renderHabits();
    });
  });
}

// Budget Module
function initBudgetModule() {
  updateBudgetSummary();
  renderTransactions();
  renderExpenseChart();
  
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  const addIncomeBtn = document.getElementById('addIncomeBtn');
  const transactionModal = document.getElementById('transactionModal');
  const saveTransactionBtn = document.getElementById('saveTransactionBtn');
  const closeModal = transactionModal.querySelector('.close');
  
  addExpenseBtn.addEventListener('click', () => {
    transactionModal.style.display = 'block';
    document.getElementById('transactionModalTitle').textContent = 'Dodaj wydatek';
    document.getElementById('transactionAmount').value = '';
    document.getElementById('transactionDescription').value = '';
  });
  
  addIncomeBtn.addEventListener('click', () => {
    transactionModal.style.display = 'block';
    document.getElementById('transactionModalTitle').textContent = 'Dodaj przychód';
    document.getElementById('transactionAmount').value = '';
    document.getElementById('transactionDescription').value = '';
  });
  
  closeModal.addEventListener('click', () => {
    transactionModal.style.display = 'none';
  });
  
  saveTransactionBtn.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const description = document.getElementById('transactionDescription').value.trim();
    const category = document.getElementById('transactionCategory').value;
    const type = document.getElementById('transactionModalTitle').textContent.includes('wydatek') ? 'expense' : 'income';
    
    if (amount && description) {
      const transaction = {
        id: Date.now(),
        amount: amount,
        description: description,
        category: category,
        type: type,
        date: new Date().toISOString()
      };
      state.transactions.push(transaction);
      saveToStorage('transactions', state.transactions);
      updateBudgetSummary();
      renderTransactions();
      renderExpenseChart();
      transactionModal.style.display = 'none';
    }
  });
}

function updateBudgetSummary() {
  const expenses = state.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const income = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;
  
  document.getElementById('totalExpenses').textContent = expenses.toFixed(2) + ' zł';
  document.getElementById('totalIncome').textContent = income.toFixed(2) + ' zł';
  document.getElementById('balance').textContent = balance.toFixed(2) + ' zł';
  document.getElementById('balance').className = 'amount ' + (balance >= 0 ? 'income' : 'expense');
}

function renderTransactions() {
  const transactionsList = document.getElementById('transactionsList');
  transactionsList.innerHTML = '';
  
  if (state.transactions.length === 0) {
    transactionsList.innerHTML = '<p style="text-align: center; color: #888;">Brak transakcji. Dodaj pierwszą transakcję!</p>';
    return;
  }
  
  const sortedTransactions = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sortedTransactions.forEach(transaction => {
    const transactionEl = document.createElement('div');
    transactionEl.className = 'transaction-item';
    transactionEl.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-description">${transaction.description}</div>
        <div class="transaction-meta">
          <span class="transaction-category">${getCategoryName(transaction.category)}</span>
          <span class="transaction-date">${formatDate(transaction.date)}</span>
        </div>
      </div>
      <div class="transaction-amount ${transaction.type}">
        ${transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)} zł
      </div>
      <button class="btn-delete" data-transaction-id="${transaction.id}">🗑️</button>
    `;
    transactionsList.appendChild(transactionEl);
    
    transactionEl.querySelector('.btn-delete').addEventListener('click', () => {
      state.transactions = state.transactions.filter(t => t.id !== transaction.id);
      saveToStorage('transactions', state.transactions);
      updateBudgetSummary();
      renderTransactions();
      renderExpenseChart();
    });
  });
}

function renderExpenseChart() {
  const canvas = document.getElementById('expenseChart');
  const ctx = canvas.getContext('2d');
  canvas.width = 300;
  canvas.height = 300;
  
  const expenses = state.transactions.filter(t => t.type === 'expense');
  if (expenses.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Brak wydatków', canvas.width / 2, canvas.height / 2);
    return;
  }
  
  const categoryTotals = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  
  const categories = Object.keys(categoryTotals);
  const totals = Object.values(categoryTotals);
  const total = totals.reduce((sum, val) => sum + val, 0);
  
  const colors = ['#4ECDC4', '#45B7D1', '#FF6B6B', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
  
  let currentAngle = -Math.PI / 2;
  
  categories.forEach((category, index) => {
    const sliceAngle = (totals[index] / total) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    
    const labelAngle = currentAngle + sliceAngle / 2;
    const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
    const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getCategoryName(category), labelX, labelY);
    
    currentAngle += sliceAngle;
  });
}

function getCategoryName(category) {
  const names = {
    food: 'Jedzenie',
    transport: 'Transport',
    work: 'Praca',
    entertainment: 'Rozrywka',
    health: 'Zdrowie',
    shopping: 'Zakupy',
    other: 'Inne'
  };
  return names[category] || category;
}

// TodoList Module
function initTodoModule() {
  renderTodos();
  
  const addTodoBtn = document.getElementById('addTodoBtn');
  const todoModal = document.getElementById('todoModal');
  const saveTodoBtn = document.getElementById('saveTodoBtn');
  const closeModal = todoModal.querySelector('.close');
  const filterPriority = document.getElementById('filterPriority');
  const filterCategory = document.getElementById('filterCategory');
  const filterStatus = document.getElementById('filterStatus');
  const sortTodosBtn = document.getElementById('sortTodosBtn');
  
  addTodoBtn.addEventListener('click', () => {
    todoModal.style.display = 'block';
    document.getElementById('todoTitle').value = '';
    document.getElementById('todoDescription').value = '';
    document.getElementById('todoDate').value = '';
  });
  
  closeModal.addEventListener('click', () => {
    todoModal.style.display = 'none';
  });
  
  saveTodoBtn.addEventListener('click', () => {
    const title = document.getElementById('todoTitle').value.trim();
    const description = document.getElementById('todoDescription').value.trim();
    const priority = document.getElementById('todoPriority').value;
    const category = document.getElementById('todoCategory').value;
    const date = document.getElementById('todoDate').value;
    
    if (title) {
      const todo = {
        id: Date.now(),
        title: title,
        description: description,
        priority: priority,
        category: category,
        date: date || null,
        done: false
      };
      state.todos.push(todo);
      saveToStorage('todos', state.todos);
      renderTodos();
      todoModal.style.display = 'none';
    }
  });
  
  filterPriority.addEventListener('change', renderTodos);
  filterCategory.addEventListener('change', renderTodos);
  filterStatus.addEventListener('change', renderTodos);
  
  sortTodosBtn.addEventListener('click', () => {
    state.todos.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    saveToStorage('todos', state.todos);
    renderTodos();
  });
}

function renderTodos() {
  const todosList = document.getElementById('todosList');
  todosList.innerHTML = '';
  
  let filteredTodos = [...state.todos];
  
  const priorityFilter = document.getElementById('filterPriority').value;
  if (priorityFilter !== 'all') {
    filteredTodos = filteredTodos.filter(t => t.priority === priorityFilter);
  }
  
  const categoryFilter = document.getElementById('filterCategory').value;
  if (categoryFilter !== 'all') {
    filteredTodos = filteredTodos.filter(t => t.category === categoryFilter);
  }
  
  const statusFilter = document.getElementById('filterStatus').value;
  if (statusFilter === 'active') {
    filteredTodos = filteredTodos.filter(t => !t.done);
  } else if (statusFilter === 'done') {
    filteredTodos = filteredTodos.filter(t => t.done);
  }
  
  if (filteredTodos.length === 0) {
    todosList.innerHTML = '<p style="text-align: center; color: #888;">Brak zadań. Dodaj pierwsze zadanie!</p>';
    return;
  }
  
  filteredTodos.forEach(todo => {
    const todoEl = document.createElement('div');
    todoEl.className = `todo-item ${todo.done ? 'done' : ''} priority-${todo.priority}`;
    todoEl.innerHTML = `
      <div class="todo-content">
        <input type="checkbox" ${todo.done ? 'checked' : ''} data-todo-id="${todo.id}">
        <div class="todo-info">
          <div class="todo-title">${todo.title}</div>
          ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
          <div class="todo-meta">
            <span class="todo-priority">${getPriorityName(todo.priority)}</span>
            <span class="todo-category">${getCategoryNameTodo(todo.category)}</span>
            ${todo.date ? `<span class="todo-date">${formatDate(todo.date)}</span>` : ''}
          </div>
        </div>
      </div>
      <button class="btn-delete" data-todo-id="${todo.id}">🗑️</button>
    `;
    todosList.appendChild(todoEl);
    
    todoEl.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
      const todo = state.todos.find(t => t.id === parseInt(e.target.dataset.todoId));
      if (todo) {
        todo.done = e.target.checked;
        saveToStorage('todos', state.todos);
        renderTodos();
      }
    });
    
    todoEl.querySelector('.btn-delete').addEventListener('click', () => {
      state.todos = state.todos.filter(t => t.id !== todo.id);
      saveToStorage('todos', state.todos);
      renderTodos();
    });
  });
}

function getPriorityName(priority) {
  const names = {
    high: 'Wysoki',
    medium: 'Średni',
    low: 'Niski'
  };
  return names[priority] || priority;
}

function getCategoryNameTodo(category) {
  const names = {
    home: 'Dom',
    school: 'Szkoła',
    work: 'Praca'
  };
  return names[category] || category;
}

// TodoList Module
function initTodoModule() {
  renderTodos();
  
  const addTodoBtn = document.getElementById('addTodoBtn');
  const todoModal = document.getElementById('todoModal');
  const saveTodoBtn = document.getElementById('saveTodoBtn');
  const closeModal = todoModal.querySelector('.close');
  const filterPriority = document.getElementById('filterPriority');
  const filterCategory = document.getElementById('filterCategory');
  const filterStatus = document.getElementById('filterStatus');
  const sortTodosBtn = document.getElementById('sortTodosBtn');
  
  addTodoBtn.addEventListener('click', () => {
    todoModal.style.display = 'block';
    document.getElementById('todoTitle').value = '';
    document.getElementById('todoDescription').value = '';
    document.getElementById('todoDate').value = '';
  });
  
  closeModal.addEventListener('click', () => {
    todoModal.style.display = 'none';
  });
  
  saveTodoBtn.addEventListener('click', () => {
    const title = document.getElementById('todoTitle').value.trim();
    const description = document.getElementById('todoDescription').value.trim();
    const priority = document.getElementById('todoPriority').value;
    const category = document.getElementById('todoCategory').value;
    const date = document.getElementById('todoDate').value;
    
    if (title) {
      const todo = {
        id: Date.now(),
        title: title,
        description: description,
        priority: priority,
        category: category,
        date: date || null,
        done: false
      };
      state.todos.push(todo);
      saveToStorage('todos', state.todos);
      renderTodos();
      todoModal.style.display = 'none';
    }
  });
  
  filterPriority.addEventListener('change', renderTodos);
  filterCategory.addEventListener('change', renderTodos);
  filterStatus.addEventListener('change', renderTodos);
  
  sortTodosBtn.addEventListener('click', () => {
    state.todos.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    saveToStorage('todos', state.todos);
    renderTodos();
  });
}

function renderTodos() {
  const todosList = document.getElementById('todosList');
  todosList.innerHTML = '';
  
  let filteredTodos = [...state.todos];
  
  const priorityFilter = document.getElementById('filterPriority').value;
  if (priorityFilter !== 'all') {
    filteredTodos = filteredTodos.filter(t => t.priority === priorityFilter);
  }
  
  const categoryFilter = document.getElementById('filterCategory').value;
  if (categoryFilter !== 'all') {
    filteredTodos = filteredTodos.filter(t => t.category === categoryFilter);
  }
  
  const statusFilter = document.getElementById('filterStatus').value;
  if (statusFilter === 'active') {
    filteredTodos = filteredTodos.filter(t => !t.done);
  } else if (statusFilter === 'done') {
    filteredTodos = filteredTodos.filter(t => t.done);
  }
  
  if (filteredTodos.length === 0) {
    todosList.innerHTML = '<p style="text-align: center; color: #888;">Brak zadań. Dodaj pierwsze zadanie!</p>';
    return;
  }
  
  filteredTodos.forEach(todo => {
    const todoEl = document.createElement('div');
    todoEl.className = `todo-item ${todo.done ? 'done' : ''} priority-${todo.priority}`;
    todoEl.innerHTML = `
      <div class="todo-content">
        <input type="checkbox" ${todo.done ? 'checked' : ''} data-todo-id="${todo.id}">
        <div class="todo-info">
          <div class="todo-title">${todo.title}</div>
          ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
          <div class="todo-meta">
            <span class="todo-priority">${getPriorityName(todo.priority)}</span>
            <span class="todo-category">${getCategoryNameTodo(todo.category)}</span>
            ${todo.date ? `<span class="todo-date">${formatDate(todo.date)}</span>` : ''}
          </div>
        </div>
      </div>
      <button class="btn-delete" data-todo-id="${todo.id}">🗑️</button>
    `;
    todosList.appendChild(todoEl);
    
    todoEl.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
      const todo = state.todos.find(t => t.id === parseInt(e.target.dataset.todoId));
      if (todo) {
        todo.done = e.target.checked;
        saveToStorage('todos', state.todos);
        renderTodos();
      }
    });
    
    todoEl.querySelector('.btn-delete').addEventListener('click', () => {
      state.todos = state.todos.filter(t => t.id !== todo.id);
      saveToStorage('todos', state.todos);
      renderTodos();
    });
  });
}

function getPriorityName(priority) {
  const names = {
    high: 'Wysoki',
    medium: 'Średni',
    low: 'Niski'
  };
  return names[priority] || priority;
}

function getCategoryNameTodo(category) {
  const names = {
    home: 'Dom',
    school: 'Szkoła',
    work: 'Praca'
  };
  return names[category] || category;
}

// Calendar View Module
function initCalendarModule() {
  renderCalendar();
  
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  
  prevMonthBtn.addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear--;
    }
    renderCalendar();
  });
  
  nextMonthBtn.addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear++;
    }
    renderCalendar();
  });
}

function renderCalendar() {
  const calendarContainer = document.getElementById('calendarContainer');
  calendarContainer.innerHTML = '';
  
  const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  document.getElementById('calendarMonth').textContent = `${monthNames[state.currentMonth]} ${state.currentYear}`;
  
  const daysInMonth = getDaysInMonth(state.currentMonth, state.currentYear);
  const firstDay = getFirstDayOfMonth(state.currentMonth, state.currentYear);
  const daysOfWeek = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  
  daysOfWeek.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = day;
    calendarContainer.appendChild(dayHeader);
  });
  
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarContainer.appendChild(emptyDay);
  }
  
  const today = new Date();
  const isCurrentMonth = state.currentMonth === today.getMonth() && state.currentYear === today.getFullYear();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    const dayDate = new Date(state.currentYear, state.currentMonth, day);
    const dateStr = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const todosForDay = state.todos.filter(t => t.date === dateStr && !t.done);
    const todoCount = todosForDay.length;
    
    let dayClass = 'calendar-day';
    if (isCurrentMonth && day === today.getDate()) {
      dayClass += ' today';
    }
    
    dayEl.className = dayClass;
    dayEl.innerHTML = `
      <div class="calendar-day-number">${day}</div>
      ${todoCount > 0 ? `<div class="calendar-todo-count">${todoCount}</div>` : ''}
    `;
    dayEl.dataset.date = dateStr;
    
    if (todoCount > 0) {
      dayEl.addEventListener('click', () => {
        renderCalendarTodos(dateStr, todosForDay);
      });
    }
    
    calendarContainer.appendChild(dayEl);
  }
}

function renderCalendarTodos(dateStr, todos) {
  const calendarTodos = document.getElementById('calendarTodos');
  calendarTodos.innerHTML = `<h3>Zadania na ${formatDate(dateStr)}</h3>`;
  
  if (todos.length === 0) {
    calendarTodos.innerHTML += '<p style="color: #888;">Brak zadań na ten dzień.</p>';
    return;
  }
  
  todos.forEach(todo => {
    const todoEl = document.createElement('div');
    todoEl.className = `todo-item priority-${todo.priority}`;
    todoEl.innerHTML = `
      <div class="todo-content">
        <div class="todo-info">
          <div class="todo-title">${todo.title}</div>
          ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
          <div class="todo-meta">
            <span class="todo-priority">${getPriorityName(todo.priority)}</span>
            <span class="todo-category">${getCategoryNameTodo(todo.category)}</span>
          </div>
        </div>
      </div>
    `;
    calendarTodos.appendChild(todoEl);
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  switchModule('habits');
});

