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

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  switchModule('habits');
});

