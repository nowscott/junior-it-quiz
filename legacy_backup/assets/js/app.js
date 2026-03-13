// 全局变量
let currentModule = 'module1';
let currentQuestionIndex = 0;
let userAnswers = {};
let completedModules = {};

// 考试相关变量
let examQuestions = [];
let examUserAnswers = [];
let examStartTime = null;
let examTimerInterval = null;
let examTimeLimit = 60 * 60;
let examRemainingTime = examTimeLimit;

// 无尽模式相关变量
let infiniteQuestionPool = [];
let infinitePoolIndex = 0;

// 初始化页面
function initPage() {
    // 初始化随机考试模块数据
    questionData.randomExam = {
        title: "随机综合考试",
        moduleTag: "综合考试",
        questions: []
    };
    
    // 初始化随机无尽模式模块数据
    questionData.infiniteMode = {
        title: "随机无尽模式",
        moduleTag: "无尽模式",
        questions: []
    };
    
    // 生成模块列表（包含随机考试和无尽模式）
    generateModuleList();
    
    // 显示第一个模块的第一个题目
    showQuestion(currentModule, currentQuestionIndex);
    
    // 初始化用户答案存储
    for (const module in questionData) {
        userAnswers[module] = new Array(questionData[module].questions.length || 20).fill(null);
        completedModules[module] = false;
    }
    
    // 添加事件监听
    document.getElementById('prevBtn').addEventListener('click', showPreviousQuestion);
    document.getElementById('nextBtn').addEventListener('click', showNextQuestion);
    document.getElementById('restartBtn')?.addEventListener('click', restartQuiz);
    document.getElementById('submitExamBtn').addEventListener('click', submitExam);
    document.getElementById('closeModal').addEventListener('click', closeImageModal);
    
    // 点击模态框背景关闭图片
    document.getElementById('imageModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeImageModal();
        }
    });
    
    // 按ESC键关闭图片
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
    
    // 更新进度点
    updateProgressDots();
    
    // 初始化定位功能
    initPositionFunction();
}

// 生成模块列表
function generateModuleList() {
    const moduleList = document.getElementById('moduleList');
    moduleList.innerHTML = '';
    
    // 添加6个常规模块
    const moduleOrder = ['module1', 'module2', 'module3', 'module4', 'module5', 'module6'];
    
    moduleOrder.forEach(moduleId => {
        const module = questionData[moduleId];
        const moduleItem = document.createElement('li');
        moduleItem.className = 'module-item';
        moduleItem.dataset.module = moduleId;
        
        if (moduleId === currentModule) {
            moduleItem.classList.add('active');
        }
        
        moduleItem.innerHTML = `
            <div>
                <div>${module.title}</div>
                <div class="question-count">${module.questions.length}题</div>
            </div>
            <span class="progress-dot" id="dot-${moduleId}"></span>
        `;
        
        moduleItem.addEventListener('click', function() {
            switchModule(moduleId);
        });
        
        moduleList.appendChild(moduleItem);
    });
    
    // 添加随机考试模块
    const examItem = document.createElement('li');
    examItem.className = 'module-item';
    examItem.dataset.module = 'randomExam';
    
    if (currentModule === 'randomExam') {
        examItem.classList.add('active');
    }
    
    examItem.innerHTML = `
        <div>
            <div><i class="fas fa-graduation-cap"></i> 随机综合考试</div>
            <div class="question-count">20题（随机抽题）</div>
        </div>
        <span class="progress-dot" id="dot-randomExam"></span>
    `;
    
    examItem.addEventListener('click', function() {
        switchModule('randomExam');
    });
    
    moduleList.appendChild(examItem);
    
    // 添加随机无尽模式模块
    const infiniteItem = document.createElement('li');
    infiniteItem.className = 'module-item';
    infiniteItem.dataset.module = 'infiniteMode';
    
    if (currentModule === 'infiniteMode') {
        infiniteItem.classList.add('active');
    }
    
    infiniteItem.innerHTML = `
        <div>
            <div><i class="fas fa-infinity"></i> 随机无尽模式</div>
            <div class="question-count">不限题数（自动刷题）</div>
        </div>
        <span class="progress-dot" id="dot-infiniteMode"></span>
    `;
    
    infiniteItem.addEventListener('click', function() {
        switchModule('infiniteMode');
    });
    
    moduleList.appendChild(infiniteItem);
}

