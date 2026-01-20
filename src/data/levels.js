export const CHAPTERS = [
    {
        id: 'chapter_1',
        title: { zh: '基礎探索', en: 'Basics' },
        description: { zh: '形狀、顏色、數字 (4-6歲)', en: 'Shapes, Colors, Numbers (Age 4-6)' },
        color: '#90D056', // Grass Green
        levels: [1, 2, 3, 4, 5, 6, 7]
    },
    {
        id: 'chapter_2',
        title: { zh: '跨學科挑戰', en: 'Challenges' },
        description: { zh: '數學、邏輯、生活知識 (6-8歲)', en: 'Math, Logic, Life Skills (Age 6-8)' },
        color: '#FF9F45', // Soft Orange
        levels: [8, 9, 10, 11, 12, 13, 14]
    },
    {
        id: 'chapter_3',
        title: { zh: '進階挑戰', en: 'Advanced' },
        description: { zh: '程式邏輯、科學實驗 (8-10歲)', en: 'Coding, Science, Logic (Age 8-10)' },
        color: '#646cff', // Purple
        levels: [15, 16, 17, 18, 19, 20, 21]
    },
    {
        id: 'chapter_4',
        title: { zh: '巔峰挑戰', en: 'Expert' },
        description: { zh: '綜合極限、創意實踐 (10歲+)', en: 'Mastery & Creativity (Age 10+)' },
        color: '#FF6B6B', // Red
        levels: [22, 23, 24, 25, 26, 27, 28]
    }
];

