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
        senseSelector: '.def-block.ddef_block',  // 更新为更精确的选择器
        definitionSelector: '.def.ddef_d.db',    // 定义部分选择器
        exampleSelector: '.examp.dexamp',        // 例句部分选择器
        containerPadding: {
            x: 12,
            y: 8
        }
    },
    'collins': {
        name: 'Collins Dictionary',
        senseSelector: 'div.sense',  // 适配新的结构
        definitionSelector: 'div.def',  // 定义部分选择器
        exampleSelector: 'span.cit.quote',  // 例句部分选择器
        containerPadding: {
            x: 0,
            y: 0
        }
    },
    'oxford': {
        name: 'Oxford Dictionary',
        senseSelector: '.sense, .gramb',
        containerPadding: {
            x: 16,
            y: 16
        }
    },
    'merriam': {  // **新增韦氏词典支持**
        name: 'Merriam-Webster Dictionary',
        senseSelector: 'div.sense.has-sn',   // 选中具体释义块
        definitionSelector: 'span.dtText',   // 选中定义文本
        exampleSelector: '',   // 韦氏示例句结构不明确，暂时留空
        containerPadding: {x: 8, y: 8}
    }
};

// 检测当前页面属于哪个词典
function detectDictionary() {
    const hostname = window.location.hostname;
    if (hostname.includes('ldoceonline')) return 'ldoce';
    if (hostname.includes('dictionary.cambridge')) return 'cambridge';
    if (hostname.includes('collinsdictionary')) return 'collins';
    if (hostname.includes('oxford')) return 'oxford';
    if (hostname.includes('merriam-webster')) return 'merriam';  // **新增韦氏词典检测**
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
        
        /* 剑桥词典特定样式 */
        .cambridge-sense-hover {
            border: 2px solid red !important;
            background-color: rgba(255, 0, 0, 0.02) !important;
            border-radius: 6px !important;
            margin: 8px 0 !important;
        }
        
        /* 剑桥词典定义和例句高亮 */
        .cambridge-sense-hover .def.ddef_d.db {
            padding: 8px 12px !important;
            background-color: rgba(255, 0, 0, 0.03) !important;
        }
        
        .cambridge-sense-hover .examp.dexamp {
            padding: 4px 12px !important;
            margin-top: 4px !important;
            background-color: rgba(255, 0, 0, 0.01) !important;
        }
        
        /* 确保词典网站的固有样式不会干扰我们的高亮效果 */
        .cambridge-sense-hover * {
            background-color: transparent !important;
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

// 计算截图区域
function calculateScreenshotArea(element, config) {
    const rect = element.getBoundingClientRect();
    let totalHeight = rect.height;
    let maxWidth = rect.width;

    const x = Math.round(rect.left + window.scrollX - config.containerPadding.x);
    const y = Math.round(rect.top + window.scrollY - config.containerPadding.y);

    let width = Math.round(maxWidth + (config.containerPadding.x * 2));
    let height = Math.round(totalHeight + (config.containerPadding.y * 2));

    // 剑桥词典增加宽度 1.25 倍
    if (config.name === 'Cambridge Dictionary') {
        width = Math.round(width * 1.25);
    }

    return {x, y, width, height};
}

// 初始化事件监听
function initializeEventListeners(config) {
    // 监听鼠标悬停
    document.addEventListener("mouseover", (event) => {
        const sense = event.target.closest(config.senseSelector);
        if (sense) {
            if (config.name === 'Cambridge Dictionary') {
                sense.classList.add("cambridge-sense-hover");
            } else {
                sense.classList.add("sense-hover");
            }
        }
    });

    document.addEventListener("mouseout", (event) => {
        const sense = event.target.closest(config.senseSelector);
        if (sense) {
            if (config.name === 'Cambridge Dictionary') {
                sense.classList.remove("cambridge-sense-hover");
            } else {
                sense.classList.remove("sense-hover");
            }
        }
    });

    // 监听双击事件
    document.addEventListener("dblclick", (event) => {
        const sense = event.target.closest(config.senseSelector);
        if (!sense) return;

        const {
            x,
            y,
            width,
            height
        } = calculateScreenshotArea(sense, config);

        // 构建 CleanShot URL
        const cleanshotUrl = `cleanshot://all-in-one?x=${x}&y=${y}&width=${width}&height=${height}&action=copy`;

        console.log(`Screenshot params for ${config.name}:`, {
            x, y, width, height,
            url: cleanshotUrl,
            element: sense
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

    observer.observe(document.body, {childList: true, subtree: true});
}

// 启动应用
initialize();