// 切换模块
function switchModule(moduleId) {
    // 如果当前在考试或无尽模式中，提示用户
    if ((currentModule === 'randomExam' || currentModule === 'infiniteMode') && 
        userAnswers[currentModule] && userAnswers[currentModule].some(a => a !== null)) {
        const modeName = currentModule === 'randomExam' ? '考试' : '无尽模式';
        if (!confirm(`您正在进行${modeName}，切换模块将丢失当前进度。确定要切换吗？`)) {
            return;
        }
    }
    
    // 如果切换到随机考试模块
    if (moduleId === 'randomExam') {
        const confirmMessage = 
            '是否开始随机综合考试？\n\n' +
            '📋 考试规则：\n' +
            '• 从6个模块随机抽取20题\n' +
            '• 每个模块至少1题\n' +
            '• 每题5分，总分100分\n' +
            '• 考试时间60分钟\n\n' +
            '⏱️ 考试开始后：\n' +
            '• 将自动开始计时\n' +
            '• 可随时提交试卷\n' +
            '• 提交后可查看错题';
        
        if (confirm(confirmMessage)) {
            startRandomExam();
        } else {
            return;
        }
    } else if (moduleId === 'infiniteMode') {
        const confirmMessage = 
            '是否开启随机无尽模式？\n\n' +
            '🚀 模式规则：\n' +
            '• 从全库随机抽取题目\n' +
            '• 做完一题自动随机生成下一题\n' +
            '• 适合快速刷题和巩固知识点';
        
        if (confirm(confirmMessage)) {
            startInfiniteMode();
        } else {
            return;
        }
    } else {
        // 普通模块切换
        currentModule = moduleId;
        currentQuestionIndex = 0;
        
        // 更新模块列表活动状态
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.module === moduleId) {
                item.classList.add('active');
            }
        });
        
        // 隐藏考试相关元素
        document.getElementById('examTimer').style.display = 'none';
        document.getElementById('examInfoPanel').style.display = 'none';
        document.getElementById('submitExamBtn').style.display = 'none';
        document.getElementById('wrongQuestionsContainer').style.display = 'none';
        
        // 如果不是无尽模式，显示定位功能
        if (moduleId !== 'infiniteMode') {
            document.querySelector('.position-container').style.display = 'block';
        } else {
            document.querySelector('.position-container').style.display = 'none';
        }
        
        // 显示新模块的第一个题目
        showQuestion(moduleId, 0);
        
        // 隐藏得分容器
        document.getElementById('scoreContainer').style.display = 'none';
        
        // 显示导航按钮
        document.querySelector('.navigation-buttons').style.display = 'flex';
        
        // 更新最大题目数显示
        updateMaxQuestionNumber();
        
        // 清空定位输入框
        document.getElementById('positionInput').value = '';
        updatePositionHint();
    }
}

// ============ 无尽模式函数 ============

// 开始无尽模式
function startInfiniteMode() {
    currentModule = 'infiniteMode';
    currentQuestionIndex = 0;
    
    // 初始化无尽模式数据
    questionData.infiniteMode.questions = [];
    userAnswers.infiniteMode = [];
    
    // 初始化无尽题目池
    initInfinitePool();
    
    // 隐藏考试和成绩相关 UI
    document.getElementById('examTimer').style.display = 'none';
    document.getElementById('examInfoPanel').style.display = 'none';
    document.getElementById('submitExamBtn').style.display = 'none';
    document.getElementById('wrongQuestionsContainer').style.display = 'none';
    document.getElementById('scoreContainer').style.display = 'none';
    
    // 隐藏定位功能
    document.querySelector('.position-container').style.display = 'none';
    
    // 随机生成第一题
    generateNextInfiniteQuestion();
    
    // 更新模块列表状态
    document.querySelectorAll('.module-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.module === 'infiniteMode') {
            item.classList.add('active');
        }
    });
    
    // 显示导航按钮
    document.querySelector('.navigation-buttons').style.display = 'flex';
}

// 初始化无尽模式题目池（全库题目洗牌）
function initInfinitePool() {
    infiniteQuestionPool = [];
    const allModules = ['module1', 'module2', 'module3', 'module4', 'module5', 'module6'];
    
    allModules.forEach(moduleId => {
        const module = questionData[moduleId];
        module.questions.forEach(q => {
            infiniteQuestionPool.push({
                ...q,
                sourceModule: moduleId,
                sourceModuleName: module.title.split('、')[1] || module.title
            });
        });
    });
    
    // 使用 Fisher-Yates 算法打乱题目池
    shuffleArray(infiniteQuestionPool);
    infinitePoolIndex = 0;
}

// 随机生成下一道无尽模式题目
function generateNextInfiniteQuestion() {
    // 如果池子抽完了，重新洗牌
    if (infinitePoolIndex >= infiniteQuestionPool.length) {
        initInfinitePool();
    }
    
    const randomQuestion = infiniteQuestionPool[infinitePoolIndex];
    infinitePoolIndex++;
    
    // 复制题目并添加在无尽模式下的题号
    const nextQuestion = {
        ...randomQuestion,
        id: questionData.infiniteMode.questions.length + 1
    };
    
    questionData.infiniteMode.questions.push(nextQuestion);
    userAnswers.infiniteMode.push(null);
    
    // 显示题目
    showQuestion('infiniteMode', questionData.infiniteMode.questions.length - 1);
}

