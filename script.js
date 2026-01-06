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
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
});

