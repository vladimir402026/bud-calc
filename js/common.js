document.addEventListener('DOMContentLoaded', () => {
    const formBox = document.querySelector('.calc-form-box');
    const resultBox = document.querySelector('.calc-result-box');
    if (!formBox || !resultBox) return;

    const calcFn = Object.keys(window).find(
        k => (k.startsWith('calculate') || k.startsWith('calc')) && typeof window[k] === 'function'
    );

      // Отримуємо головне число та одиницю виміру з картки результату
    function getMainQuantity() {
        const card = resultBox.querySelector('.result-main-card');
        const strong = card?.querySelector('strong');
        if (!strong) return { qty: 0, unit: 'од.' };
        const raw = strong.textContent.trim();

        // Не додаємо блок ціни там, де калькулятор уже рахує гроші
        if (raw.includes('$') || raw.includes('грн')) {
            return { qty: 0, unit: '' };
        }

        // Якщо головний результат це відріз (напр. "3.5 × 4.9 м"), беремо площу в м² з підпису нижче
        if (raw.includes('×')) {
            const subText = card.querySelectorAll('span')?.textContent || '';
            const areaMatch = subText.match(/([\d.,]+)\s*м²/);
            if (areaMatch) {
                return { qty: parseFloat(areaMatch.replace(',', '.')), unit: 'м²' };
            }
            return { qty: 0, unit: '' };
        }

        const match = raw.match(/[\d.,]+/);
        const qty = match ? parseFloat(match.replace(',', '.')) : 0;
        const unit = raw.replace(/[\d.,\s~]+/, '').trim() || 'од.';
        return { qty, unit };
    }

        const match = raw.match(/[\d.,]+/);
        const qty = match ? parseFloat(match[0].replace(',', '.')) : 0;
        const unit = raw.replace(/[\d.,\s~]+/, '').trim() || 'од.';
        return { qty, unit };
    }

    // Створюємо блок кошторису (якщо головний результат кількісний)
    let costInput = null;
    let costTotalEl = null;
    let costUnitLabel = null;

    const initialMain = getMainQuantity();
    if (initialMain.qty > 0 && initialMain.unit !== '') {
        const costBox = document.createElement('div');
        costBox.id = 'costEstimatorBox';
        costBox.style.cssText = 'margin: 16px 0; padding: 14px; background: #fff; border: 1px solid #fed7aa; border-radius: 8px;';
        costBox.innerHTML = `
            <div style="font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
                💰 Орієнтовна вартість (необов'язково)
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" id="unitPriceInput" placeholder="Ціна за 1 ${initialMain.unit} (грн)" min="0" step="1"
                    style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem;">
            </div>
            <div id="costTotalRow" style="display: none; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.9rem; color: #334155;">Разом за матеріал:</span>
                <strong id="costTotalVal" style="font-size: 1.2rem; color: #ea580c;">0 грн</strong>
            </div>
        `;

        const resultList = resultBox.querySelector('.result-list');
        if (resultList) {
            resultList.insertAdjacentElement('afterend', costBox);
        }

        costInput = document.getElementById('unitPriceInput');
        costTotalEl = document.getElementById('costTotalVal');
        costUnitLabel = document.getElementById('costTotalRow');
    }

    function updateCost() {
        if (!costInput || !costTotalEl || !costUnitLabel) return;
        const { qty, unit } = getMainQuantity();
        costInput.placeholder = `Ціна за 1 ${unit} (грн)`;
        const price = parseFloat(costInput.value) || 0;

        if (price > 0 && qty > 0) {
            const total = Math.round(qty * price);
            const formatted = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            costTotalEl.textContent = `${formatted} грн`;
            costUnitLabel.style.display = 'flex';
        } else {
            costUnitLabel.style.display = 'none';
        }
    }

    const run = () => {
        if (calcFn) window[calcFn]();
        updateCost();
    };

    if (costInput) {
        costInput.addEventListener('input', updateCost);
    }

    // Кнопка копіювання
    const oldBtn = document.getElementById('copyBtn') || resultBox.querySelector('.btn-copy');
    if (oldBtn) {
        const btn = oldBtn.cloneNode(true);
        btn.removeAttribute('onclick');
        oldBtn.replaceWith(btn);

        btn.addEventListener('click', () => {
            const titleEl = document.querySelector('h1');
            const title = titleEl ? titleEl.textContent.trim() : 'Розрахунок';
            let text = `📐 ${title} (БудКальк):\n\n`;

            const main = resultBox.querySelector('.result-main-card');
            if (main) text += `★ ${main.innerText.replace(/\n+/g, ' ')}\n`;

            resultBox.querySelectorAll('.result-list li').forEach(li => {
                text += `• ${li.innerText.replace(/\n+/g, ' ')}\n`;
            });

            if (costInput && parseFloat(costInput.value) > 0 && costTotalEl) {
                text += `\n💰 Орієнтовна вартість: ${costTotalEl.textContent} (по ${costInput.value} грн)\n`;
            }

            text += `\n🔗 ${window.location.href}`;

            navigator.clipboard.writeText(text);
            const orig = btn.textContent;
            btn.textContent = '✅ Скопійовано!';
            setTimeout(() => (btn.textContent = orig), 2000);
        });

        // Кнопка PDF
        if (!document.getElementById('printBtn')) {
            const pdf = document.createElement('button');
            pdf.id = 'printBtn';
            pdf.type = 'button';
            pdf.className = btn.className;
            pdf.style.marginTop = '8px';
            pdf.style.background = '#475569';
            pdf.textContent = '🖨️ Зберегти в PDF / Друк';
            pdf.onclick = () => window.print();
            btn.after(pdf);
        }
    }

    run();
    formBox.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', run);
        el.addEventListener('change', run);
    });
});
