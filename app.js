// --- Configuration ---
const LIFF_ID = 'YOUR_LIFF_ID'; // Replace with your real LIFF ID

// --- State ---
let currentStep = 1;
const totalSteps = 7;
const formData = {};

// --- LIFF Initialization ---
async function initializeLiff() {
    try {
        await liff.init({ liffId: LIFF_ID });
        console.log('LIFF Initialized');
        if (!liff.isLoggedIn()) {
            // Uncomment if login is required
            // liff.login();
        }
    } catch (err) {
        console.warn('LIFF Initialization failed. Operating in browser-only mode.', err);
    }
}

// --- Navigation Logic ---
function updateNavigation() {
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    // Show/hide sections
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.dataset.step) === currentStep) {
            step.classList.add('active');
        }
    });

    // Button visibility
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (currentStep === 1) {
        prevBtn.classList.add('hidden');
    } else {
        prevBtn.classList.remove('hidden');
    }

    if (currentStep === totalSteps) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
        generateConfirmation();
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }

    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleNext() {
    if (validateStep(currentStep)) {
        saveStepData(currentStep);
        if (currentStep < totalSteps) {
            currentStep++;
            updateNavigation();
        }
    }
}

function handlePrev() {
    if (currentStep > 1) {
        currentStep--;
        updateNavigation();
    }
}

// --- Validation & Data Saving ---
function validateStep(step) {
    const activeSection = document.querySelector(`.form-step[data-step="${step}"]`);
    const requiredInputs = activeSection.querySelectorAll('[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            const name = input.name;
            const checked = activeSection.querySelector(`input[name="${name}"]:checked`);
            if (!checked) {
                isValid = false;
                input.closest('.input-group').style.borderColor = 'var(--error-color)';
            } else {
                input.closest('.input-group').style.borderColor = 'var(--border-color)';
            }
        } else if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = 'var(--error-color)';
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });

    if (!isValid) {
        alert('必須項目を入力してください。');
    }
    return isValid;
}

function saveStepData(step) {
    const activeSection = document.querySelector(`.form-step[data-step="${step}"]`);
    const inputs = activeSection.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) formData[input.name] = input.value;
        } else if (input.type === 'checkbox') {
            if (!formData[input.name] || step !== getStepOfInput(input)) {
                // Reset checkbox array if we are re-entering the step or it doesn't exist
                // Actually, just managing it simply:
            }
            const checkedBoxes = activeSection.querySelectorAll(`input[name="${input.name}"]:checked`);
            formData[input.name] = Array.from(checkedBoxes).map(cb => cb.value);
        } else {
            formData[input.name] = input.value;
        }
    });
}

function getStepOfInput(input) {
    return parseInt(input.closest('.form-step').dataset.step);
}

