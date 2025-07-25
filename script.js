// Объект для хранения предметов
const rooms = {
  'garage': [],
  'garden': [],
  'living-room': []
};

// Добавление нового предмета
function addItem(roomId) {
  const itemName = prompt(`Введите название предмета для ${getRoomName(roomId)}:`);
  if (itemName && itemName.trim() !== '') {
    rooms[roomId].push(itemName.trim());
    updateRoom(roomId);
  }
}

// Обновление отображения комнаты
function updateRoom(roomId) {
  const itemsContainer = document.getElementById(`${roomId}-items`);
  itemsContainer.innerHTML = '';

  if (rooms[roomId].length === 0) {
    itemsContainer.innerHTML = '<p class="empty-message">Пока ничего нет</p>';
    return;
  }

  rooms[roomId].forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'item';
    itemElement.innerHTML = `
      <span>${item}</span>
      <button onclick="removeItem('${roomId}', ${index})">×</button>
    `;
    itemsContainer.appendChild(itemElement);
  });
}

// Удаление предмета
function removeItem(roomId, index) {
  rooms[roomId].splice(index, 1);
  updateRoom(roomId);
}

// Получение красивого имени комнаты
function getRoomName(roomId) {
  const names = {
    'garage': 'гаража',
    'garden': 'сада',
    'living-room': 'гостиной'
  };
  return names[roomId] || roomId;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем все комнаты
  Object.keys(rooms).forEach(roomId => {
    updateRoom(roomId);
  });

  // Инициализация Telegram Web App
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.expand();
    Telegram.WebApp.MainButton.setText("Сохранить").show();
  }
});
