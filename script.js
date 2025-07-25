// Коллекция предметов
let items = [
  // Примеры предметов (можно удалить)
  {
    id: 1,
    name: "Старинная лампа",
    category: "living-room",
    image: "https://via.placeholder.com/300x200?text=Лампа"
  },
  {
    id: 2,
    name: "Садовые ножницы",
    category: "garden",
    image: "https://via.placeholder.com/300x200?text=Ножницы"
  }
];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  renderItems();
  
  // Инициализация Telegram Web App
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.expand();
    Telegram.WebApp.MainButton.setText("Сохранить").show();
  }
});

// Отображение всех предметов
function renderItems(filterCategory = 'all') {
  const container = document.getElementById('items-container');
  container.innerHTML = '';
  
  // Фильтрация по категории
  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(item => item.category === filterCategory);
  
  // Рендер карточек
  filteredItems.forEach(item => {
    const categoryNames = {
      'garage': 'Гараж',
      'garden': 'Сад',
      'living-room': 'Гостиная'
    };
    
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-image">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Нет+фото'">
      </div>
      <div class="item-info">
        <h3 class="item-title">${item.name}</h3>
        <div class="item-category">${categoryNames[item.category]}</div>
        <div class="item-actions">
          <span class="item-price">Детали</span>
          <i class="fas fa-ellipsis-v"></i>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Добавляем кнопку "Добавить" в конец
  const addCard = document.createElement('div');
  addCard.className = 'item-card add-item';
  addCard.onclick = showAddForm;
  addCard.innerHTML = `
    <div class="add-icon">
      <i class="fas fa-plus"></i>
    </div>
    <p>Добавить предмет</p>
  `;
  container.appendChild(addCard);
}

// Показать форму добавления
function showAddForm() {
  document.getElementById('addForm').style.display = 'flex';
}

// Скрыть форму добавления
function hideAddForm() {
  document.getElementById('addForm').style.display = 'none';
}

// Добавить новый предмет
function addNewItem() {
  const name = document.getElementById('itemName').value.trim();
  const category = document.getElementById('itemCategory').value;
  
  if (name) {
    const newItem = {
      id: Date.now(),
      name: name,
      category: category,
      image: 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(name)
    };
    
    items.push(newItem);
    renderItems();
    hideAddForm();
    document.getElementById('itemName').value = '';
  } else {
    alert('Пожалуйста, введите название предмета');
  }
}

// Фильтрация по категориям
document.querySelectorAll('.categories button').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelector('.categories button.active').classList.remove('active');
    this.classList.add('active');
    const category = this.textContent === 'Все' ? 'all' : 
                    this.textContent === 'Гараж' ? 'garage' :
                    this.textContent === 'Сад' ? 'garden' : 'living-room';
    renderItems(category);
  });
});
