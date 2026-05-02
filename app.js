// --- Configuration ---
const LIFF_ID = 'YOUR_LIFF_ID'; // Replace with your real LIFF ID
const API_URL = 'https://script.google.com/macros/s/AKfycbyr_FWmEZm1QOIu6VXTnvtZf2BHxcAe0YtZYyZ0mytZ-3Ya0IQ0LtzRR25diTXwYIBh/exec';

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

    // Update step counter (v2)
    const stepCounter = document.getElementById('step-counter');
    if (stepCounter) stepCounter.textContent = `${currentStep} / ${totalSteps}`;

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

    // Custom phone validation inside step 1
    let phoneErrorMsg = '';
    if (step === 1 && isValid) {
        const phoneInput = activeSection.querySelector('#phone');
        if (phoneInput && phoneInput.value.trim()) {
            const digitsOnly = phoneInput.value.replace(/\D/g, '');
            if (!/^0/.test(digitsOnly) || (digitsOnly.length !== 10 && digitsOnly.length !== 11)) {
                isValid = false;
                phoneInput.style.borderColor = 'var(--error-color)';
                // We use a direct JP string here or ideally an i18n key if available, but Japanese is fine since it's the main usage
                phoneErrorMsg = '電話番号は市外局番（0）から始まる10桁または11桁で入力してください。';
            } else {
                phoneInput.style.borderColor = 'var(--border-color)';
            }
        }
    }

    if (!isValid) {
        if (phoneErrorMsg) {
            alert(phoneErrorMsg);
        } else {
            alert(t('validation_required'));
        }
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

// --- Confirmation Page (multilingual) ---
function generateConfirmation() {
    const view = document.getElementById('confirmation-view');

    // 確認画面のラベルは入力言語で表示
    const labels = {
        'name': t('conf_name'),
        'phone': t('conf_phone'),
        'patient-condition': t('conf_condition'),
        'weight': t('conf_weight'),
        'drug-allergy': t('conf_drug_allergy'),
        'drug-allergy-detail': '原因薬（症状）',
        'food-allergy': t('conf_food_allergy'),
        'food-allergy-detail': '食物アレルギー',
        'env-allergy': t('conf_env_allergy'),
        'current-presc': t('conf_current_presc'),
        'current-presc-detail': '服用薬',
        'otc-list': t('conf_otc'),
        'otc-suppl-detail': t('conf_otc_detail'),
        'food-drink': t('conf_food_drink'),
        'food-drink-detail': t('conf_food_drink_detail'),
        'present-illness': '現病歴',
        'present-illness-other-detail': '現病歴詳細',
        'past-history': '既往歴',
        'past-history-other-detail': '既往歴詳細',
        'driving': t('conf_driving'),
        'height-work': t('conf_height_work'),
        'soft-contact': t('conf_soft_contact'),
        'alcohol': t('conf_alcohol'),
        'smoking': t('conf_smoking'),
        'generic': t('conf_generic'),
        'memo': t('conf_memo')
    };

    const genericMap = { 'prefer': t('val_generic_prefer'), 'ag': t('val_generic_prefer'), 'avoid': t('val_generic_avoid') };

    const otcLabels = {
        'no': t('val_none'),
        'cold': t('cold_med'), 'pain': t('painkiller'), 'stomach': t('stomach_med'), 'eye': t('eye_drops'),
        'vitamin': t('vitamins'), 'multi-mineral': t('multi_mineral'), 'iron': t('iron'), 'zinc': t('zinc'), 
        'calcium': t('calcium'), 'magnesium': t('magnesium'), 'dha-epa': t('dha_epa'),
        'protein': t('protein'), 'other': t('other')
    };
    
    const foodDrinkLabels = {
        'no': t('val_none'),
        'coffee-tea': t('coffee_tea'), 'grapefruit': t('grapefruit'), 
        'dairy': t('dairy'), 'other': t('other')
    };
    
    const envLabels = {
        'no': t('val_none'),
        'hayfever': t('hayfever'), 'housedust': t('housedust'), 'mite': t('mite'),
        'dog-cat': t('dog_cat'), 'temp': t('temp_diff'), 'perennial': t('perennial'), 'testing': t('testing'), 'other': t('other')
    };
    
    const hayfeverTypeLabels = {
        'sugi': t('sugi'), 'hinoki': t('hinoki'), 'ine': t('ine'), 'butakusa': t('butakusa'), 'kamogaya': t('kamogaya')
    };
    
    const conditionLabels = {
        'none': t('val_none'), 'pregnant': t('val_pregnant'), 
        'breastfeeding': t('val_breastfeeding'), 'pediatric': t('val_pediatric')
    };
    
    const historyLabels = {
        'no': t('val_none'),
        'hypertension': t('hypertension'), 'diabetes': t('diabetes'), 'heart': t('heart_disease'), 
        'kidney': t('kidney_disease'), 'liver': t('liver_disease'), 'asthma': t('asthma'), 
        'epilepsy': t('epilepsy'), 'glaucoma': t('glaucoma'), 'prostate': t('prostate'),
        'other': t('other')
    };

    view.innerHTML = '';
    for (let key in labels) {
        if (formData[key] !== undefined && formData[key] !== '') {
            let value = formData[key];
            if (Array.isArray(value)) {
                if (key === 'otc-list') {
                    value = value.map(v => otcLabels[v] || v).join(', ');
                } else if (key === 'env-allergy') {
                    let allergies = value.map(v => envLabels[v] || v);
                    if (value.includes('hayfever') && formData['hayfever-type'] && formData['hayfever-type'].length > 0) {
                        const types = formData['hayfever-type'].map(t => hayfeverTypeLabels[t] || t).join('・');
                        allergies = allergies.map(a => a === envLabels['hayfever'] ? `${envLabels['hayfever']}(${types})` : a);
                    }
                    value = allergies.join(', ');
                } else if (key === 'food-drink') {
                    value = value.map(v => foodDrinkLabels[v] || v).join(', ');
                } else if (key === 'history' || key === 'present-illness' || key === 'past-history') {
                    value = value.map(v => historyLabels[v] || v).join(', ');
                } else {
                    value = value.join(', ');
                }
            }
            if (key === 'weight') value += ' kg';
            if (key === 'patient-condition') value = conditionLabels[value] || value;
            if (key === 'generic') value = genericMap[value] || value;
            // Convert yes/no to context-aware labels
            if (value === 'yes') {
                if (key === 'drug-allergy' || key === 'food-allergy') value = t('val_yes_allergy');
                else if (key === 'driving') value = t('val_yes_drive');
                else if (key === 'height-work') value = t('val_yes_height');
                else if (key === 'soft-contact') value = t('val_yes_contact');
                else if (key === 'current-presc') value = t('val_yes_presc');
                else if (key === 'smoking') value = t('val_yes_smoke');
                else value = t('val_yes_allergy');
            }
            if (value === 'no') {
                if (key === 'drug-allergy' || key === 'food-allergy') value = t('val_no_allergy');
                else if (key === 'driving') value = t('val_no_drive');
                else if (key === 'height-work') value = t('val_no_height');
                else if (key === 'soft-contact') value = t('val_no_contact');
                else if (key === 'current-presc') value = t('val_no_presc');
                else if (key === 'smoking') value = t('val_no_smoke');
                else value = t('val_no_allergy');
            }
            // Convert alcohol values
            if (key === 'alcohol') {
                const alcoholLabels = { 'none': t('val_alcohol_none'), 'occasionally': t('val_alcohol_occasionally'), 'daily': t('val_alcohol_daily') };
                value = alcoholLabels[value] || value;
            }
            
            if (value) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'conf-item';
                
                const labelSpan = document.createElement('span');
                labelSpan.className = 'conf-label';
                labelSpan.textContent = labels[key];
                
                const valueSpan = document.createElement('span');
                valueSpan.className = 'conf-value';
                valueSpan.textContent = value;
                
                itemDiv.appendChild(labelSpan);
                itemDiv.appendChild(valueSpan);
                view.appendChild(itemDiv);
            }
        }
    }
}