// --- Confirmation Page ---
function generateConfirmation() {
    const view = document.getElementById('confirmation-view');
    const labels = {
        'name': 'お名前（漢字）',
        'phone': '電話番号',
        'patient-condition': '患者様の状態',
        'weight': '体重',
        'drug-allergy': '薬のアレルギー',
        'food-allergy': '食物アレルギー',
        'side-effect': '副作用歴',
        'current-presc': '他での処方',
        'otc-list': '使用中の市販薬・サプリ',
        'otc-suppl-detail': '市販薬詳細',
        'food-drink': '日常的な飲食物',
        'food-drink-detail': '飲食物詳細',
        'history': '既往歴',
        'driving': '運転の有無',
        'height-work': '高所作業の有無',
        'soft-contact': 'ソフトコンタクト',
        'generic': 'ジェネリック希望'
    };

    const otcLabels = {
        'cold': '風邪薬', 'pain': '痛み止め', 'stomach': '胃腸薬', 'eye': '目薬',
        'vitamin': 'ビタミン類', 'multi-mineral': 'マルチミネラル', 'iron': '鉄', 'zinc': '亜鉛', 
        'calcium': 'カルシウム', 'magnesium': 'マグネシウム', 'dha-epa': 'DHA・EPA',
        'protein': 'プロテイン', 'other': 'その他'
    };
    
    const foodDrinkLabels = {
        'coffee-tea': 'コーヒー・紅茶', 'grapefruit': 'グレープフルーツジュース', 
        'dairy': '乳製品', 'other': 'その他'
    };
    
    const conditionLabels = {
        'none': '該当なし', 'pregnant': '妊娠中(可能性あり)', 
        'breastfeeding': '授乳中', 'pediatric': '小児(15歳未満)'
    };

    let html = '';
    for (let key in labels) {
        if (formData[key] !== undefined && formData[key] !== '') {
            let value = formData[key];
            if (Array.isArray(value)) {
                if (key === 'otc-list') {
                    value = value.map(v => otcLabels[v] || v).join(', ');
                } else if (key === 'food-drink') {
                    value = value.map(v => foodDrinkLabels[v] || v).join(', ');
                } else {
                    value = value.join(', ');
                }
            }
            if (key === 'weight') value += ' kg';
            if (key === 'patient-condition') value = conditionLabels[value] || value;
            if (value === 'yes') value = 'あり/する';
            if (value === 'no') value = 'なし/しない';
            
            if (value) {
                html += `<div class="conf-item">
                    <span class="conf-label">${labels[key]}</span>
                    <span class="conf-value">${value}</span>
                </div>`;
            }
        }
    }
    view.innerHTML = html;
}

// --- Submission ---
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!document.getElementById('agree').checked) {
        alert('個人情報の取り扱いに同意してください。');
        return;
    }

    // Prepare message
    const condStr = (formData['patient-condition'] !== 'none') ? `\n状態: ${formData['patient-condition']} (体重: ${formData.weight || '-'}kg)` : '\n状態: 該当なし';
    const message = `【初回問診票回答】\n氏名: ${formData.name}\n電話: ${formData.phone}${condStr}\n薬アレルギー: ${formData['drug-allergy']}\n副作用: ${formData['side-effect']}\n運転: ${formData.driving}\n高所作業: ${formData['height-work']}\nジェネリック: ${formData.generic}`;

    try {
        if (liff.isInClient()) {
            await liff.sendMessages([{
                type: 'text',
                text: message
            }]);
            alert('問診票を送信しました。ありがとうございました。');
            liff.closeWindow();
        } else {
            console.log('Form submitted (Browser mode):', formData);
            alert('ブラウザ版のため、コンソールにデータを出力しました。実機ではLINEに送信されます。');
        }
    } catch (err) {
        console.error('Submission failed', err);
        alert('送信に失敗しました。時間をおいて再度お試しください。');
    }
}

// --- Event Listeners ---
document.getElementById('next-btn').addEventListener('click', handleNext);
document.getElementById('prev-btn').addEventListener('click', handlePrev);
document.getElementById('questionnaire-form').addEventListener('submit', handleSubmit);

// --- Detail Toggle Logic ---
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const detailInput = e.target.closest('.input-group').querySelector('.sub-input');
        if (detailInput) {
            if (e.target.value === 'yes' || e.target.value === 'other') {
                detailInput.classList.remove('hidden');
            } else if (e.target.value === 'no') {
                detailInput.classList.add('hidden');
            }
        }
        
        // Handle patient condition weight input toggle
        if (e.target.name === 'patient-condition') {
            const weightInputGroup = document.getElementById('weight-input-group');
            const weightInput = document.getElementById('weight');
            if (e.target.value !== 'none') {
                weightInputGroup.classList.remove('hidden');
                weightInput.setAttribute('required', 'true');
            } else {
                weightInputGroup.classList.add('hidden');
                weightInput.removeAttribute('required');
                weightInput.value = ''; // clear value
            }
        }
    });
});

// Start
initializeLiff();
updateNavigation();
