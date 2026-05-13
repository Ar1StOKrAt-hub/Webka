'use strict';

// ==========================================
// 1. UI ЛОГІКА (Таби, Глазик, Вибір міст)
// ==========================================

// --- Перемикання табів (Signup / Login) ---
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Знімаємо активний клас з усіх
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Додаємо активний клас натиснутому
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// --- Показати/Сховати пароль (Глазик) ---
const togglePasswords = document.querySelectorAll('.toggle-password');
togglePasswords.forEach(icon => {
    icon.addEventListener('click', function() {
        const input = this.previousElementSibling; // Знаходимо input перед глазиком
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '🙈'; // Змінюємо іконку
        } else {
            input.type = 'password';
            this.textContent = '👁️';
        }
    });
});

// --- Залежні списки (Країна -> Місто) ---
const countrySelect = document.getElementById('country');
const citySelect = document.getElementById('city');

const citiesMap = {
    ukraine: ['Київ', 'Львів', 'Чернівці', 'Одеса'],
    usa: ['New York', 'Los Angeles', 'Chicago'],
    uk: ['London', 'Manchester', 'Liverpool']
};

if (countrySelect && citySelect) {
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        citySelect.innerHTML = '<option value="">Choose city...</option>'; // Очищаємо старі міста
        
        if (selectedCountry && citiesMap[selectedCountry]) {
            citySelect.disabled = false; // Розблоковуємо поле
            citiesMap[selectedCountry].forEach(city => {
                const option = document.createElement('option');
                option.value = city.toLowerCase();
                option.textContent = city;
                citySelect.appendChild(option);
            });
        } else {
            citySelect.disabled = true; // Блокуємо, якщо країну не обрано
        }
    });
}

// ==========================================
// 2. ЛОГІКА ВАЛІДАЦІЇ ТА ВІДПРАВКИ
// ==========================================

// Функції перевірки (RegEx та інші правила)
const validators = {
    name: (val) => {
        if (val.length < 3 || val.length > 15) return 'Має бути від 3 до 15 символів';
        return ''; // Пустий рядок означає, що помилок немає
    },
    email: (val) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(val)) return 'Невірний формат email (потрібно @ та .)';
        return '';
    },
    phone: (val) => {
        const regex = /^\+380\d{9}$/;
        if (!regex.test(val)) return 'Формат має бути +380XXXXXXXXX';
        return '';
    },
    password: (val) => {
        if (val.length < 6) return 'Пароль має містити мінімум 6 символів';
        return '';
    },
    dob: (val) => {
        if (!val) return 'Оберіть дату народження';
        
        const birthDate = new Date(val);
        const today = new Date();
        // ОБОВ'ЯЗКОВО: обнуляємо години, хвилини, секунди для точного порівняння
        today.setHours(0, 0, 0, 0); 
        
        // Перевірка на майбутнє
        if (birthDate > today) {
            return 'Дата не може бути у майбутньому';
        }
        
        // Вираховуємо вік
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        // Перевірка на вік
        if (age < 12) {
            return 'Вам має бути більше 12 років для реєстрації';
        }
        
        return '';
    },
};

// Функція для відображення помилок на екрані
const setFieldState = (input, errorMessage) => {
    const errorDiv = input.parentElement.querySelector('.error-message');
    
    // Скидаємо попередні класи
    input.classList.remove('is-valid', 'is-invalid');
    
    if (errorMessage) {
        input.classList.add('is-invalid');
        if(errorDiv) errorDiv.textContent = errorMessage;
        return false; // Поле не валідне
    } else {
        input.classList.add('is-valid');
        if(errorDiv) errorDiv.textContent = '';
        return true; // Поле валідне
    }
};

// Обробка форми реєстрації (Signup)
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Зупиняємо перезавантаження сторінки
    
    let isValid = true;
    
    // Перевіряємо кожне поле
    const fNameValid = setFieldState(signupForm.firstName, validators.name(signupForm.firstName.value));
    const lNameValid = setFieldState(signupForm.lastName, validators.name(signupForm.lastName.value));
    const usernameValid = setFieldState(signupForm.username, validators.required(signupForm.username.value));
    const emailValid = setFieldState(signupForm.email, validators.email(signupForm.email.value));
    const phoneValid = setFieldState(signupForm.phone, validators.phone(signupForm.phone.value));
    const dobValid = setFieldState(signupForm.dob, validators.dob(signupForm.dob.value));
    const countryValid = setFieldState(signupForm.country, validators.required(signupForm.country.value));
    const cityValid = setFieldState(signupForm.city, validators.required(signupForm.city.value));
    
    // Перевірка радіо кнопок (Стать)
    const sexRadios = signupForm.querySelectorAll('input[name="sex"]');
    let sexSelected = false;
    sexRadios.forEach(radio => { if (radio.checked) sexSelected = true; });
    const sexWrapper = sexRadios[0].closest('.input-group').querySelector('.error-message');
    if (!sexSelected) {
        sexWrapper.textContent = 'Оберіть стать';
        isValid = false;
    } else {
        sexWrapper.textContent = '';
    }

    // Перевірка паролів (повинні збігатися)
    const pass1 = signupForm.password.value;
    const pass2 = signupForm.confirmPassword.value;
    const pass1Valid = setFieldState(signupForm.password, validators.password(pass1));
    
    let pass2Error = '';
    if (pass2 !== pass1) pass2Error = 'Паролі не збігаються';
    else if (!pass2) pass2Error = 'Підтвердіть пароль';
    const pass2Valid = setFieldState(signupForm.confirmPassword, pass2Error);

    // Підсумкова перевірка
    isValid = fNameValid && lNameValid && emailValid && phoneValid && dobValid && countryValid && cityValid && pass1Valid && pass2Valid && sexSelected;

    if (isValid) {
        submitFormData(signupForm, 'успішно зареєстровано');
    }
});

// Обробка форми входу (Login)
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userValid = setFieldState(loginForm.loginUsername, validators.required(loginForm.loginUsername.value));
    const passValid = setFieldState(loginForm.loginPassword, validators.password(loginForm.loginPassword.value));
    
    if (userValid && passValid) {
        submitFormData(loginForm, 'успішно авторизовано');
    }
});

// Головна функція відправки (FormData)
function submitFormData(formElement, successActionText) {
    // Збираємо всі дані форми в один об'єкт (як вимагається в завданні)
    const formData = new FormData(formElement);
    
    // Для перевірки можемо вивести зібрані дані в консоль
    console.log(`--- Дані форми ${formElement.id} ---`);
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    // Показуємо повідомлення про успіх
    const successMsg = document.getElementById('success-msg');
    successMsg.textContent = `Вас ${successActionText}!`;
    successMsg.classList.remove('hidden');
    
    // Ховаємо повідомлення через 3 секунди і очищаємо форму
    setTimeout(() => {
        successMsg.classList.add('hidden');
        formElement.reset(); // Очищаємо поля
        
        // Знімаємо зелені рамки
        formElement.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
        
        // Блокуємо назад поле вибору міста у реєстрації
        if(formElement.id === 'signup-form') document.getElementById('city').disabled = true;
    }, 3000);
}