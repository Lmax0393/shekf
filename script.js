// Состояние приложения
const AppState = {
  items: [],
  currentAddMethod: 'manual',
  capturedPhoto: null,
  cameraStream: null,
  currentCategory: 'all'
};

// Константы
const CATEGORY_NAMES = {
  'garage': 'Гараж',
  'garden': 'Сад',
  'living-room': 'Гостиная'
};

// DOM элементы
const DOM = {
  itemsContainer: document.getElementById('items-container'),
  addForm: document.getElementById('addForm'),
  manualForm: document.getElementById('manualForm'),
  cameraForm: document.getElementById('cameraForm'),
  videoElement: document.getElementById('video'),
  canvasElement: document.getElementById('canvas'),
  itemNameInput: document.getElementById('itemName'),
  itemCategorySelect: document.getElementById('itemCategory'),
  categoryButtons: document.querySelectorAll('.categories button')
};

// Инициализация приложения
function initApp() {
  renderItems();
  setupEventListeners();
  
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.expand();
    Telegram.WebApp.MainButton.setText("Сохранить").show();
  }
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Фильтрация по категориям
  DOM.categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.textContent === 'Все' ? 'all' : 
                      btn.textContent === 'Гараж' ? 'garage' :
                      btn.textContent === 'Сад' ? 'garden' : 'living-room';
      
      AppState.currentCategory = category;
      renderItems();
    });
  });
}

// Работа с камерой
const Camera = {
  async init() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Камера не поддерживается в вашем браузере');
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      AppState.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      DOM.videoElement.srcObject = AppState.cameraStream;
      
      return true;
    } catch (error) {
      console.error('Ошибка инициализации камеры:', error);
      alert(`Не удалось получить доступ к камере: ${error.message}`);
      return false;
    }
  },

  capture() {
    if (!AppState.cameraStream) {
      alert('Сначала активируйте камеру');
      return null;
    }

    const video = DOM.videoElement;
    const canvas = DOM.canvasElement;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Зеркальное отображение для фронтальной камеры
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg');
  },

  stop() {
    if (AppState.cameraStream) {
      AppState.cameraStream.getTracks().forEach(track => track.stop());
      AppState.cameraStream = null;
    }
  }
};

// Управление интерфейсом
const UI = {
  showAddForm() {
    DOM.addForm.style.display = 'flex';
  },

  hideAddForm() {
    DOM.addForm.style.display = 'none';
    Camera.stop();
  },

  setAddMethod(method) {
    AppState.currentAddMethod = method;
    document.querySelectorAll('.method-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    DOM.manualForm.style.display = method === 'manual' ? 'block' : 'none';
    DOM.cameraForm.style.display = method === 'camera' ? 'block' : 'none';

    if (method === 'camera') {
      Camera.init();
    } else {
      Camera.stop();
    }
  },

  renderItems() {
    DOM.itemsContainer.innerHTML = '';

    const filteredItems = AppState.currentCategory === 'all' 
      ? AppState.items 
      : AppState.items.filter(item => item.category === AppState.currentCategory);

    if (filteredItems.length === 0) {
      DOM.itemsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>Пока нет предметов</p>
        </div>
      `;
      return;
    }

    filteredItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}" 
               onerror="this.src='https://via.placeholder.com/300x200?text=Нет+фото'">
        </div>
        <div class="item-info">
          <h3 class="item-title">${item.name}</h3>
          <div class="item-category">${CATEGORY_NAMES[item.category]}</div>
          <div class="item-actions">
            <button class="delete-btn" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
      DOM.itemsContainer.appendChild(card);
    });

    // Кнопка добавления
    const addCard = document.createElement('div');
    addCard.className = 'item-card add-item';
    addCard.onclick = UI.showAddForm;
    addCard.innerHTML = `
      <div class="add-icon">
        <i class="fas fa-plus"></i>
      </div>
      <p>Добавить предмет</p>
    `;
    DOM.itemsContainer.appendChild(addCard);

    // Назначение обработчиков удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        AppState.items = AppState.items.filter(item => item.id !== id);
        UI.renderItems();
      });
    });
  }
};

// Обработка добавления предметов
function handleAddItem() {
  if (AppState.currentAddMethod === 'camera') {
    AppState.capturedPhoto = Camera.capture();
    if (!AppState.capturedPhoto) return;
  }

  let name, category;
  
  if (AppState.currentAddMethod === 'manual') {
    name = DOM.itemNameInput.value.trim();
    if (!name) {
      alert('Пожалуйста, введите название предмета');
      return;
    }
  } else {
    name = `Объект #${AppState.items.length + 1}`;
  }

  category = DOM.itemCategorySelect.value;

  const newItem = {
    id: Date.now(),
    name: name,
    category: category,
    image: AppState.currentAddMethod === 'camera' 
      ? AppState.capturedPhoto 
      : `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`
  };

  AppState.items.push(newItem);
  UI.renderItems();
  UI.hideAddForm();
  
  // Сброс формы
  DOM.itemNameInput.value = '';
  AppState.capturedPhoto = null;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Назначение глобальных обработчиков
  document.querySelector('.close-btn').addEventListener('click', UI.hideAddForm);
  document.querySelector('#addForm button').addEventListener('click', handleAddItem);
  
  // Инициализация приложения
  initApp();
});
