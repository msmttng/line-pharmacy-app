// ======================================================
// i18n.js — 多言語対応 翻訳辞書 + DOM置換
// ?lang=en / ?lang=zh で言語切替、デフォルト = ja
// ======================================================

const I18N = {
  // ===== 日本語 (デフォルト) =====
  ja: {
    // --- ヘッダー ---
    page_title: '【薬局】初回問診票',
    title: '初回問診票',
    step_counter: '{current} / {total}',

    // --- Step 1: 基本情報 ---
    step1_title: '基本情報',
    name_label: 'お名前（漢字）',
    name_placeholder: '山田 太郎',
    phone_label: '電話番号',
    phone_placeholder: '09012345678',
    condition_label: '該当する状態を選んでください',
    condition_none: '該当なし',
    condition_pregnant: '妊娠している（またはその可能性がある）',
    condition_breastfeeding: '授乳中である',
    condition_pediatric: '小児である（15歳未満）',
    weight_label: 'お子様の体重',
    weight_unit: 'kg',
    weight_placeholder: '例: 20',

    // --- Step 2: アレルギー ---
    step2_title: 'アレルギー・副作用',
    drug_allergy_label: '薬でアレルギーや副作用が出たことはありますか？',
    drug_allergy_detail_placeholder: '具体的な薬品名・症状をご記入ください',
    drug_allergy_search_hint: 'アレルギーのある薬を検索して追加してください',
    allergy_search_placeholder: 'ひらがなで検索 (例: ろきそ)',
    food_allergy_label: '食物アレルギーはありますか？',
    food_allergy_detail_placeholder: '具体的な食物名をご記入ください',
    env_allergy_label: '花粉症・ハウスダストなど環境アレルギーはありますか？',
    env_allergy_hint: '※「特にない」場合はそのまま次へ進んでください',
    hayfever: '花粉症',
    housedust: 'ハウスダスト',
    mite: 'ダニ',
    dog_cat: '犬・猫',
    temp_diff: '寒暖差',
    perennial: '通年性',
    testing: '検査中',
    other: 'その他',
    hayfever_sub_label: '花粉症の種類（複数選択OK）',
    sugi: 'スギ',
    hinoki: 'ヒノキ',
    ine: 'イネ',
    butakusa: 'ブタクサ',
    kamogaya: 'カモガヤ',

    // --- Step 3: 服用状況 ---
    step3_title: '現在の服用状況',
    step3_info: '※ お薬手帳 または マイナ保険証 で医療情報の提供に同意いただける方は、以下は不要です',
    current_presc_label: '現在、他院で処方されている薬はありますか？',
    current_presc_placeholder: '薬名をご記入ください（わからなければ「窓口でお伝えします」でもOK）',
    presc_search_hint: '現在飲んでいる薬を検索して追加してください',
    presc_search_placeholder: 'ひらがなで検索 (例: むこす)',
    otc_label: '市販薬やサプリメントを飲んでいますか？',
    otc_hint: '※ 該当するものだけ選んでください（複数OK）',
    cold_med: '風邪薬',
    painkiller: '痛み止め',
    stomach_med: '胃腸薬',
    eye_drops: '目薬',
    vitamins: 'ビタミン類',
    multi_mineral: 'マルチミネラル',
    iron: '鉄',
    zinc: '亜鉛',
    calcium: 'カルシウム',
    magnesium: 'マグネシウム',
    dha_epa: 'DHA・EPA',
    protein: 'プロテイン',
    otc_detail_placeholder: '具体的な商品名などがあればご記入ください',
    food_drink_label: '日常的によく摂取している飲食物はありますか？',
    food_drink_tip: 'お薬と食べ物の飲み合わせ確認のためにお聞きしています。',
    food_drink_hint: '※ 該当するものだけ選んでください（複数OK）',
    coffee_tea: 'コーヒー・紅茶',
    grapefruit: 'グレープフルーツ',
    dairy: '乳製品',
    food_drink_detail_placeholder: 'その他の場合は具体的な名称をご記入ください',

    // --- Step 4: 既往歴 ---
    step4_title: '既往歴・現病歴',
    present_illness_label: '現在治療中の病気はありますか？（現病歴）',
    present_illness_desc: '現在病院に通院して治療を受けている病気や、最近かかった病気があれば教えてください。',
    past_history_label: '過去にかかった大きな病気はありますか？（既往歴）',
    past_history_desc: 'これまでに手術や入院をしたことがある病気や、過去に治療を受けたことがある大きな病気を教えてください。',
    history_label: '現在治療中または過去に大きな病気はありますか？',
    history_hint: '※「特にない」場合はそのまま次へ進んでください（複数OK）',
    history_none: '特になし',
    hypertension: '高血圧',
    diabetes: '糖尿病',
    heart_disease: '心臓病',
    kidney_disease: '腎臓病',
    liver_disease: '肝臓病',
    asthma: '喘息',
    epilepsy: 'てんかん',
    glaucoma: '緑内障',
    prostate: '前立腺肥大',
    history_other_placeholder: 'その他の場合は病名をご記入ください',

    // --- Step 5: 生活習慣 ---
    step5_title: '生活習慣・お仕事',
    driving_label: '車の運転をされますか？',
    driving_tip: '眠気を引き起こす薬を処方する際に確認が必要です。',
    height_work_label: '高所作業をされますか？',
    height_work_tip: 'めまい・眠気を引き起こす薬の服用注意確認のためにお聞きしています。',
    contact_label: 'ソフトコンタクトレンズを使用していますか？',
    contact_tip: '一部の目薬はソフトコンタクトと一緒に使用できないため確認しています。',
    alcohol_label: 'お酒は飲みますか？',
    alcohol_none: '飲まない',
    alcohol_occasionally: '時々',
    alcohol_daily: '毎日',
    smoking_label: 'タバコは吸いますか？',

    // --- 共通ラジオ ---
    yes: 'ある',
    no: 'ない',
    yes_do: 'する',
    no_dont: 'しない',
    yes_use: 'している',
    no_use: 'していない',
    yes_smoke: '吸う',
    no_smoke: '吸わない',

    // --- Step 6: ご要望 ---
    step6_title: 'ご要望・その他',
    generic_label: '後発医薬品（ジェネリック）についてお聞かせください',
    generic_note: '💡 <strong>後発医薬品（ジェネリック）</strong>とは、先発品と同じ有効成分で国が承認した薬です。費用が抑えられます。',
    generic_prefer: '後発医薬品（ジェネリック）でよい',
    generic_avoid: '先発医薬品を希望する',
    memo_label: '薬剤師に伝えておきたいことはありますか？',
    memo_placeholder: '（例）粉薬が苦手、飲み合わせが不安など',

    // --- Step 7: 確認 ---
    step7_title: '入力内容の確認',
    data_notice: '入力いただいた情報は、当薬局が運営するシステム（Google フォームサービス経由）に安全に送信され、薬剤師による服薬指導にのみ使用されます。',
    agree_text: '<a href="privacy-policy.html" target="_blank" rel="noopener noreferrer">個人情報の取り扱い</a>に同意します',

    // --- ナビ・共通 ---
    btn_prev: '← 戻る',
    btn_next: '次へ →',
    btn_submit: '送信する',
    btn_submitting: '送信中...',
    validation_required: '必須項目を入力してください。',
    validation_agree: '個人情報の取り扱いに同意してください。',
    required: '必須',

    // --- 送信完了 ---
    success_title: '送信完了しました',
    success_message: 'ご協力ありがとうございました',
    btn_close: '画面を閉じる',
    success_browser_title: 'ご回答<br>ありがとうございました',
    success_browser_msg: '手続きが完了しました。<br><br><b>このブラウザの画面（タブ）を閉じてください。</b><br><br><span style="font-size: 0.9rem;">※ 薬局のタブレットをご利用の方は、そのままスタッフにお渡しください。</span>',

    // --- 確認画面ラベル ---
    conf_name: 'お名前（漢字）',
    conf_phone: '電話番号',
    conf_condition: '患者様の状態',
    conf_weight: '体重',
    conf_drug_allergy: '薬・副作用歴',
    conf_drug_allergy_detail: '薬・副作用詳細',
    conf_food_allergy: '食物アレルギー',
    conf_food_allergy_detail: '食物アレルギー詳細',
    conf_env_allergy: '環境アレルギー',
    conf_current_presc: '他での処方',
    conf_current_presc_detail: '他院処方詳細',
    conf_otc: '使用中の市販薬・サプリ',
    conf_otc_detail: '市販薬詳細',
    conf_food_drink: '日常的な飲食物',
    conf_food_drink_detail: '飲食物詳細',
    conf_history: '既往歴',
    conf_driving: '運転の有無',
    conf_height_work: '高所作業の有無',
    conf_soft_contact: 'ソフトコンタクト',
    conf_alcohol: 'お酒',
    conf_smoking: 'タバコ',
    conf_generic: 'ジェネリック希望',
    conf_memo: 'その他ご要望',
    conf_history_detail: '既往歴詳細',

    // --- 確認画面の値表示 ---
    val_none: '該当なし',
    val_pregnant: '妊娠中(可能性あり)',
    val_breastfeeding: '授乳中',
    val_pediatric: '小児(15歳未満)',
    val_yes_allergy: 'あり',
    val_no_allergy: 'なし',
    val_yes_drive: 'する',
    val_no_drive: 'しない',
    val_yes_height: 'ある',
    val_no_height: 'ない',
    val_yes_contact: 'あり',
    val_no_contact: 'なし',
    val_yes_presc: 'あり',
    val_no_presc: 'なし',
    val_yes_smoke: '吸う',
    val_no_smoke: '吸わない',
    val_alcohol_none: '飲まない',
    val_alcohol_occasionally: '時々',
    val_alcohol_daily: '毎日',
    val_generic_prefer: 'ジェネリックで大丈夫',
    val_generic_avoid: '先発医薬品を希望する',

    // --- footer ---
    footer: '&copy; 2025 丸山薬局'
  },

  // ===== English =====
  en: {
    page_title: '[Pharmacy] Initial Questionnaire',
    title: 'Initial Questionnaire',
    step_counter: '{current} / {total}',
    step1_title: 'Basic Information',
    name_label: 'Your Name',
    name_placeholder: 'e.g. John Smith',
    phone_label: 'Phone Number',
    phone_placeholder: '09012345678',
    condition_label: 'Please select your current condition',
    condition_none: 'None of the below',
    condition_pregnant: 'Pregnant (or possibly pregnant)',
    condition_breastfeeding: 'Breastfeeding',
    condition_pediatric: 'Child (under 15 years old)',
    weight_label: "Child's Weight",
    weight_unit: 'kg',
    weight_placeholder: 'e.g. 20',

    step2_title: 'Allergies & Side Effects',
    drug_allergy_label: 'Have you ever had an allergic reaction or side effect from any medication?',
    drug_allergy_detail_placeholder: 'Please describe the medication name and symptoms',
    drug_allergy_search_hint: 'Search and add medications you are allergic to',
    allergy_search_placeholder: 'Search by medication name',
    food_allergy_label: 'Do you have any food allergies?',
    food_allergy_detail_placeholder: 'Please list specific foods',
    env_allergy_label: 'Do you have any environmental allergies (hay fever, dust, etc.)?',
    env_allergy_hint: '* If none, please proceed to the next step',
    hayfever: 'Hay Fever',
    housedust: 'House Dust',
    mite: 'Dust Mites',
    dog_cat: 'Dogs / Cats',
    temp_diff: 'Temperature Changes',
    perennial: 'Year-round',
    testing: 'Under Testing',
    other: 'Other',
    hayfever_sub_label: 'Type of hay fever (select all that apply)',
    sugi: 'Japanese Cedar',
    hinoki: 'Japanese Cypress',
    ine: 'Rice Plant',
    butakusa: 'Ragweed',
    kamogaya: 'Orchard Grass',

    step3_title: 'Current Medications',
    step3_info: '* If you consent to share medical information via your medication record book or My Number insurance card, you may skip this section.',
    current_presc_label: 'Are you currently taking any prescribed medications from another hospital?',
    current_presc_placeholder: 'Please enter medication names (or write "I will explain at the counter")',
    presc_search_hint: 'Search and add your current medications',
    presc_search_placeholder: 'Search by medication name',
    otc_label: 'Are you taking any over-the-counter medicines or supplements?',
    otc_hint: '* Select all that apply',
    cold_med: 'Cold Medicine',
    painkiller: 'Painkiller',
    stomach_med: 'Stomach Medicine',
    eye_drops: 'Eye Drops',
    vitamins: 'Vitamins',
    multi_mineral: 'Multi-mineral',
    iron: 'Iron',
    zinc: 'Zinc',
    calcium: 'Calcium',
    magnesium: 'Magnesium',
    dha_epa: 'DHA / EPA',
    protein: 'Protein',
    otc_detail_placeholder: 'Please enter specific product names if known',
    food_drink_label: 'Do you regularly consume any of the following?',
    food_drink_tip: 'We ask this to check for interactions between food and medications.',
    food_drink_hint: '* Select all that apply',
    coffee_tea: 'Coffee / Tea',
    grapefruit: 'Grapefruit',
    dairy: 'Dairy Products',
    food_drink_detail_placeholder: 'If "Other", please specify',

    step4_title: 'Medical History',
    present_illness_label: 'Are you currently being treated for any diseases? (Present Illness)',
    present_illness_desc: 'Please tell us about any diseases you are currently receiving treatment for at a hospital, or recent illnesses.',
    past_history_label: 'Have you had any major illnesses in the past? (Past History)',
    past_history_desc: 'Please tell us about any diseases for which you have had surgery, been hospitalized, or received treatment in the past.',
    history_label: 'Are you currently being treated for, or have you previously had, any of the following?',
    history_hint: '* If none, please proceed to the next step (select all that apply)',
    history_none: 'None',
    hypertension: 'Hypertension',
    diabetes: 'Diabetes',
    heart_disease: 'Heart Disease',
    kidney_disease: 'Kidney Disease',
    liver_disease: 'Liver Disease',
    asthma: 'Asthma',
    epilepsy: 'Epilepsy',
    glaucoma: 'Glaucoma',
    prostate: 'Enlarged Prostate (BPH)',
    history_other_placeholder: 'If "Other", please enter the condition name',

    step5_title: 'Lifestyle & Work',
    driving_label: 'Do you drive a car?',
    driving_tip: 'Some medications may cause drowsiness, which is important to know for drivers.',
    height_work_label: 'Do you work at heights?',
    height_work_tip: 'Some medications may cause dizziness, which is important to know for those who work at heights.',
    contact_label: 'Do you use soft contact lenses?',
    contact_tip: 'Some eye drops cannot be used with soft contact lenses.',
    alcohol_label: 'Do you drink alcohol?',
    alcohol_none: 'No',
    alcohol_occasionally: 'Occasionally',
    alcohol_daily: 'Daily',
    smoking_label: 'Do you smoke?',

    yes: 'Yes',
    no: 'No',
    yes_do: 'Yes',
    no_dont: 'No',
    yes_use: 'Yes',
    no_use: 'No',
    yes_smoke: 'Yes',
    no_smoke: 'No',

    step6_title: 'Preferences & Other',
    generic_label: 'Regarding generic medicines',
    generic_note: '💡 <strong>Generic medicines</strong> contain the same active ingredients as brand-name drugs and are approved by the government. They are more affordable.',
    generic_prefer: 'Generic medicines are fine',
    generic_avoid: 'I prefer brand-name medicines',
    memo_label: 'Is there anything you would like to tell the pharmacist?',
    memo_placeholder: '(e.g.) I have difficulty with powder medicines, concerned about drug interactions, etc.',

    step7_title: 'Review Your Answers',
    data_notice: 'The information you provide will be securely transmitted to our pharmacy system (via Google Forms service) and will be used solely for medication counseling by our pharmacists.',
    agree_text: 'I agree to the <a href="privacy-policy-en.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>',

    btn_prev: '← Back',
    btn_next: 'Next →',
    btn_submit: 'Submit',
    btn_submitting: 'Submitting...',
    validation_required: 'Please fill in all required fields.',
    validation_agree: 'Please agree to the privacy policy.',
    required: 'Required',

    success_title: 'Submitted Successfully',
    success_message: 'Thank you for your cooperation.',
    btn_close: 'Close',
    success_browser_title: 'Thank you for<br>your response',
    success_browser_msg: 'Your submission is complete.<br><br><b>Please close this browser tab.</b><br><br><span style="font-size: 0.9rem;">* If you are using the pharmacy tablet, please return it to the staff.</span>',

    conf_name: 'Name',
    conf_phone: 'Phone Number',
    conf_condition: 'Patient Condition',
    conf_weight: 'Weight',
    conf_drug_allergy: 'Drug Allergy / Side Effects',
    conf_drug_allergy_detail: 'Drug Allergy Details',
    conf_food_allergy: 'Food Allergy',
    conf_food_allergy_detail: 'Food Allergy Details',
    conf_env_allergy: 'Environmental Allergy',
    conf_current_presc: 'Prescriptions from Other Hospitals',
    conf_current_presc_detail: 'Other Prescriptions Details',
    conf_otc: 'OTC Medicines / Supplements',
    conf_otc_detail: 'OTC Details',
    conf_food_drink: 'Regular Food / Drinks',
    conf_food_drink_detail: 'Food/Drink Details',
    conf_history: 'Medical History',
    conf_driving: 'Driving',
    conf_height_work: 'Work at Heights',
    conf_soft_contact: 'Soft Contact Lenses',
    conf_alcohol: 'Alcohol',
    conf_smoking: 'Smoking',
    conf_generic: 'Generic Preference',
    conf_memo: 'Other Requests',
    conf_history_detail: 'Medical History Details',

    val_none: 'None',
    val_pregnant: 'Pregnant (possibly)',
    val_breastfeeding: 'Breastfeeding',
    val_pediatric: 'Child (under 15)',
    val_yes_allergy: 'Yes',
    val_no_allergy: 'No',
    val_yes_drive: 'Yes',
    val_no_drive: 'No',
    val_yes_height: 'Yes',
    val_no_height: 'No',
    val_yes_contact: 'Yes',
    val_no_contact: 'No',
    val_yes_presc: 'Yes',
    val_no_presc: 'No',
    val_yes_smoke: 'Yes',
    val_no_smoke: 'No',
    val_alcohol_none: 'No',
    val_alcohol_occasionally: 'Occasionally',
    val_alcohol_daily: 'Daily',
    val_generic_prefer: 'Generic is fine',
    val_generic_avoid: 'Prefer brand-name',

    footer: '&copy; 2025 Maruyama Pharmacy'
  },

  // ===== 中文（简体） =====
  zh: {
    page_title: '【药局】初诊问诊表',
    title: '初诊问诊表',
    step_counter: '{current} / {total}',
    step1_title: '基本信息',
    name_label: '姓名',
    name_placeholder: '例：张三',
    phone_label: '电话号码',
    phone_placeholder: '09012345678',
    condition_label: '请选择您目前的状况',
    condition_none: '以下均不适用',
    condition_pregnant: '怀孕中（或可能怀孕）',
    condition_breastfeeding: '哺乳中',
    condition_pediatric: '儿童（15岁以下）',
    weight_label: '孩子的体重',
    weight_unit: 'kg',
    weight_placeholder: '例：20',

    step2_title: '过敏及副作用',
    drug_allergy_label: '您是否曾经对药物产生过过敏或副作用？',
    drug_allergy_detail_placeholder: '请填写具体的药品名称和症状',
    drug_allergy_search_hint: '搜索并添加您过敏的药物',
    allergy_search_placeholder: '按药物名称搜索',
    food_allergy_label: '您是否有食物过敏？',
    food_allergy_detail_placeholder: '请填写具体的食物名称',
    env_allergy_label: '您是否有花粉症、灰尘等环境过敏？',
    env_allergy_hint: '※ 如果没有，请直接进入下一步',
    hayfever: '花粉症',
    housedust: '粉尘',
    mite: '螨虫',
    dog_cat: '狗/猫',
    temp_diff: '温差',
    perennial: '常年性',
    testing: '检查中',
    other: '其他',
    hayfever_sub_label: '花粉症类型（可多选）',
    sugi: '杉树',
    hinoki: '扁柏',
    ine: '稻',
    butakusa: '豚草',
    kamogaya: '鸭茅',

    step3_title: '目前的用药情况',
    step3_info: '※ 如果您同意通过药品手册或My Number保险卡提供医疗信息，则可以跳过以下内容。',
    current_presc_label: '您目前是否在其他医院有处方药？',
    current_presc_placeholder: '请填写药品名称（如果不清楚可以写"到窗口说明"）',
    presc_search_hint: '搜索并添加您目前正在服用的药物',
    presc_search_placeholder: '按药物名称搜索',
    otc_label: '您是否在服用非处方药或保健品？',
    otc_hint: '※ 请选择所有适用项',
    cold_med: '感冒药',
    painkiller: '止痛药',
    stomach_med: '胃肠药',
    eye_drops: '眼药水',
    vitamins: '维生素类',
    multi_mineral: '复合矿物质',
    iron: '铁',
    zinc: '锌',
    calcium: '钙',
    magnesium: '镁',
    dha_epa: 'DHA/EPA',
    protein: '蛋白粉',
    otc_detail_placeholder: '如有请填写具体的商品名称',
    food_drink_label: '您是否经常摄取以下饮食？',
    food_drink_tip: '为了确认药物与食物的相互作用，我们需要了解这些信息。',
    food_drink_hint: '※ 请选择所有适用项',
    coffee_tea: '咖啡/红茶',
    grapefruit: '葡萄柚',
    dairy: '乳制品',
    food_drink_detail_placeholder: '如选"其他"，请填写具体名称',

    step4_title: '既往病史',
    present_illness_label: '您目前是否在接受任何疾病的治疗？（现病史）',
    present_illness_desc: '请告诉我们您目前是否在医院接受治疗，或最近是否患有任何疾病。',
    past_history_label: '您过去是否患有任何重大疾病？（既往病史）',
    past_history_desc: '请告诉我们您过去是否做过手术、住过院或接受过任何重大疾病的治疗。',
    history_label: '您目前是否在治疗或过去是否患有以下疾病？',
    history_hint: '※ 如果没有，请直接进入下一步（可多选）',
    history_none: '无',
    hypertension: '高血压',
    diabetes: '糖尿病',
    heart_disease: '心脏病',
    kidney_disease: '肾病',
    liver_disease: '肝病',
    asthma: '哮喘',
    epilepsy: '癫痫',
    glaucoma: '青光眼',
    prostate: '前列腺增生',
    history_other_placeholder: '如选"其他"，请填写病名',

    step5_title: '生活习惯与工作',
    driving_label: '您开车吗？',
    driving_tip: '某些药物可能引起嗜睡，对驾驶员来说需要特别注意。',
    height_work_label: '您从事高处作业吗？',
    height_work_tip: '某些药物可能引起头晕，对高处作业人员需要特别注意。',
    contact_label: '您使用软性隐形眼镜吗？',
    contact_tip: '部分眼药水不能与软性隐形眼镜同时使用。',
    alcohol_label: '您喝酒吗？',
    alcohol_none: '不喝',
    alcohol_occasionally: '偶尔',
    alcohol_daily: '每天',
    smoking_label: '您吸烟吗？',

    yes: '有',
    no: '没有',
    yes_do: '是',
    no_dont: '否',
    yes_use: '使用',
    no_use: '不使用',
    yes_smoke: '吸',
    no_smoke: '不吸',

    step6_title: '偏好及其他',
    generic_label: '关于仿制药',
    generic_note: '💡 <strong>仿制药</strong>含有与原研药相同的有效成分，经国家批准。价格更实惠。',
    generic_prefer: '仿制药即可',
    generic_avoid: '希望使用原研药',
    memo_label: '您有什么想告诉药剂师的吗？',
    memo_placeholder: '（例）不擅长粉剂、担心药物相互作用等',

    step7_title: '确认填写内容',
    data_notice: '您填写的信息将通过我们药局运营的系统（Google表单服务）安全传输，仅用于药剂师的用药指导。',
    agree_text: '我同意<a href="privacy-policy-zh.html" target="_blank" rel="noopener noreferrer">个人信息处理方针</a>',

    btn_prev: '← 返回',
    btn_next: '下一步 →',
    btn_submit: '提交',
    btn_submitting: '提交中...',
    validation_required: '请填写所有必填项。',
    validation_agree: '请同意个人信息处理方针。',
    required: '必填',

    success_title: '提交完成',
    success_message: '感谢您的配合。',
    btn_close: '关闭',
    success_browser_title: '感谢您的<br>回答',
    success_browser_msg: '手续已完成。<br><br><b>请关闭此浏览器标签页。</b><br><br><span style="font-size: 0.9rem;">※ 如果您使用的是药局的平板电脑，请将其交还给工作人员。</span>',

    conf_name: '姓名',
    conf_phone: '电话号码',
    conf_condition: '患者状况',
    conf_weight: '体重',
    conf_drug_allergy: '药物过敏/副作用',
    conf_drug_allergy_detail: '药物过敏详情',
    conf_food_allergy: '食物过敏',
    conf_food_allergy_detail: '食物过敏详情',
    conf_env_allergy: '环境过敏',
    conf_current_presc: '其他医院处方',
    conf_current_presc_detail: '其他医院处方详情',
    conf_otc: '非处方药/保健品',
    conf_otc_detail: '非处方药详情',
    conf_food_drink: '日常饮食',
    conf_food_drink_detail: '饮食详情',
    conf_history: '既往病史',
    conf_driving: '驾驶',
    conf_height_work: '高处作业',
    conf_soft_contact: '软性隐形眼镜',
    conf_alcohol: '饮酒',
    conf_smoking: '吸烟',
    conf_generic: '仿制药偏好',
    conf_memo: '其他要求',
    conf_history_detail: '病史详情',

    val_none: '无',
    val_pregnant: '怀孕中（可能）',
    val_breastfeeding: '哺乳中',
    val_pediatric: '儿童（15岁以下）',
    val_yes_allergy: '有',
    val_no_allergy: '无',
    val_yes_drive: '是',
    val_no_drive: '否',
    val_yes_height: '有',
    val_no_height: '无',
    val_yes_contact: '有',
    val_no_contact: '无',
    val_yes_presc: '有',
    val_no_presc: '无',
    val_yes_smoke: '吸',
    val_no_smoke: '不吸',
    val_alcohol_none: '不喝',
    val_alcohol_occasionally: '偶尔',
    val_alcohol_daily: '每天',
    val_generic_prefer: '仿制药即可',
    val_generic_avoid: '希望原研药',

    footer: '&copy; 2025 丸山药局'
  }
};

// ===== 言語検出・適用 =====

let currentLang = 'ja';

function detectLanguage() {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (lang && I18N[lang]) {
    currentLang = lang;
  }
  return currentLang;
}

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.ja[key]) || key;
}

function applyLanguage(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;

  // Update HTML lang attribute
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;

  // Update all data-i18n elements (textContent)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });

  // Update all data-i18n-html elements (innerHTML — for links, bold etc.)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const val = t(key);
    if (val) el.innerHTML = val;
  });

  // Update all data-i18n-placeholder elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.placeholder = val;
  });

  // Update language selector
  const langSelect = document.getElementById('lang-select');
  if (langSelect) langSelect.value = lang;

  // Update URL without reload
  const url = new URL(window.location);
  if (lang === 'ja') {
    url.searchParams.delete('lang');
  } else {
    url.searchParams.set('lang', lang);
  }
  history.replaceState(null, '', url);
}
