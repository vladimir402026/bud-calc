document.addEventListener('DOMContentLoaded', () => {
    const formBox = document.querySelector('.calc-form-box');
    const resultBox = document.querySelector('.calc-result-box');
    if (!formBox || !resultBox) return;

    // 1. Знаходимо функцію розрахунку сторінки
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

    // 4. Універсальне копіювання (з резервним методом для будь-яких браузерів)
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
                const label = spans[0] ? spans[0].textContent.trim() : 'Результат';
                const value = strong ? strong.textContent.trim() : '';
                const note = spans[1] && spans[1].textContent.trim() ? ` (${spans[1].textContent.trim()})` : '';
                lines.push(`★ ${label}: ${value}${note}`);
            }

            resultBox.querySelectorAll('.result-list li').forEach(li => {
                const nameEl = li.querySelector('span');
                const valEl = li.querySelector('strong');
                if (nameEl && valEl) {
                    const name = nameEl.textContent.replace(':', '').trim();
                    const val = valEl.textContent.trim();
                    lines.push(`• ${name}: ${val}`);
                }
            });

            lines.push(`\n🔗 Посилання на розрахунок:\n${window.location.href}`);
            const textToCopy = lines.join('\n');

            // Надійне копіювання (працює навіть без HTTPS або при обмеженнях браузера)
            const fallbackCopy = (text) => {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            };

            const onSuccess = () => {
                const orig = copyBtn.textContent;
                copyBtn.textContent = '✅ Скопійовано з посиланням!';
                setTimeout(() => (copyBtn.textContent = orig), 2200);
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(onSuccess).catch(() => {
                    fallbackCopy(textToCopy);
                    onSuccess();
                });
            } else {
                fallbackCopy(textToCopy);
                onSuccess();
            }
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
