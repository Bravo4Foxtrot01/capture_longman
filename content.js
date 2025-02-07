// 定义支持的词典配置
const DICTIONARY_CONFIGS = {
    'ldoce': {
        name: 'Longman Dictionary',
        senseSelector: 'span.Sense',
        containerPadding: {
            x: 16,
            y: 16
        }
    },
    'cambridge': {
        name: 'Cambridge Dictionary',
        senseSelector: '.def-block, .ddef_block',
        containerPadding: {
            x: 16,
            y: 16
        }
    },
    'collins': {
        name: 'Collins Dictionary',
        senseSelector: '.def, .hom',
        containerPadding: {
            x: 16,
            y: 16
        }
    },
    'oxford': {
        name: 'Oxford Dictionary',
        senseSelector: '.sense, .gramb',
        containerPadding: {
            x: 16,
            y: 16
        }
    }
};

// 检测当前页面属于哪个词典
function detectDictionary() {
    const hostname = window.location.hostname;
    if (hostname.includes('ldoceonline')) return 'ldoce';
    if (hostname.includes('dictionary.cambridge')) return 'cambridge';
    if (hostname.includes('collinsdictionary')) return 'collins';
    if (hostname.includes('oxford')) return 'oxford';
    return null;
}

// 初始化样式
function initializeStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .sense-hover {
            border: 1px solid red !important;
            background-color: rgba(255, 0, 0, 0.05) !important;
        }
        .screenshot-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            animation: fadeInOut 2s ease-in-out;
        }
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-10px); }
            15% { opacity: 1; transform: translateY(0); }
            85% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);
}

// 显示提示信息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'screenshot-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 2000);
}

// 初始化事件监听
function initializeEventListeners(config) {
    // 监听鼠标悬停
    document.addEventListener("mouseover", (event) => {
        const sense = event.target.closest(config.senseSelector);
        if (sense) sense.classList.add("sense-hover");
    });

    document.addEventListener("mouseout", (event) => {
        const sense = event.target.closest(config.senseSelector);
        if (sense) sense.classList.remove("sense-hover");
    });

    // 监听双击事件
    document.addEventListener("dblclick", (event) => {
        const sense = event.target.closest(config.senseSelector);
        if (!sense) return;

        const rect = sense.getBoundingClientRect();
        const x = Math.round(rect.left + window.scrollX - config.containerPadding.x);
        const y = Math.round(rect.top + window.scrollY - config.containerPadding.y);
        const width = Math.round(rect.width + (config.containerPadding.x * 2));
        const height = Math.round(rect.height + (config.containerPadding.y * 2));

        // 构建 CleanShot URL
        const cleanshotUrl = `cleanshot://all-in-one?x=${x}&y=${y}&width=${width}&height=${height}&action=copy`;
        
        console.log(`Screenshot params for ${config.name}:`, {
            x, y, width, height,
            url: cleanshotUrl
        });

        showToast(`正在调用 CleanShot X 截取 ${config.name} 词条...`);
        window.location.href = cleanshotUrl;
    });
}

// 主函数
function initialize() {
    const dictionaryType = detectDictionary();
    if (!dictionaryType) {
        console.log('未检测到支持的词典网站');
        return;
    }

    const config = DICTIONARY_CONFIGS[dictionaryType];
    console.log(`检测到 ${config.name}，正在初始化...`);

    initializeStyles();
    initializeEventListeners(config);

    // 设置 MutationObserver 以处理动态加载的内容
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList" || mutation.type === "subtree") {
                // 可以在这里添加特定词典的动态内容处理逻辑
                break;
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// 启动应用
initialize();