document.addEventListener('DOMContentLoaded', () => {
    const formBox = document.querySelector('.calc-form-box');
    const resultBox = document.querySelector('.calc-result-box');
    if (!formBox || !resultBox) return;

    // 1. Знаходимо функцію розрахунку сторінки (calculate... або calc...)
    const calcFnName = Object.keys(window).find(
        key => (key.startsWith('calculate') || key.startsWith('calc')) && typeof window[key] === 'function'
    );
    const runCalc = () => {
        if (calcFnName) window[calcFnName]();
        saveStateToURL();
    };

    // 2. Завантажуємо параметри з URL у поля форми
    function loadStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        params.forEach((value, key) => {
            const el = document.getElementById(key);
            if (el && formBox.contains(el)) {
                if (el.type === 'checkbox') {
                    el.checked = value === 'true';
                } else {
                    el.value = value;
                }
            }
        });
    }

    // 3. Зберігаємо поточні значення форми в URL
    function saveStateToURL() {
        const params = new URLSearchParams();
        formBox.querySelectorAll('input, select').forEach(el => {
            if (!el.id) return;
            if (el.type === 'checkbox') {
                params.set(el.id, el.checked);
            } else if (el.value !== '') {
                params.set(el.id, el.value);
            }
        });
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }

    // 4. Універсальне копіювання (очищаємо старі слухачі через заміну кнопки)
    const oldCopyBtn = document.getElementById('copyBtn') || resultBox.querySelector('.btn-copy');
    if (oldCopyBtn) {
        const copyBtn = oldCopyBtn.cloneNode(true);
        copyBtn.removeAttribute('onclick');
        oldCopyBtn.replaceWith(copyBtn);

        copyBtn.addEventListener('click', () => {
            const title = document.querySelector('h1')?.textContent.trim() || 'Розрахунок (БудКальк)';
            let lines = [`📐 ${title} (БудКальк):\n`];

            const mainCard = resultBox.querySelector('.result-main-card');
            if (mainCard) {
                const spans = mainCard.querySelectorAll('span');
                const strong = mainCard.querySelector('strong');
                const label = spans?.textContent.trim() || 'Результат';
                const value = strong?.textContent.trim() || '';
                const note = spans?.textContent.trim() ? ` (${spans.textContent.trim()})` : '';
                lines.push(`★ ${label}: ${value}${note}`);
            }

            resultBox.querySelectorAll('.result-list li').forEach(li => {
                const name = li.querySelector('span')?.textContent.replace(':', '').trim();
                const val = li.querySelector('strong')?.textContent.trim();
                if (name && val) {
                    lines.push(`• ${name}: ${val}`);
                }
            });

            lines.push(`\n🔗 Посилання на розрахунок:\n${window.location.href}`);

            navigator.clipboard.writeText(lines.join('\n')).then(() => {
                const orig = copyBtn.textContent;
                copyBtn.textContent = '✅ Скопійовано з посиланням!';
                setTimeout(() => (copyBtn.textContent = orig), 2200);
            });
        });

        // 5. Додаємо кнопку "Зберегти в PDF / Друк"
        if (!document.getElementById('printBtn')) {
            const printBtn = document.createElement('button');
            printBtn.id = 'printBtn';
            printBtn.type = 'button';
            printBtn.className = copyBtn.className;
            printBtn.style.marginTop = '8px';
            printBtn.style.background = '#475569';
            printBtn.textContent = '🖨️ Зберегти в PDF / Друк';
            printBtn.addEventListener('click', () => window.print());
            copyBtn.insertAdjacentElement('afterend', printBtn);
        }
    }

    // Ініціалізація
    loadStateFromURL();
    runCalc();

    formBox.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', runCalc);
        el.addEventListener('change', runCalc);
    });
});
