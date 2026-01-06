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

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  switchModule('habits');
});

