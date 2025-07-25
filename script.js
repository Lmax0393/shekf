// Коллекция предметов
let items = [];
let currentAddMethod = 'manual';
let capturedPhoto = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  renderItems();
  initCamera();
  
  // Инициализация Telegram Web App
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.expand();
    Telegram.WebApp.MainButton.setText("Сохранить").show();
  }
});

// Инициализация камеры
function initCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn("Камера не поддерживается");
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      const video = document.getElementById('video');
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Ошибка доступа к камере:", err);
      alert("Не удалось получить доступ к камере");
    });
}

// Сделать фото
function capturePhoto() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  capturedPhoto = canvas.toDataURL('image/jpeg');
  alert("Фото сделано! Теперь нажмите 'Добавить'");
}

// Установить метод добавления
function setAddMethod(method) {
  currentAddMethod = method;
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  document.getElementById('manualForm').style.display = method === 'manual' ? 'block' : 'none';
  document.getElementById('cameraForm').style.display = method === 'camera' ? 'block' : 'none';
}

// Добавить новый предмет
function addNewItem() {
  if (currentAddMethod === 'camera' && !capturedPhoto) {
    alert("Сначала сделайте фото!");
    return;
  }

  let name, category;
  
  if (currentAddMethod === 'manual') {
    name = document.getElementById('itemName').value.trim();
    category = document.getElementById('itemCategory').value;
  } else {
    // Автогенерация названия для сканированных предметов
    name = "Объект #" + (items.length + 1);
    category = document.getElementById('itemCategory').value;
  }

  if (currentAddMethod === 'manual' && !name) {
    alert("Пожалуйста, введите название предмета");
    return;
  }

  const newItem = {
    id: Date.now(),
    name: name,
    category: category,
    image: currentAddMethod === 'camera' ? capturedPhoto : 
          'https://via.placeholder.com/300x200?text=' + encodeURIComponent(name)
  };

  items.push(newItem);
  renderItems();
  hideAddForm();
  
  // Сброс формы
  document.getElementById('itemName').value = '';
  capturedPhoto = null;
}

// Остальные функции (renderItems, showAddForm, hideAddForm, фильтрация)
// остаются такими же как в предыдущей версии
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