// 检查是否跳转到无尽模式下一题
function checkInfiniteNext() {
    if (currentModule === 'infiniteMode') {
        const currentAnswer = userAnswers.infiniteMode[currentQuestionIndex];
        // 如果当前是无尽模式的最后一题，且已经回答了，则生成下一题
        if (currentQuestionIndex === questionData.infiniteMode.questions.length - 1 && currentAnswer !== null) {
            setTimeout(generateNextInfiniteQuestion, 1000); // 延迟1秒生成下一题，让用户看清答案
        }
    }
}

// 显示题目（包含图片支持）
function showQuestion(moduleId, questionIndex) {
    const module = questionData[moduleId];
    
    // 检查索引是否有效
    if (!module.questions || questionIndex >= module.questions.length) {
        console.error('题目索引无效');
        return;
    }
    
    const question = module.questions[questionIndex];
    const totalQuestions = module.questions.length;
    
    // 更新当前题目索引
    currentQuestionIndex = questionIndex;
    
    // 构建题目HTML（包含图片）
    const questionContainer = document.getElementById('questionContainer');
    
    // 对于考试模式，显示考试题号
    const questionNumber = moduleId === 'randomExam' ? question.examQuestionId : (moduleId === 'infiniteMode' ? `∞-${question.id}` : question.id);
    
    // 构建图片HTML（如果有图片）
    let imageHTML = '';
    if (question.image && question.image.trim() !== '') {
        imageHTML = `
            <div class="question-image-container">
                <img src="${question.image}" alt="题目插图" class="question-image" 
                     onerror="this.style.display='none'; this.parentNode.innerHTML='<div class=\\'image-loading\\'><i class=\\'fas fa-exclamation-circle\\'></i> 图片加载失败</div>';">
                <div class="image-caption">题目插图（点击可放大）</div>
            </div>
        `;
    }
    
    // 构建解析图片HTML（如果有）
    let explanationImageHTML = '';
    if (question.explanationImage && question.explanationImage.trim() !== '') {
        explanationImageHTML = `
            <div class="explanation-image-container">
                <div>解析插图：</div>
                <img src="${question.explanationImage}" alt="解析插图" class="explanation-image"
                     onerror="this.style.display='none';">
            </div>
        `;
    }
    
    questionContainer.innerHTML = `
        <h3 class="module-title">${module.title}</h3>
        <div class="question-header">
            <div class="question-number">第 ${questionNumber} 题</div>
            <div class="progress-text">${moduleId === 'infiniteMode' ? '无尽模式' : `${questionIndex + 1}/${totalQuestions}`}</div>
        </div>
        ${(moduleId === 'randomExam' || moduleId === 'infiniteMode') ? 
            `<div class="question-source" style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">
                <i class="fas fa-tag"></i> 来源：${question.sourceModuleName}
            </div>` : ''
        }
        <div class="question-text">${question.text}</div>
        ${imageHTML}
        <div class="options-container" id="optionsContainer">
            ${generateOptionsHTML(question.options, moduleId, questionIndex)}
        </div>
        <div class="explanation-container" id="explanationContainer">
            <div class="explanation-title"><i class="fas fa-info-circle"></i> 题目解析</div>
            <div class="explanation-content" id="explanationContent">
                ${question.explanation}
                ${explanationImageHTML}
            </div>
        </div>
    `;
    
    // 更新定位输入框显示当前题目编号（仅非考试模式）
    if (moduleId !== 'randomExam') {
        const positionInput = document.getElementById('positionInput');
        if (positionInput !== document.activeElement) {
            positionInput.value = question.id;
        }
    }
    
    // 为图片添加点击放大功能
    const questionImage = document.querySelector('.question-image');
    if (questionImage) {
        questionImage.addEventListener('click', function() {
            openImageModal(this.src, '题目插图');
        });
    }
    
    const explanationImage = document.querySelector('.explanation-image');
    if (explanationImage) {
        explanationImage.addEventListener('click', function() {
            openImageModal(this.src, '解析插图');
        });
    }
    
    // 如果用户已经回答过此题，显示答案状态
    if (userAnswers[moduleId] && userAnswers[moduleId][questionIndex] !== null) {
        const selectedOption = userAnswers[moduleId][questionIndex];
        const options = document.querySelectorAll('.option');
        
        // 显示用户选择的选项
        if (selectedOption >= 0 && selectedOption < options.length) {
            options[selectedOption].classList.add('selected');
        }
        
        // 显示正确答案
        if (question.correctAnswer >= 0 && question.correctAnswer < options.length) {
            options[question.correctAnswer].classList.add('correct');
        }
        
        // 如果用户选错了，显示错误
        if (selectedOption !== question.correctAnswer && 
            selectedOption >= 0 && selectedOption < options.length) {
            options[selectedOption].classList.add('incorrect');
        }
        
        // 显示解析（考试模式下在提交后显示）
        if (moduleId !== 'randomExam' || examUserAnswers.every(a => a !== null)) {
            document.getElementById('explanationContainer').style.display = 'block';
        }
    }
    
    // 为选项添加点击事件
    document.querySelectorAll('.option').forEach((option, index) => {
        option.addEventListener('click', () => {
            handleOptionClick(moduleId, questionIndex, index);
        });
    });
    
    // 更新导航按钮状态
    updateNavigationButtons();
    
    // 更新进度点
    updateProgressDots();
    
    // 如果是考试模式，更新考试信息
    if (moduleId === 'randomExam') {
        updateExamInfoPanel();
    }
}

