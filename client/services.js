document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();// Проверяем статус авторизации при загрузке страницы
    loadServices();
});
/// Загружаем услуги с сервера
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const services = await response.json();

        // Отладочная информация, чтобы проверить, что получаем от сервера
        console.log(services);

        const servicesList = document.getElementById('servicesList');
        if (!servicesList) {
            console.error('Элемент servicesList не найден!');
            return;
        }

        if (services.length === 0) {
            servicesList.innerHTML = '<p>Услуги не найдены.</p>';
            return;
        }

        // Формируем HTML для каждой услуги
        servicesList.innerHTML = services.map(service => `
    <div class="service-item">
        <h3>${service.name}</h3>
        <div class="description-block">
            <p class="service-description">${service.description}</p>
        </div>
        <span class="price">${service.price} руб.</span>
        <span class="duration">${service.duration} минут</span>
    </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка при загрузке услуг:', error);
    }
}

async function checkAuthStatus() {
    const token = localStorage.getItem('token'); // Получаем токен из LocalStorage

    const userStatus = document.getElementById('userStatus');  // Элемент, где будет отображаться статус

    if (!userStatus) {
        console.error('Элемент userStatus не найден!');
        return;
    }

    if (!token) {
        // Если нет токена, показываем кнопку для входа или регистрации
        userStatus.innerHTML = '<button onclick="showAuthModal()">Войти | Зарегистрироваться</button>';
        return;
    }

    try {
        // Проверяем авторизацию, посылаем токен на сервер
        const response = await fetch('/api/protected', {
            headers: {
                'Authorization': token  // Отправляем токен в заголовках
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Если пользователь авторизован, показываем его имя и кнопку выхода
            userStatus.innerHTML = `
                <span>Вы вошли как: <strong>${data.user.username}</strong></span>
                <button onclick="logout()" style="margin-left: 10px;">Выйти</button>
            `;
        } else {
            // Если токен невалидный или отсутствует, удаляем его из LocalStorage и показываем кнопку входа
            localStorage.removeItem('token');
            userStatus.innerHTML = '<button onclick="showAuthModal()">Войти | Зарегистрироваться</button>';
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        userStatus.innerHTML = '<button onclick="showAuthModal()">Войти | Зарегистрироваться</button>';
    }
}



// Функция для закрытия модального окна с услугами
function closeServicesModal() {
    document.getElementById('servicesModal').style.display = 'none';
}