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

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  switchModule('habits');
});

