document.addEventListener('DOMContentLoaded', () => {
    const formBox = document.querySelector('.calc-form-box');
    const resultBox = document.querySelector('.calc-result-box');
    if (!formBox || !resultBox) return;

    // 1. Знаходимо функцію розрахунку сторінки (будь-яку функцію, що починається на calculate...)
    const calcFnName = Object.keys(window).find(
        key => key.startsWith('calculate') && typeof window[key] === 'function'
    );
    const runCalc = () => {
        if (calcFnName) window[calcFnName]();
        saveStateToURL();
    };

    // 2. Завантажуємо параметри з URL у поля форми за їхніми id
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

    // 4. Універсальне копіювання результатів із будь-якого калькулятора
    window.copyResults = function () {
        const title = document.querySelector('h1')?.textContent.trim() || 'Розрахунок (БудКальк)';
        let lines = [`📐 ${title} (БудКальк):\n`];

        // Головна картка результату
        const mainCard = resultBox.querySelector('.result-main-card');
        if (mainCard) {
            const spans = mainCard.querySelectorAll('span');
            const strong = mainCard.querySelector('strong');
            const label = spans[0]?.textContent.trim() || 'Результат';
            const value = strong?.textContent.trim() || '';
            const note = spans[1]?.textContent.trim() ? ` (${spans[1].textContent.trim()})` : '';
            lines.push(`★ ${label}: ${value}${note}`);
        }

        // Список усіх комплектуючих / параметрів
        resultBox.querySelectorAll('.result-list li').forEach(li => {
            const name = li.querySelector('span')?.textContent.replace(':', '').trim();
            const val = li.querySelector('strong')?.textContent.trim();
            if (name && val) {
                lines.push(`• ${name}: ${val}`);
            }
        });

        lines.push(`\n🔗 Посилання на розрахунок:\n${window.location.href}`);

        navigator.clipboard.writeText(lines.join('\n')).then(() => {
            const btn = document.getElementById('copyBtn');
            if (!btn) return;
            const orig = btn.textContent;
            btn.textContent = '✅ Скопійовано з посиланням!';
            setTimeout(() => (btn.textContent = orig), 2200);
        });
    };

    // 5. Автоматично додаємо кнопку "Зберегти в PDF / Друк" після кнопки копіювання
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn && !document.getElementById('printBtn')) {
        const printBtn = document.createElement('button');
        printBtn.id = 'printBtn';
        printBtn.type = 'button';
        printBtn.className = copyBtn.className;
        printBtn.style.marginTop = '8px';
        printBtn.style.background = '#475569';
        printBtn.textContent = '🖨️ Зберегти в PDF / Друк';
        printBtn.onclick = () => window.print();
        copyBtn.insertAdjacentElement('afterend', printBtn);
    }

    // Ініціалізація: підставляємо дані з URL -> рахуємо -> вішаємо слухачі
    loadStateFromURL();
    runCalc();

    formBox.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', runCalc);
        el.addEventListener('change', runCalc);
    });
});