// --- Submission ---
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!document.getElementById('agree').checked) {
        alert(t('validation_agree'));
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = t('btn_submitting');

    // バックエンド(GAS)の後方互換性を保つため、現病歴と既往歴を history に結合
    const historyMap = {
        'no': 'ない',
        'hypertension': '高血圧', 'diabetes': '糖尿病', 'heart': '心臓病', 
        'kidney': '腎臓病', 'liver': '肝臓病', 'asthma': '喘息', 
        'epilepsy': 'てんかん', 'glaucoma': '緑内障', 'prostate': '前立腺肥大',
        'other': 'その他'
    };
    
    let combinedHistory = [];
    const presentArr = formData['present-illness'] || [];
    if (presentArr.length > 0) {
        combinedHistory.push("【現病歴】" + presentArr.map(v => historyMap[v] || v).join('、'));
    }
    const pastArr = formData['past-history'] || [];
    if (pastArr.length > 0) {
        combinedHistory.push("【既往歴】" + pastArr.map(v => historyMap[v] || v).join('、'));
    }
    formData['history'] = combinedHistory.length > 0 ? combinedHistory.join('  ') : 'no'; // 'no' converts to 'なし' in Code.gs

    let combinedDetail = [];
    if (formData['present-illness-other-detail']) {
        combinedDetail.push("【現病歴】" + formData['present-illness-other-detail']);
    }
    if (formData['past-history-other-detail']) {
        combinedDetail.push("【既往歴】" + formData['past-history-other-detail']);
    }
    formData['history-other-detail'] = combinedDetail.join('  ');

    // Prepare message for LINE if applicable
    const genericMapSubmit = { 'prefer': 'ジェネリックで大丈夫', 'ag': 'オーソライズド・ジェネリックでなら希望', 'avoid': '先発医薬品を希望する' };
    const genericText = genericMapSubmit[formData.generic] || formData.generic;
    
    // translate patient-condition to Japanese for LINE
    const pCondMap = { 'none': 'ない', 'pregnant': '妊娠中', 'breastfeeding': '授乳中', 'pediatric': '小児' };
    const condJp = pCondMap[formData['patient-condition']] || formData['patient-condition'];
    const condStr = (formData['patient-condition'] !== 'none') ? `\n状態: ${condJp} (体重: ${formData.weight || '-'}kg)` : '\n状態: ない';
    
    const yesNoMap = { 'yes': 'ある', 'no': 'ない' };
    const yesNoDoMap = { 'yes': 'する', 'no': 'しない' };
    
    const allergyDetail = formData['drug-allergy-detail'] ? ` (${formData['drug-allergy-detail']})` : '';
    const drugAllergyJp = (yesNoMap[formData['drug-allergy']] || formData['drug-allergy']) + allergyDetail;
    
    const prescDetail = formData['current-presc-detail'] ? ` (${formData['current-presc-detail']})` : '';
    const prescJp = (yesNoMap[formData['current-presc']] || formData['current-presc']) + prescDetail;

    const drivingJp = yesNoDoMap[formData.driving] || formData.driving;
    const heightWorkJp = yesNoMap[formData['height-work']] || formData['height-work'];

    const message = `【初回問診票回答】\n氏名: ${formData.name}\n電話: ${formData.phone}${condStr}\n薬アレルギー・副作用: ${drugAllergyJp}\n他院処方薬: ${prescJp}\n運転: ${drivingJp}\n高所作業: ${heightWorkJp}\nジェネリック: ${genericText}`;

    try {
        if (typeof liff !== 'undefined' && liff.isInClient()) {
            await liff.sendMessages([{
                type: 'text',
                text: message
            }]);
        }
    } catch (err) {
        console.error('LIFF Message failed', err);
    }

    // Submit to GAS backend (value keys are always English — Code.gs translates to Japanese)
    formData.source = 'webapp';
    formData.lang = typeof currentLang !== 'undefined' ? currentLang : 'ja';

    fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(formData)
    })
    .then(() => {
        showSuccess();
    })
    .catch(err => {
        console.error(err);
        showSuccess(); // fallback to success view even on CORS errors
    });
}