// 生成选项HTML
function generateOptionsHTML(options, moduleId, questionIndex) {
    const labels = ['A', 'B', 'C', 'D'];
    let optionsHTML = '';
    
    // 确保userAnswers存在
    if (!userAnswers[moduleId]) {
        userAnswers[moduleId] = new Array(questionData[moduleId].questions.length).fill(null);
    }
    
    const userAnswer = userAnswers[moduleId][questionIndex];
    
    options.forEach((option, index) => {
        const isSelected = userAnswer === index;
        let optionClass = 'option';
        
        if (isSelected) {
            optionClass += ' selected';
            
            // 检查是否正确
            const question = questionData[moduleId].questions[questionIndex];
            if (index === question.correctAnswer) {
                optionClass += ' correct';
            } else {
                optionClass += ' incorrect';
            }
        }
        
        optionsHTML += `
            <div class="${optionClass}" data-index="${index}">
                <div class="option-label">${labels[index]}</div>
                <div class="option-text">${option}</div>
            </div>
        `;
    });
    
    return optionsHTML;
}

// 处理选项点击
function handleOptionClick(moduleId, questionIndex, optionIndex) {
    // 确保userAnswers存在
    if (!userAnswers[moduleId]) {
        userAnswers[moduleId] = new Array(questionData[moduleId].questions.length).fill(null);
    }
    
    // 清除之前的答案状态
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // 保存用户答案
    userAnswers[moduleId][questionIndex] = optionIndex;
    
    // 如果是考试模式，保存到examUserAnswers
    if (moduleId === 'randomExam') {
        examUserAnswers[questionIndex] = optionIndex;
        updateExamInfoPanel();
    }
    
    // 更新选项显示状态
    const question = questionData[moduleId].questions[questionIndex];
    
    // 显示用户选择的选项
    options[optionIndex].classList.add('selected');
    
    // 显示正确答案
    options[question.correctAnswer].classList.add('correct');
    
    // 如果用户选错了，显示错误
    if (optionIndex !== question.correctAnswer) {
        options[optionIndex].classList.add('incorrect');
    }
    
    // 显示解析（考试模式下在提交后显示）
    if (moduleId !== 'randomExam') {
        document.getElementById('explanationContainer').style.display = 'block';
    }
    
    // 检查当前模块是否已完成（仅限常规模块）
    if (moduleId !== 'randomExam' && moduleId !== 'infiniteMode') {
        const moduleQuestions = questionData[moduleId].questions;
        const answeredCount = userAnswers[moduleId].filter(answer => answer !== null).length;
        
        if (answeredCount === moduleQuestions.length) {
            completedModules[moduleId] = true;
            updateProgressDots();
            
            // 检查是否所有模块都已完成
            const allModulesCompleted = Object.values(completedModules).every(status => status);
            
            if (allModulesCompleted) {
                // 所有模块都已完成，提示用户可以查看成绩
                setTimeout(() => {
                    if (confirm("您已完成所有题目！是否查看成绩？")) {
                        showScore();
                    }
                }, 500);
            }
        }
    }
    
    // 无尽模式自动生成下一题
    if (moduleId === 'infiniteMode') {
        checkInfiniteNext();
    }
    
    // 更新进度点
    updateProgressDots();
}

// 显示上一题
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentModule, currentQuestionIndex - 1);
    }
}

// 显示下一题
function showNextQuestion() {
    if (currentModule === 'infiniteMode') {
        // 无尽模式如果已经是最后一题，则生成新题
        if (currentQuestionIndex === questionData.infiniteMode.questions.length - 1) {
            generateNextInfiniteQuestion();
        } else {
            showQuestion(currentModule, currentQuestionIndex + 1);
        }
        return;
    }
    
    const totalQuestions = questionData[currentModule].questions.length;
    
    if (currentQuestionIndex < totalQuestions - 1) {
        showQuestion(currentModule, currentQuestionIndex + 1);
    } else {
        // 当前模块已答完
        if (currentModule === 'randomExam') {
            // 考试模式下提示提交
            if (confirm('您已到达最后一题，是否提交试卷？')) {
                submitExam();
            }
        } else {
            // 常规模块完成
            completedModules[currentModule] = true;
            updateProgressDots();
            
            // 检查是否所有模块都已完成
            const allModulesCompleted = Object.values(completedModules).every(status => status);
            
            if (allModulesCompleted) {
                // 所有模块都已完成，显示得分
                showScore();
            } else {
                // 提示用户选择其他模块
                alert(`您已完成${questionData[currentModule].title}，请选择其他模块继续答题。`);
            }
        }
    }
}

