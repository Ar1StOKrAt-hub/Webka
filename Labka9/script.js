'use strict';

// ==========================================
// 1. UI ЛОГІКА (Таби, Глазик, Вибір міст)
// ==========================================

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

const togglePasswords = document.querySelectorAll('.toggle-password');
togglePasswords.forEach(icon => {
    icon.addEventListener('click', function() {
        const input = this.previousElementSibling; 
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '🙈'; 
        } else {
            input.type = 'password';
            this.textContent = '👁️';
        }
    });
});

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
        citySelect.innerHTML = '<option value="">Choose city...</option>'; 
        
        if (selectedCountry && citiesMap[selectedCountry]) {
            citySelect.disabled = false; 
            citiesMap[selectedCountry].forEach(city => {
                const option = document.createElement('option');
                option.value = city.toLowerCase();
                option.textContent = city;
                citySelect.appendChild(option);
            });
        } else {
            citySelect.disabled = true; 
        }
    });
}

// ==========================================
// 2. ЛОГІКА ВАЛІДАЦІЇ ТА ВІДПРАВКИ
// ==========================================

const validators = {
    name: (val) => {
        if (val.length < 3 || val.length > 15) return 'Має бути від 3 до 15 символів';
        return ''; 
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
        today.setHours(0, 0, 0, 0); 
        
        if (birthDate > today) return 'Дата не може бути у майбутньому';
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 12) return 'Вам має бути більше 12 років для реєстрації';
        return '';
    },
    // ОСЬ ЦЯ ФУНКЦІЯ БУЛА ЗАГУБЛЕНА!
    required: (val) => {
        if (!val.trim()) return 'Це поле є обов\'язковим';
        return '';
    }
};

// Більш надійна функція для відображення помилок
const setFieldState = (input, errorMessage) => {
    // Шукаємо помилку не в parentElement, а вище - в .input-group
    const errorDiv = input.closest('.input-group').querySelector('.error-message');
    
    input.classList.remove('is-valid', 'is-invalid');
    
    if (errorMessage) {
        input.classList.add('is-invalid');
        if(errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = '#e74c3c'; // Червоний
        }
        return false; 
    } else {
        input.classList.add('is-valid');
        if(errorDiv) {
            errorDiv.textContent = 'Looks good!';
            errorDiv.style.color = '#2ecc71'; // Зелений
        }
        return true; 
    }
};

// Обробка форми реєстрації
const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    
    let isValid = true;
    
    const fNameValid = setFieldState(signupForm.firstName, validators.name(signupForm.firstName.value));
    const lNameValid = setFieldState(signupForm.lastName, validators.name(signupForm.lastName.value));
    const usernameValid = setFieldState(signupForm.username, validators.required(signupForm.username.value));
    const emailValid = setFieldState(signupForm.email, validators.email(signupForm.email.value));
    const phoneValid = setFieldState(signupForm.phone, validators.phone(signupForm.phone.value));
    const dobValid = setFieldState(signupForm.dob, validators.dob(signupForm.dob.value));
    const countryValid = setFieldState(signupForm.country, validators.required(signupForm.country.value));
    const cityValid = setFieldState(signupForm.city, validators.required(signupForm.city.value));
    
    // Перевірка радіо кнопок
    const sexRadios = signupForm.querySelectorAll('input[name="sex"]');
    let sexSelected = false;
    sexRadios.forEach(radio => { if (radio.checked) sexSelected = true; });
    const sexWrapper = sexRadios[0].closest('.input-group').querySelector('.error-message');
    if (!sexSelected) {
        sexWrapper.textContent = 'Оберіть стать';
        sexWrapper.style.color = '#e74c3c';
        isValid = false;
    } else {
        sexWrapper.textContent = 'Looks good!';
        sexWrapper.style.color = '#2ecc71';
    }

    // Перевірка паролів
    const pass1 = signupForm.password.value;
    const pass2 = signupForm.confirmPassword.value;
    const pass1Valid = setFieldState(signupForm.password, validators.password(pass1));
    
    let pass2Error = '';
    if (pass2 !== pass1) pass2Error = 'Паролі не збігаються';
    else if (!pass2) pass2Error = 'Підтвердіть пароль';
    const pass2Valid = setFieldState(signupForm.confirmPassword, pass2Error);

    isValid = fNameValid && lNameValid && usernameValid && emailValid && phoneValid && dobValid && countryValid && cityValid && pass1Valid && pass2Valid && sexSelected;

    if (isValid) {
        submitFormData(signupForm, 'успішно зареєстровано');
    }
});

// Обробка форми входу
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userValid = setFieldState(loginForm.loginUsername, validators.required(loginForm.loginUsername.value));
    const passValid = setFieldState(loginForm.loginPassword, validators.password(loginForm.loginPassword.value));
    
    if (userValid && passValid) {
        submitFormData(loginForm, 'успішно авторизовано');
    }
});

function submitFormData(formElement, successActionText) {
    const formData = new FormData(formElement);
    
    console.log(`--- Дані форми ${formElement.id} ---`);
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    const successMsg = document.getElementById('success-msg');
    successMsg.textContent = `Вас ${successActionText}!`;
    successMsg.classList.remove('hidden');
    
    setTimeout(() => {
        successMsg.classList.add('hidden');
        formElement.reset(); 
        
        formElement.querySelectorAll('.is-valid, .is-invalid').forEach(el => el.classList.remove('is-valid', 'is-invalid'));
        formElement.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        if(formElement.id === 'signup-form') document.getElementById('city').disabled = true;
    }, 3000);
}