function showSuccess() {
    // 完了後の画面（LINE友達追加誘導）へリダイレクト
    window.location.href = 'line-friend-add.html';
}

function closeLiff() {
    let isLiff = false;
    try {
        if (typeof liff !== 'undefined' && liff.isInClient()) {
            isLiff = true;
            liff.closeWindow(); 
        }
    } catch (e) { console.warn('LIFF close failed:', e); }

    if (!isLiff) {
        document.querySelector('.success-view').innerHTML = `
            <div class="success-icon" style="color: #06C755; font-size: 80px; margin-bottom: 20px;">✓</div>
            <h2 style="font-size: 1.5rem; color: #333; margin-bottom: 15px;">${t('success_browser_title')}</h2>
            <p style="font-size: 1.1rem; color: #555; line-height: 1.6;">${t('success_browser_msg')}</p>
        `;
    }
}

// --- Event Listeners ---
const phoneInputEl = document.getElementById('phone');
if (phoneInputEl) {
    phoneInputEl.addEventListener('input', function(e) {
        let val = e.target.value;
        // Convert zenkaku numbers to hankaku
        val = val.replace(/[０-９]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
        // Normalize various hyphens to a standard half-width hyphen
        val = val.replace(/[ー−‐－]/g, '-');
        
        // Remove characters other than numbers and hyphens
        val = val.replace(/[^\d-]/g, '');
        
        if (val !== e.target.value) {
            e.target.value = val;
        }
    });
}

document.getElementById('next-btn').addEventListener('click', handleNext);
document.getElementById('prev-btn').addEventListener('click', handlePrev);
document.getElementById('submit-btn').addEventListener('click', handleSubmit);
document.getElementById('questionnaire-form').addEventListener('submit', handleSubmit);

// --- Detail Toggle Logic (v2 対応: open クラスを使用) ---
// Note: v2 では index.html 側のインラインスクリプトが条件展開を担当。
// 旧 hidden クラス方式との互換性のため、sub-input の hidden クラスも保持。
document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        // v2: sub-input は id 付きラッパーで open クラス制御（インライン JS 側が担当）
        // 旧 HTML 向けに hidden クラス方式も残す
        const detailInput = e.target.closest('.input-group').querySelector('.sub-input:not([id])');
        if (detailInput) {
            if (e.target.value === 'yes' || e.target.value === 'other') {
                detailInput.classList.remove('hidden');
            } else if (e.target.value === 'no') {
                detailInput.classList.add('hidden');
            }
        }
    });
});

// Start
initializeLiff();
updateNavigation();


