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
        senseSelector: '.def-block.ddef_block',
        definitionSelector: '.def.ddef_d.db',
        exampleSelector: '.examp.dexamp',
        containerPadding: {
            x: 12,
            y: 8
        }
    },
    'collins': {
        name: 'Collins Dictionary',
        senseSelector: 'div.sense',
        definitionSelector: 'div.def',
        exampleSelector: 'span.cit.quote',
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
    'merriam': {
        name: 'Merriam-Webster Dictionary',
        senseSelector: 'div.sense', // 更新选择器
        definitionSelector: 'span.dtText',
        exampleSelector: 'span.ex-sent',
        containerPadding: {x: 8, y: 8}
    },
    'urban': {
        name: 'Urban Dictionary',
        senseSelector: 'div.meaning',
        definitionSelector: 'div.meaning',
        exampleSelector: 'div.example',
        containerPadding: {
            x: 12,
            y: 8
        }
    },
    // 添加 Free Dictionary 支持
    'freedictionary': {
        name: 'Free Dictionary',
        senseSelector: 'div.ds-list',
        illustrationSelector: 'span.illustration',
        containerPadding: {
            x: 0,
            y: 0
        }
    }
};

// 获取浏览器窗口信息的辅助函数
function getWindowInfo() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        left: window.screenX,
        top: window.screenY
    };
}

function detectDictionary() {
    const hostname = window.location.hostname;
    if (hostname.includes('ldoceonline')) return 'ldoce';
    if (hostname.includes('dictionary.cambridge')) return 'cambridge';
    if (hostname.includes('collinsdictionary')) return 'collins';
    if (hostname.includes('oxford')) return 'oxford';
    if (hostname.includes('merriam-webster')) return 'merriam';
    if (hostname.includes('urbandictionary')) return 'urban';
    if (hostname.includes('thefreedictionary')) return 'freedictionary';
    return null;
}

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
        
        /* Free Dictionary 特定样式 */
        .freedictionary-sense-hover {
            border: 2px solid red !important;
            background-color: rgba(255, 0, 0, 0.02) !important;
            border-radius: 4px !important;
            margin: 8px 0 !important;
            padding: 8px !important;
        }
        
        .freedictionary-sense-hover .illustration {
            display: block !important;
            margin-top: 8px !important;
            padding-left: 20px !important;
            color: #666 !important;
        }

        /* Merriam-Webster 词典特定样式 */
        .merriam-sense-hover {
            border: 2px solid red !important;
            background-color: rgba(255, 0, 0, 0.02) !important;
            border-radius: 4px !important;
            margin: 8px 0 !important;
            padding: 8px !important;
        }

        .merriam-sense-hover .dtText {
            padding: 4px 8px !important;
            background-color: rgba(255, 0, 0, 0.03) !important;
        }

        .merriam-sense-hover .ex-sent {
            padding: 4px 8px !important;
            margin-top: 4px !important;
            background-color: rgba(255, 0, 0, 0.01) !important;
        }
        
        /* 确保词典网站的固有样式不会干扰我们的高亮效果 */
        .cambridge-sense-hover *,
        .freedictionary-sense-hover *,
        .merriam-sense-hover * {
            background-color: transparent !important;
        }
    `;
    document.head.appendChild(style);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'screenshot-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 2000);
}

function calculateScreenshotArea(element, config) {
    const rect = element.getBoundingClientRect();
    let totalHeight = rect.height;
    let maxWidth = rect.width;

    // 添加内边距
    let width = Math.round(maxWidth + (config.containerPadding.x * 2));
    let height = Math.round(totalHeight + (config.containerPadding.y * 2));

    // 剑桥词典增加宽度 1.25 倍
    if (config.name === 'Cambridge Dictionary') {
        width = Math.round(width * 1.25);
    }

    // 获取浏览器窗口信息
    const windowInfo = getWindowInfo();

    // 计算窗口在屏幕上的中心点
    const browserCenterX = windowInfo.left + (windowInfo.width / 2);
    const browserCenterY = windowInfo.top + (windowInfo.height / 2);

    // 计算截图框的左上角坐标，使其居中
    // 注意：由于 CleanShot 使用左下角作为原点，需要转换 Y 坐标
    const x = Math.round(browserCenterX - (width / 2));
    const y = Math.round(window.screen.height - (browserCenterY + (height / 2)));

    return {
        x,
        y,
        width,
        height,
        debug: {
            browserWindow: windowInfo,
            calculatedCenter: {
                x: browserCenterX,
                y: browserCenterY
            }
        }
    };
}

function initializeEventListeners(config) {
    document.addEventListener("mouseover", (event) => {
        const sense = event.target.closest(config.senseSelector);
        if (sense) {
            if (config.name === 'Cambridge Dictionary') {
                sense.classList.add("cambridge-sense-hover");
            } else if (config.name === 'Free Dictionary') {
                sense.classList.add("freedictionary-sense-hover");
            } else if (config.name === 'Merriam-Webster Dictionary') {
                sense.classList.add("merriam-sense-hover");
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
            } else if (config.name === 'Free Dictionary') {
                sense.classList.remove("freedictionary-sense-hover");
            } else if (config.name === 'Merriam-Webster Dictionary') {
                sense.classList.remove("merriam-sense-hover");
            } else {
                sense.classList.remove("sense-hover");
            }
        }
    });

    document.addEventListener("dblclick", (event) => {
        const sense = event.target.closest(config.senseSelector);
        if (!sense) return;

        const {
            x,
            y,
            width,
            height,
            debug
        } = calculateScreenshotArea(sense, config);

        const cleanshotUrl = `cleanshot://all-in-one?x=${x}&y=${y}&width=${width}&height=${height}&action=copy`;

        console.log(`Screenshot params for ${config.name}:`, {
            x, y, width, height,
            url: cleanshotUrl,
            element: sense,
            debugInfo: debug
        });

        showToast(`正在调用 CleanShot X 截取 ${config.name} 词条...`);
        window.location.href = cleanshotUrl;
    });
}

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

    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList" || mutation.type === "subtree") {
                break;
            }
        }
    });

    observer.observe(document.body, {childList: true, subtree: true});
}

// 启动应用
initialize();