// 更新导航按钮状态
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // 更新上一题按钮状态
    if (currentQuestionIndex === 0) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.disabled = false;
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }
    
    // 更新下一题按钮状态
    const totalQuestions = questionData[currentModule].questions.length;
    if (currentModule === 'infiniteMode') {
        nextBtn.textContent = currentQuestionIndex === totalQuestions - 1 ? '随机下一题' : '下一题';
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    } else if (currentQuestionIndex === totalQuestions - 1) {
        nextBtn.textContent = currentModule === 'randomExam' ? '提交试卷' : '完成模块';
    } else {
        nextBtn.textContent = '下一题';
    }
}

// 更新进度点
function updateProgressDots() {
    for (const moduleId in questionData) {
        const progressDot = document.getElementById(`dot-${moduleId}`);
        if (!progressDot) continue;
        
        // 对于随机考试模块
    if (moduleId === 'randomExam') {
        if (moduleId === currentModule && examQuestions.length > 0) {
            progressDot.className = 'progress-dot current';
        } else {
            progressDot.className = 'progress-dot';
        }
        continue;
    }
    
    // 对于随机无尽模式
    if (moduleId === 'infiniteMode') {
        if (moduleId === currentModule) {
            progressDot.className = 'progress-dot current';
        } else {
            progressDot.className = 'progress-dot';
        }
        continue;
    }
        
        // 计算该模块的完成率
        const moduleQuestions = questionData[moduleId].questions;
        const answeredCount = userAnswers[moduleId] ? 
            userAnswers[moduleId].filter(answer => answer !== null).length : 0;
        
        if (answeredCount === moduleQuestions.length) {
            progressDot.className = 'progress-dot completed';
        } else if (moduleId === currentModule) {
            progressDot.className = 'progress-dot current';
        } else if (answeredCount > 0) {
            progressDot.className = 'progress-dot in-progress';
        } else {
            progressDot.className = 'progress-dot';
        }
    }
}

// 显示常规模块得分
function showScore() {
    let totalQuestions = 0;
    let correctAnswers = 0;
    
    // 计算总题数和正确答案数（排除考试模块）
    for (const moduleId in questionData) {
        if (moduleId === 'randomExam') continue;
        
        const module = questionData[moduleId];
        totalQuestions += module.questions.length;
        
        module.questions.forEach((question, index) => {
            if (userAnswers[moduleId] && userAnswers[moduleId][index] === question.correctAnswer) {
                correctAnswers++;
            }
        });
    }
    
    // 计算得分（百分制）
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // 显示得分容器
    const scoreContainer = document.getElementById('scoreContainer');
    scoreContainer.innerHTML = `
        <h3 class="score-title">练习完成！</h3>
        <div class="score-value">${score}分</div>
        <p class="score-details">正确: ${correctAnswers}题, 错误: ${totalQuestions - correctAnswers}题, 未答: 0题</p>
        <button class="restart-btn" id="restartBtn"><i class="fas fa-redo"></i> 重新开始练习</button>
    `;
    scoreContainer.style.display = 'block';
    
    // 隐藏题目容器
    document.getElementById('questionContainer').innerHTML = `
        <div style="text-align: center; padding: 50px 20px;">
            <h3 style="color: #6a11cb; margin-bottom: 20px;">恭喜您完成所有题目！</h3>
            <p style="color: #666; margin-bottom: 30px;">您已经完成了所有模块的题目，请查看左侧的成绩统计。</p>
            <div style="font-size: 4rem; color: #6a11cb; margin: 30px 0;">
                <i class="fas fa-trophy"></i>
            </div>
        </div>
    `;
    
    // 隐藏导航按钮
    document.querySelector('.navigation-buttons').style.display = 'none';
    
    // 重新绑定重启按钮事件
    document.getElementById('restartBtn').addEventListener('click', restartQuiz);
}

// 重新开始练习
function restartQuiz() {
    // 重置全局变量
    currentModule = 'module1';
    currentQuestionIndex = 0;
    userAnswers = {};
    completedModules = {};
    
    // 初始化用户答案存储
    for (const module in questionData) {
        if (module === 'randomExam' || module === 'infiniteMode') continue;
        userAnswers[module] = new Array(questionData[module].questions.length).fill(null);
        completedModules[module] = false;
    }
    
    // 重置UI
    generateModuleList();
    showQuestion(currentModule, currentQuestionIndex);
    updateProgressDots();
    
    // 显示导航按钮
    document.querySelector('.navigation-buttons').style.display = 'flex';
    
    // 隐藏得分容器
    document.getElementById('scoreContainer').style.display = 'none';
    
    // 清空定位输入框
    document.getElementById('positionInput').value = '';
    updatePositionHint();
}