export const LEVEL_CONFIG = {
    // --- Chapter 1: Basics (4-6) ---
    1: { title: { zh: "形狀配對", en: "Drag Shape" }, type: "drag_shape", description: { zh: "將圓形拖到正確位置", en: "Drag the circle to correct place" } },
    2: { title: { zh: "顏色分類", en: "Color Match" }, type: "color_match", description: { zh: "找出紅色的蘋果", en: "Find red apples" } },
    3: { title: { zh: "大小分類", en: "Size Sort" }, type: "size_sort", description: { zh: "把大的東西放進大箱子", en: "Sort items by size" } },
    4: { title: { zh: "數字接龍", en: "Number Order" }, type: "number_order", description: { zh: "排列 1-10 數字", en: "Order numbers 1-10" } },
    5: { title: { zh: "拼音拼圖", en: "Phonics" }, type: "phonics", description: { zh: "拼合拼音字母完成詞語", en: "Combine letters to form words" }, title_reward: "小冒險家" },
    6: { title: { zh: "動物配對", en: "Animal Match" }, type: "animal_match", description: { zh: "圖片與名稱配對", en: "Match animal pictures" } },
    7: { title: { zh: "交通工具", en: "Transport" }, type: "vehicle_sort", description: { zh: "分類汽車火車飛機", en: "Sort vehicles" } },

    // --- Chapter 2: Interdisciplinary (6-8) ---
    8: { title: { zh: "數學故事", en: "Math Story" }, type: "math_story", description: { zh: "解答簡單式 5+?=8", en: "Solve simple equations" } },
    9: { title: { zh: "生活邏輯", en: "Life Logic" }, type: "logic_sort", description: { zh: "將日常步驟排序", en: "Order daily steps" } },
    10: { title: { zh: "邏輯迷宮", en: "Logic Maze" }, type: "maze", description: { zh: "走迷宮並解答邏輯謎題", en: "Maze with logic puzzles" }, title_reward: "勇敢騎士" },
    11: { title: { zh: "圖形數學", en: "Pixel Math" }, type: "pixel_puzzles", description: { zh: "根據數字提示拼出圖形", en: "Solve pixel puzzles" } },
    12: { title: { zh: "語文劇場", en: "Word Story" }, type: "story_fill", description: { zh: "選擇正確詞語完成故事", en: "Fill in the story words" } },
    13: { title: { zh: "環境守護", en: "Recycling" }, type: "recycling", description: { zh: "分類垃圾愛地球", en: "Sort the recycling" } },
    14: { title: { zh: "音樂節奏", en: "Rhythm" }, type: "rhythm", description: { zh: "跟隨節奏點擊音符", en: "Tap to the rhythm" } },

    // --- Chapter 3: Advanced (8-10) ---
    15: { title: { zh: "數學方程", en: "Equations" }, type: "equation", description: { zh: "解答一元一次方程", en: "Solve linear equations" }, title_reward: "智慧法師" },
    16: { title: { zh: "科學實驗", en: "Water Cycle" }, type: "science_water", description: { zh: "模擬水循環過程", en: "Simulate water cycle" } },
    17: { title: { zh: "資源管理", en: "Resources" }, type: "resource_mgmt", description: { zh: "分配食物與水資源", en: "Manage food and water" } },
    18: { title: { zh: "程式積木", en: "Coding Blocks" }, type: "coding_blocks", description: { zh: "拖曳程式積木完成指令", en: "Drag blocks to code" } },
    19: { title: { zh: "邏輯推理", en: "Deduction" }, type: "logic_deduction", description: { zh: "解答推理題", en: "Solve logic riddles" } },
    20: { title: { zh: "科學探險", en: "Exploration" }, type: "exploration", description: { zh: "探索火山/海洋/太空", en: "Explore nature" }, title_reward: "龍之勇者" },
    21: { title: { zh: "森林派對", en: "Sandbox" }, type: "creative_sandbox", description: { zh: "幫忙將動物們歸位並準備派對", en: "Arrange animals for party" } },

    // --- Chapter 4: Expert (10+) ---
    22: { title: { zh: "知識考驗", en: "Quiz Marathon" }, type: "quiz_marathon", description: { zh: "綜合題庫限時答題", en: "Timed quiz challenge" } },
    23: { title: { zh: "資源分配", en: "Village Sim" }, type: "village_sim", description: { zh: "模擬村莊資源管理", en: "Village resource sim" } },
    24: { title: { zh: "創意工坊", en: "Game Maker" }, type: "game_maker", description: { zh: "單人設計小遊戲", en: "Design your own game" } },
    25: { title: { zh: "探險家", en: "Deep Explorer" }, type: "adv_exploration", description: { zh: "深層科學探險任務", en: "Deep science mission" } },
    26: { title: { zh: "程式挑戰", en: "Coding Challenge" }, type: "coding_challenge", description: { zh: "撰寫程式碼解決問題", en: "Write code to solve" } },
    27: { title: { zh: "複合任務", en: "Complex Mission" }, type: "complex_mission", description: { zh: "結合數學與邏輯", en: "Math & Logic combined" } },
    28: { title: { zh: "終極試煉", en: "Final Exam" }, type: "final_exam", description: { zh: "綜合能力最終挑戰", en: "Final comprehensive exam" } },
    29: { title: { zh: "BOSS挑戰", en: "Boss Challenge" }, type: "god_domain", description: { zh: "傳說中的神之領域", en: "The Domain of God" }, title_reward: "神之領域" },

    // --- Special Bonus Levels ---
    'S1': { title: { zh: "綜合挑戰 I", en: "Review I" }, type: "review_1", description: { zh: "第一章總複習 (加分關卡)", en: "Chapter 1 Review" }, title_reward: "星星寶箱" },
    'S2': { title: { zh: "綜合挑戰 II", en: "Review II" }, type: "review_2", description: { zh: "第二章總複習 (加分關卡)", en: "Chapter 2 Review" }, title_reward: "星星寶箱" },
    'S3': { title: { zh: "綜合挑戰 III", en: "Review III" }, type: "review_3", description: { zh: "第三章總複習 (加分關卡)", en: "Chapter 3 Review" }, title_reward: "星星寶箱" }
};

// Helper: Get localized config
// If language is provided, flatten the object.
export const getLevelConfig = (level, language = 'zh-TW') => {
    const raw = LEVEL_CONFIG[level] || {
        title: { zh: `關卡 ${level}`, en: `Level ${level}` },
        type: "generic",
        appearance: "char_default.png",
        background: "bg_default.png",
        description: { zh: "完成挑戰以獲得獎勵", en: "Complete challenge for rewards" }
    };

    // Flatten for consumer convenience
    const langKey = language === 'en-US' ? 'en' : 'zh';
    return {
        ...raw,
        title: raw.title[langKey] || raw.title['zh'],
        description: raw.description[langKey] || raw.description['zh']
    };
};

export const getChapterByLevel = (level) => {
    return CHAPTERS.find(chap => chap.levels.includes(level));
};
