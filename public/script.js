// Увеличение изображений в .product
const products = document.querySelectorAll('.product img');
products.forEach(product => {
    product.addEventListener('mouseover', () => {
        product.style.transform = 'scale(1.1)';
        product.style.transition = 'transform 0.3s ease';
    });
    product.addEventListener('mouseout', () => {
        product.style.transform = 'scale(1)';
    });
});

// Плавный переход при клике на ссылки меню
const menuLinks = document.querySelectorAll('nav ul li a');
menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Визуальный эффект при наведении на ссылки меню
menuLinks.forEach(link => {
    link.addEventListener('mouseover', () => {
        link.style.color = '#ff5733';
        link.style.backgroundColor = 'rgba(255, 87, 51, 0.2)';
        link.style.padding = '5px 10px';
        link.style.borderRadius = '5px';
        link.style.transition = 'color 0.3s ease, background-color 0.3s ease';
    });
    link.addEventListener('mouseout', () => {
        link.style.color = '';
        link.style.backgroundColor = '';
        link.style.padding = '';
        link.style.borderRadius = '';
    });
});


document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); 
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const authMessage = document.getElementById('authMessage');

    // Проверка, есть ли уже сохранённые данные
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');

    if (!savedUsername || !savedPassword) {
        // Если данных нет, сохраняем новые
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        authMessage.textContent = 'Вы успешно зарегистрировались!';
        authMessage.style.color = 'green';
    } else {
        // Проверяем данные для входа
        if (username === savedUsername && password === savedPassword) {
            authMessage.textContent = 'Вы успешно вошли!';
            authMessage.style.color = 'green';
        } else {
            authMessage.textContent = 'Неверное имя пользователя или пароль.';
            authMessage.style.color = 'red';
        }
    }

    // Очищаем поля формы
    document.getElementById('loginForm').reset();
});



// Форма заказа товара
document.getElementById("orderForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const productName = document.getElementById("productName").value;
    const quantity = document.getElementById("quantity").value;
    console.log(`Товар: ${productName}, Количество: ${quantity}`);
});

// Находим все ссылки в меню
const menuLinks = document.querySelectorAll('nav ul li a');

// Для каждой ссылки добавляем события наведения и снятия курсора
menuLinks.forEach(link => {
    link.addEventListener('mouseover', () => {
        // Меняем цвет текста и фона при наведении
        link.style.color = '#ff5733';
        link.style.backgroundColor = 'rgba(255, 87, 51, 0.2)';
        link.style.padding = '5px 10px';
        link.style.borderRadius = '5px';
        link.style.transition = 'color 0.3s ease, background-color 0.3s ease';
    });

    link.addEventListener('mouseout', () => {
        // Возвращаем оригинальные стили при снятии курсора
        link.style.color = '';
        link.style.backgroundColor = '';
        link.style.padding = '';
        link.style.borderRadius = '';
    });
});

// Найти все кнопки "Добавить в корзину"
const addToCartButtons = document.querySelectorAll('.add-to-cart');

// Найти элемент корзины
const cartItems = document.getElementById('cartItems');

// Слушатели событий для добавления товаров в корзину
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Получить данные о товаре из атрибутов
        const product = button.closest('.product');
        const productName = product.getAttribute('data-product-name');
        const productPrice = product.getAttribute('data-product-price');

        // Проверка на существование товара в корзине
        const existingCartItem = Array.from(cartItems.children).find(item => 
            item.getAttribute('data-product-name') === productName
        );

        if (existingCartItem) {
            // Увеличить количество, если товар уже в корзине
            const quantityElement = existingCartItem.querySelector('.quantity');
            quantityElement.textContent = parseInt(quantityElement.textContent) + 1;
        } else {
            // Создать новый элемент для корзины
            const cartItem = document.createElement('li');
            cartItem.setAttribute('data-product-name', productName);
            cartItem.innerHTML = `
                ${productName} - ${productPrice} руб.
                <span class="quantity">1</span>
                <button class="remove-from-cart">Удалить</button>
            `;
            cartItems.appendChild(cartItem);

            // Добавить обработчик для кнопки "Удалить"
            const removeButton = cartItem.querySelector('.remove-from-cart');
            removeButton.addEventListener('click', () => {
                cartItem.remove();
            });
        }
    });
});

// Обработчик кнопки "Оформить заказ"
const checkoutButton = document.getElementById('checkoutButton');
checkoutButton.addEventListener('click', () => {
    const items = Array.from(cartItems.children).map(item => ({
        name: item.getAttribute('data-product-name'),
        quantity: parseInt(item.querySelector('.quantity').textContent),
    }));

    console.log('Оформление заказа:', items);

    if (items.length === 0) {
        alert('Корзина пуста.');
    } else {
        alert('Заказ оформлен! Проверьте консоль для деталей.');
        cartItems.innerHTML = ''; // Очистить корзину после оформления заказа
    }
});

