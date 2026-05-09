import os
import sys

file_path = 'C:/Users/masam/.gemini/antigravity/scratch/line-pharmacy-app/github-pages/index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace present illness
old_present = """        <div class="input-group">
          <label class="q-label"><span data-i18n="present_illness_label">現在治療中の病気はありますか？（現病歴）</span></label>
          <p class="hint" data-i18n="present_illness_desc">現在病院に通院して治療を受けている病気や、最近かかった病気があれば教えてください。</p>
          <p class="hint" data-i18n="history_hint">※「特にない」場合はそのまま次へ進んでください（複数OK）</p>
          <div class="checkbox-grid">
            <label class="checkbox-label"><input type="checkbox" name="present-illness" value="no" checked><span data-i18n="no">ない</span></label>"""

new_present = """        <div class="input-group">
          <label class="q-label"><span data-i18n="present_illness_label">現在治療中の病気はありますか？（現病歴）</span></label>
          <p class="hint" data-i18n="present_illness_desc">現在病院に通院して治療を受けている病気や、最近かかった病気があれば教えてください。</p>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="has-present-illness" value="no" checked>
              <span data-i18n="no">ない</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="has-present-illness" value="yes">
              <span data-i18n="yes">ある</span>
            </label>
          </div>
          <div class="sub-input" id="present-illness-wrap">
            <p class="hint" data-i18n="history_hint">※当てはまるものを選択してください（複数OK）</p>
            <div class="checkbox-grid">"""
content = content.replace(old_present, new_present)

# 2. Add closing tag for present illness
old_present_close = """            <div id="present-illness-chips" class="chip-container"></div>
            <input type="hidden" name="present-illness-other-detail" id="hidden-present-illness-detail" value="">
          </div>
        </div>"""
new_present_close = """            <div id="present-illness-chips" class="chip-container"></div>
            <input type="hidden" name="present-illness-other-detail" id="hidden-present-illness-detail" value="">
          </div>
        </div>
      </div>"""
content = content.replace(old_present_close, new_present_close)

# 3. Replace past history
old_past = """        <div class="input-group">
          <label class="q-label"><span data-i18n="past_history_label">過去にかかった大きな病気はありますか？（既往歴）</span></label>
          <p class="hint" data-i18n="past_history_desc">これまでに手術や入院をしたことがある病気や、過去に治療を受けたことがある大きな病気を教えてください。</p>
          <p class="hint" data-i18n="history_hint">※「特にない」場合はそのまま次へ進んでください（複数OK）</p>
          <div class="checkbox-grid">
            <label class="checkbox-label"><input type="checkbox" name="past-history" value="no" checked><span data-i18n="no">ない</span></label>"""
new_past = """        <div class="input-group">
          <label class="q-label"><span data-i18n="past_history_label">過去にかかった大きな病気はありますか？（既往歴）</span></label>
          <p class="hint" data-i18n="past_history_desc">これまでに手術や入院をしたことがある病気や、過去に治療を受けたことがある大きな病気を教えてください。</p>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="has-past-history" value="no" checked>
              <span data-i18n="no">ない</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="has-past-history" value="yes">
              <span data-i18n="yes">ある</span>
            </label>
          </div>
          <div class="sub-input" id="past-history-wrap">
            <p class="hint" data-i18n="history_hint">※当てはまるものを選択してください（複数OK）</p>
            <div class="checkbox-grid">"""
content = content.replace(old_past, new_past)

# 4. Add closing tag for past history
old_past_close = """            <div id="past-history-chips" class="chip-container"></div>
            <input type="hidden" name="past-history-other-detail" id="hidden-past-history-detail" value="">
          </div>
        </div>
      </section>"""
new_past_close = """            <div id="past-history-chips" class="chip-container"></div>
            <input type="hidden" name="past-history-other-detail" id="hidden-past-history-detail" value="">
          </div>
        </div>
      </div>
      </section>"""
content = content.replace(old_past_close, new_past_close)

# 5. Update bindYesExpand
old_bind = """  // ===== 条件展開: yes→サブテキスト =====
  function bindYesExpand(radioName, wrapId) {
    document.querySelectorAll(`[name="${radioName}"]`).forEach(r => {
      r.addEventListener('change', () => {
        const wrap = document.getElementById(wrapId);
        const isOpen = r.value === 'yes';
        wrap.classList.toggle('open', isOpen);
        if (!isOpen) {
          wrap.querySelectorAll('input[type="text"], input[type="hidden"], textarea').forEach(input => {
            input.value = '';
          });
        }
      });
    });
  }
  bindYesExpand('drug-allergy',  'drug-allergy-detail-wrap');
  bindYesExpand('food-allergy',  'food-allergy-detail-wrap');
  bindYesExpand('current-presc', 'current-presc-detail-wrap');"""

new_bind = """  // ===== 条件展開: yes→サブテキスト =====
  function bindYesExpand(radioName, wrapId) {
    document.querySelectorAll(`[name="${radioName}"]`).forEach(r => {
      r.addEventListener('change', () => {
        const wrap = document.getElementById(wrapId);
        if (!wrap) return;
        const isOpen = r.value === 'yes';
        wrap.classList.toggle('open', isOpen);
        if (!isOpen) {
          wrap.querySelectorAll('input[type="text"], input[type="hidden"], textarea').forEach(input => {
            input.value = '';
          });
          wrap.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = false;
          });
          const chips = wrap.querySelectorAll('.chip-container');
          if (chips.length > 0) chips.forEach(c => c.innerHTML = '');
          
          // その他のサブ入力を閉じる
          const otherWraps = wrap.querySelectorAll('.sub-input');
          otherWraps.forEach(ow => ow.classList.remove('open'));
        }
      });
    });
  }
  bindYesExpand('drug-allergy',  'drug-allergy-detail-wrap');
  bindYesExpand('food-allergy',  'food-allergy-detail-wrap');
  bindYesExpand('current-presc', 'current-presc-detail-wrap');
  bindYesExpand('has-present-illness', 'present-illness-wrap');
  bindYesExpand('has-past-history', 'past-history-wrap');"""

content = content.replace(old_bind, new_bind)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
