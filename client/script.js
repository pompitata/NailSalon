document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();// Проверяем статус авторизации при загрузке страницы
    loadServices();
});

// Функция проверки статуса авторизации
async function checkAuthStatus() {
    const token = localStorage.getItem('token');  // Получаем токен из LocalStorage

    const userStatus = document.getElementById('userStatus');  // Элемент, где будет отображаться статус

    if (!token) {
        userStatus.innerHTML = '<button class="auth-btn" onclick="showAuthModal()">Войти | Зарегистрироваться</button>';
        return;
    }

    try {
        // Проверяем авторизацию, посылаем токен на сервер
        const response = await fetch('http://localhost:3000/api/protected', {
            headers: {
                'Authorization': token  // Отправляем токен в заголовках
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Авторизация успешна:", data);  // Добавьте этот лог
            // Если пользователь авторизован, показываем его имя и кнопку выхода
            userStatus.innerHTML = `
                <span>Вы вошли как: <strong>${data.user.username}</strong></span>
                <button class="logout-btn" onclick="logout()" style="margin-left: 10px;">Выйти</button>
            `;
        } else {
            console.log("Ответ от сервера: ", response.status);  // Добавьте лог
            // Если токен невалидный или отсутствует, удаляем его из LocalStorage и показываем кнопку входа
            localStorage.removeItem('token');
            userStatus.innerHTML = '<button class="auth-btn" onclick="showAuthModal()">Войти | Зарегистрироваться</button>';
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        userStatus.innerHTML = '<button class="auth-btn" onclick="showAuthModal()">Войти | Зарегистрироваться</button>';
    }
}
// Функция входа
// Отправка данных входа
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token); // Сохраняем токен в LocalStorage
            console.log("Токен сохранен в LocalStorage:", data.token);  // Добавьте этот лог
            alert('Вы успешно вошли!');
            closeAuthModal();
            checkAuthStatus();  // Обновляем статус авторизации
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
    }
});

// Функция выхода
function logout() {
    // Удаляем токен из localStorage
    localStorage.removeItem('token');

    // Очищаем поля логина и пароля
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';

    // Обновляем статус авторизации
    alert('Вы вышли из аккаунта');
    checkAuthStatus();  // Обновляем статус авторизации
}

// Открытие и закрытие модального окна для авторизации
function showAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    document.getElementById('registerModal').style.display = 'none';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Открытие и закрытие модального окна для регистрации
function showRegisterModal() {
    closeAuthModal();
    document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

// Отправка данных регистрации
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email })
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            closeRegisterModal();
            showAuthModal();
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
    }
});

// Обработчик для кнопки наши работы
document.getElementById('galleryBtn').addEventListener('click', () => {
    window.location.href = 'gallery.html';
});

function scrollToAbout() {
    const aboutSection = document.getElementById('about');
    aboutSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}