// ============ 图片模态框功能 ============
function openImageModal(imageSrc, altText) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    modalImage.src = imageSrc;
    modalImage.alt = altText;
    modal.style.display = 'flex';
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    
    // 恢复背景滚动
    document.body.style.overflow = 'auto';
}

// ============ 定位功能相关函数 ============

// 初始化定位功能
function initPositionFunction() {
    const positionInput = document.getElementById('positionInput');
    const jumpBtn = document.getElementById('jumpBtn');
    
    // 更新最大题目数
    updateMaxQuestionNumber();
    
    // 跳转按钮点击事件
    jumpBtn.addEventListener('click', jumpToQuestion);
    
    // 输入框回车事件
    positionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            jumpToQuestion();
        }
    });
    
    // 输入框输入时清除错误状态
    positionInput.addEventListener('input', function() {
        this.classList.remove('invalid');
        updatePositionHint();
    });
    
    // 输入框聚焦时全选内容
    positionInput.addEventListener('focus', function() {
        this.select();
    });
    
    // 初始化提示
    updatePositionHint();
}

// 更新最大题目数显示
function updateMaxQuestionNumber() {
    if (currentModule === 'randomExam') {
        document.getElementById('maxQuestionNum').textContent = examQuestions.length;
        return;
    }
    
    if (currentModule === 'infiniteMode') {
        document.getElementById('maxQuestionNum').textContent = '∞';
        return;
    }
    
    const currentModuleData = questionData[currentModule];
    const maxQuestionNum = currentModuleData.questions.length;
    document.getElementById('maxQuestionNum').textContent = maxQuestionNum;
}

// 更新提示信息
function updatePositionHint() {
    const positionInput = document.getElementById('positionInput');
    const positionHint = document.getElementById('positionHint');
    
    if (currentModule === 'randomExam' || currentModule === 'infiniteMode') {
        positionHint.textContent = currentModule === 'randomExam' ? '考试模式下不能使用定位功能' : '无尽模式下不能使用定位功能';
        return;
    }
    
    const maxQuestionNum = questionData[currentModule].questions.length;
    
    if (positionInput.value === '') {
        positionHint.textContent = `提示：输入1-${maxQuestionNum}之间的数字`;
        positionHint.className = 'position-hint';
    }
}

// 跳转到指定题目
function jumpToQuestion() {
    // 考试/无尽模式下禁用定位功能
    if (currentModule === 'randomExam' || currentModule === 'infiniteMode') {
        alert(currentModule === 'randomExam' ? '考试模式下不能使用定位功能' : '无尽模式下不能使用定位功能');
        return;
    }
    
    const positionInput = document.getElementById('positionInput');
    const positionHint = document.getElementById('positionHint');
    const questionNum = parseInt(positionInput.value);
    
    // 获取当前模块信息
    const module = questionData[currentModule];
    const totalQuestions = module.questions.length;
    
    // 验证输入
    if (isNaN(questionNum) || questionNum < 1 || questionNum > totalQuestions) {
        positionInput.classList.add('invalid');
        positionHint.textContent = `错误：请输入1-${totalQuestions}之间的有效数字`;
        positionHint.className = 'position-hint error';
        
        // 清空输入框并聚焦
        setTimeout(() => {
            positionInput.value = '';
            positionInput.focus();
        }, 1500);
        
        return;
    }
    
    // 查找题目索引（因为题目id是从1开始的连续编号）
    const questionIndex = questionNum - 1;
    
    // 跳转到指定题目
    showQuestion(currentModule, questionIndex);
    
    // 显示成功提示
    positionHint.textContent = `成功跳转到第${questionNum}题`;
    positionHint.className = 'position-hint success';
    
    // 清空输入框
    positionInput.value = '';
    
    // 3秒后恢复默认提示
    setTimeout(() => {
        updatePositionHint();
    }, 3000);
}

// ============ 考试相关函数 ============

// 生成随机考试题目
function generateRandomExam() {
    examQuestions = [];
    examUserAnswers = [];
    
    // 从每个模块中至少抽取1题
    const moduleIds = ['module1', 'module2', 'module3', 'module4', 'module5', 'module6'];
    const questionsPerModule = Math.floor(20 / moduleIds.length);
    const extraQuestions = 20 % moduleIds.length;
    
    moduleIds.forEach((moduleId, index) => {
        const module = questionData[moduleId];
        let selectedCount = questionsPerModule;
        
        // 为前几个模块多分配1题
        if (index < extraQuestions) {
            selectedCount++;
        }
        
        // 随机选择题目
        const selectedQuestions = getRandomQuestions(module.questions, selectedCount);
        
        // 为每个题目添加模块信息
        selectedQuestions.forEach(q => {
            examQuestions.push({
                ...q,
                sourceModule: moduleId,
                sourceModuleName: module.moduleTag,
                examQuestionId: examQuestions.length + 1
            });
        });
    });
    
    // 打乱题目顺序
    shuffleArray(examQuestions);
    
    // 重新编号（1-20）
    examQuestions.forEach((q, index) => {
        q.examQuestionId = index + 1;
    });
    
    // 初始化用户答案数组
    examUserAnswers = new Array(examQuestions.length).fill(null);
    
    return examQuestions;
}

// 从数组中随机选择指定数量的元素
function getRandomQuestions(questions, count) {
    const shuffled = [...questions];
    shuffleArray(shuffled);
    return shuffled.slice(0, Math.min(count, questions.length));
}

// 打乱数组顺序（Fisher-Yates算法）
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 开始考试
function startRandomExam() {
    // 生成考试题目
    generateRandomExam();
    
    // 设置当前模块为随机考试
    currentModule = 'randomExam';
    currentQuestionIndex = 0;
    
    // 更新题目数据
    questionData.randomExam.questions = examQuestions;
    
    // 重置用户答案
    userAnswers.randomExam = examUserAnswers;
    
    // 开始计时
    startExamTimer();
    
    // 显示考试信息面板
    document.getElementById('examInfoPanel').style.display = 'block';
    updateExamInfoPanel();
    
    // 显示提交按钮
    document.getElementById('submitExamBtn').style.display = 'block';
    
    // 隐藏定位功能（考试模式下不适用）
    document.querySelector('.position-container').style.display = 'none';
    
    // 显示第一个题目
    showQuestion('randomExam', 0);
    
    // 更新模块列表活动状态
    document.querySelectorAll('.module-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.module === 'randomExam') {
            item.classList.add('active');
        }
    });
    
    // 隐藏得分容器和错题容器
    document.getElementById('scoreContainer').style.display = 'none';
    document.getElementById('wrongQuestionsContainer').style.display = 'none';
    
    // 显示导航按钮
    document.querySelector('.navigation-buttons').style.display = 'flex';
}

// 开始考试计时器
function startExamTimer() {
    examStartTime = new Date();
    examRemainingTime = examTimeLimit;
    
    // 清除已有计时器
    if (examTimerInterval) {
        clearInterval(examTimerInterval);
    }
    
    // 显示计时器
    const timerElement = document.getElementById('examTimer');
    timerElement.style.display = 'block';
    updateTimerDisplay();
    
    // 启动计时器
    examTimerInterval = setInterval(() => {
        examRemainingTime--;
        updateTimerDisplay();
        
        // 考试时间到
        if (examRemainingTime <= 0) {
            clearInterval(examTimerInterval);
            submitExam();
            alert('考试时间到！系统已自动提交试卷。');
        }
        
        // 最后5分钟警告
        if (examRemainingTime === 5 * 60) {
            timerElement.classList.add('warning');
            alert('距离考试结束还有5分钟！');
        }
    }, 1000);
}

// 更新计时器显示
function updateTimerDisplay() {
    const timerElement = document.getElementById('examTimer');
    const hours = Math.floor(examRemainingTime / 3600);
    const minutes = Math.floor((examRemainingTime % 3600) / 60);
    const seconds = examRemainingTime % 60;
    
    timerElement.innerHTML = `
        <i class="fas fa-clock"></i>
        剩余时间：${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}
    `;
}

// 更新考试信息面板
function updateExamInfoPanel() {
    if (currentModule !== 'randomExam') return;
    
    const answeredCount = examUserAnswers.filter(answer => answer !== null).length;
    const totalQuestions = examQuestions.length;
    
    document.getElementById('totalExamQuestions').textContent = totalQuestions;
    document.getElementById('answeredCount').textContent = answeredCount;
    document.getElementById('remainingCount').textContent = totalQuestions - answeredCount;
}

// 提交考试
function submitExam() {
    // 停止计时器
    clearInterval(examTimerInterval);
    document.getElementById('examTimer').style.display = 'none';
    
    // 隐藏考试信息面板
    document.getElementById('examInfoPanel').style.display = 'none';
    
    // 隐藏提交按钮
    document.getElementById('submitExamBtn').style.display = 'none';
    
    // 显示定位功能
    document.querySelector('.position-container').style.display = 'block';
    
    // 计算成绩
    calculateExamScore();
}

// 计算考试成绩
function calculateExamScore() {
    let correctCount = 0;
    const wrongQuestions = [];
    
    // 计算正确题数
    examQuestions.forEach((question, index) => {
        if (examUserAnswers[index] === question.correctAnswer) {
            correctCount++;
        } else if (examUserAnswers[index] !== null) {
            // 记录错题
            wrongQuestions.push({
                question: question,
                userAnswer: examUserAnswers[index],
                questionIndex: index
            });
        }
    });
    
    // 计算得分（每题5分）
    const score = correctCount * 5;
    
    // 显示考试成绩
    showExamScore(score, correctCount, wrongQuestions);
}

// 显示考试成绩
function showExamScore(score, correctCount, wrongQuestions) {
    const scoreContainer = document.getElementById('scoreContainer');
    const totalQuestions = examQuestions.length;
    const unansweredCount = totalQuestions - examUserAnswers.filter(a => a !== null).length;
    
    scoreContainer.innerHTML = `
        <h3 class="score-title"><i class="fas fa-graduation-cap"></i> 考试成绩</h3>
        <div class="score-value">${score}分</div>
        <p class="score-details">
            正确: ${correctCount}题, 错误: ${totalQuestions - correctCount}题, 
            未答: ${unansweredCount}题
        </p>
        <div class="score-breakdown">
            <p><i class="fas fa-check-circle" style="color: #4CAF50;"></i> 答对 ${correctCount} 题 × 5分 = ${correctCount * 5}分</p>
            <p><i class="fas fa-times-circle" style="color: #f44336;"></i> 答错 ${totalQuestions - correctCount} 题 × 0分 = 0分</p>
        </div>
        <button class="restart-btn" id="restartExamBtn" style="margin-top: 15px;">
            <i class="fas fa-redo"></i> 重新开始考试
        </button>
        <button class="restart-btn" id="reviewWrongBtn" style="background-color: #ff9800; margin-left: 10px;">
            <i class="fas fa-book"></i> 查看错题
        </button>
    `;
    
    scoreContainer.style.display = 'block';
    
    // 为按钮添加事件监听
    document.getElementById('restartExamBtn').addEventListener('click', startRandomExam);
    document.getElementById('reviewWrongBtn').addEventListener('click', () => {
        reviewWrongQuestions(wrongQuestions);
    });
    
    // 如果有错题，显示错题统计
    if (wrongQuestions.length > 0) {
        showWrongQuestions(wrongQuestions);
    }
    
    // 隐藏题目容器
    document.getElementById('questionContainer').innerHTML = `
        <div style="text-align: center; padding: 50px 20px;">
            <h3 style="color: #6a11cb; margin-bottom: 20px;">考试已完成！</h3>
            <p style="color: #666; margin-bottom: 30px;">请查看左侧的成绩统计和错题分析。</p>
            <div style="font-size: 4rem; color: ${score >= 60 ? '#4CAF50' : '#f44336'}; margin: 30px 0;">
                ${score >= 60 ? '<i class="fas fa-medal"></i>' : '<i class="fas fa-exclamation-triangle"></i>'}
            </div>
            <p style="color: #666; font-size: 1.1rem;">
                ${score >= 60 ? '恭喜您通过考试！' : '请继续努力，加强练习！'}
            </p>
        </div>
    `;
    
    // 隐藏导航按钮
    document.querySelector('.navigation-buttons').style.display = 'none';
    
    // 更新所有题目显示解析
    userAnswers.randomExam = examUserAnswers;
}

// 显示错题统计
function showWrongQuestions(wrongQuestions) {
    const wrongContainer = document.getElementById('wrongQuestionsContainer');
    const wrongList = document.getElementById('wrongQuestionsList');
    
    wrongList.innerHTML = '';
    
    wrongQuestions.forEach(wrongItem => {
        const question = wrongItem.question;
        const userAnswer = wrongItem.userAnswer;
        const correctAnswer = question.correctAnswer;
        const labels = ['A', 'B', 'C', 'D'];
        
        const wrongItemElement = document.createElement('div');
        wrongItemElement.className = 'wrong-question-item';
        wrongItemElement.dataset.questionIndex = wrongItem.questionIndex;
        
        wrongItemElement.innerHTML = `
            <div class="wrong-question-header">
                <span class="wrong-question-module">${question.sourceModuleName}</span>
                <span class="wrong-question-number">第 ${question.examQuestionId} 题</span>
            </div>
            <div class="wrong-question-text">${question.text}</div>
            <div class="wrong-question-answer">
                <div>您的答案：<span class="user-answer">${labels[userAnswer]}. ${question.options[userAnswer]}</span></div>
                <div>正确答案：<span class="correct-answer">${labels[correctAnswer]}. ${question.options[correctAnswer]}</span></div>
            </div>
        `;
        
        // 点击错题可跳转到该题
        wrongItemElement.addEventListener('click', () => {
            showQuestion('randomExam', wrongItem.questionIndex);
            // 显示解析
            document.getElementById('explanationContainer').style.display = 'block';
        });
        
        wrongList.appendChild(wrongItemElement);
    });
    
    wrongContainer.style.display = 'block';
}

// 查看错题模式
function reviewWrongQuestions(wrongQuestions) {
    if (wrongQuestions.length === 0) {
        alert('没有错题可查看！');
        return;
    }
    
    // 将错题设置为当前题目
    currentModule = 'randomExam';
    currentQuestionIndex = wrongQuestions[0].questionIndex;
    
    // 显示第一个错题
    showQuestion('randomExam', currentQuestionIndex);
    
    // 隐藏考试信息
    document.getElementById('scoreContainer').style.display = 'none';
    document.getElementById('wrongQuestionsContainer').style.display = 'block';
    
    // 显示导航按钮
    document.querySelector('.navigation-buttons').style.display = 'flex';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);
