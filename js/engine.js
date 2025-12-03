/**
 * ═══════════════════════════════════════════════════════════
 * ДВИЖОК ВИЗУАЛЬНОЙ НОВЕЛЛЫ
 * Для Ренусики 💕
 * ═══════════════════════════════════════════════════════════
 */

class VNEngine {
    constructor() {
        // Состояние игры
        this.gameState = {
            currentScene: null,
            currentDialogueIndex: 0,
            isTyping: false,
            isAutoPlay: false,
            autoPlayTimer: null,
            
            // Переменные истории
            variables: {
                romance: 50,              // Романтика (0-100)
                confidenceRenata: 50,     // Уверенность Ренаты (0-100)
                respectFromOthers: 50,    // Уважение окружающих (0-100)
                outfitChoice: null,       // Выбранный образ
                path: 'neutral',          // Путь: 'romantic', 'confident', 'creative'
                successScore: 0            // Очки успеха (0-100)
            }
        };
        
        // Настройки
        this.settings = {
            textSpeed: 30,          // мс между символами
            autoPlayDelay: 3000,    // мс до авто-перехода
        };
        
        // Кэш DOM элементов
        this.elements = {};
        
        // Привязка методов
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
    
    /**
     * Инициализация движка
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        console.log('💕 VN Engine initialized');
    }
    
    /**
     * Кэширование DOM элементов
     */
    cacheElements() {
        this.elements = {
            // Экраны
            mainMenu: document.getElementById('main-menu'),
            gameScreen: document.getElementById('game-screen'),
            endingScreen: document.getElementById('ending-screen'),
            
            // Игровые элементы
            sceneBackground: document.getElementById('scene-background'),
            charactersContainer: document.getElementById('characters-container'),
            charLeft: document.getElementById('char-left'),
            charCenter: document.getElementById('char-center'),
            charRight: document.getElementById('char-right'),
            
            // Диалог
            dialogueBox: document.getElementById('dialogue-box'),
            speakerName: document.getElementById('speaker-name'),
            dialogueText: document.getElementById('dialogue-text'),
            
            // Выборы
            choicesContainer: document.getElementById('choices-container'),
            choicesList: document.getElementById('choices-list'),
            
            // Кастомизация
            customizationContainer: document.getElementById('customization-container'),
            customizationTitle: document.getElementById('customization-title'),
            customizationOptions: document.getElementById('customization-options'),
            
            // UI
            btnStart: document.getElementById('btn-start'),
            btnSkip: document.getElementById('btn-skip'),
            btnAuto: document.getElementById('btn-auto'),
            btnReplay: document.getElementById('btn-replay'),
            
            // Финал
            endingTitle: document.getElementById('ending-title'),
            endingText: document.getElementById('ending-text'),
            
            // Счётчик
            successCounter: document.getElementById('success-counter'),
            successScore: document.getElementById('success-score'),
            successBar: document.getElementById('success-bar'),
            
            // Оверлей
            transitionOverlay: document.getElementById('transition-overlay')
        };
    }
    
    /**
     * Привязка событий
     */
    bindEvents() {
        // Клики и клавиши для продвижения диалога
        this.elements.dialogueBox.addEventListener('click', this.handleClick);
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Кнопки
        this.elements.btnStart.addEventListener('click', () => this.startGame());
        this.elements.btnReplay.addEventListener('click', () => this.startGame());
        this.elements.btnSkip.addEventListener('click', () => this.skipToChoice());
        this.elements.btnAuto.addEventListener('click', () => this.toggleAutoPlay());
    }
    
    /**
     * Обработка кликов
     */
    handleClick(e) {
        // Игнорировать клики по кнопкам выбора
        if (e && e.target && (e.target.classList.contains('choice-btn') || e.target.closest('.choice-btn'))) {
            return;
        }
        
        // Игнорировать клики по кастомизации
        if (e && e.target && (e.target.closest('.customization-container'))) {
            return;
        }
        
        if (this.gameState.isTyping) {
            this.completeTyping();
        } else if (!this.elements.choicesContainer.classList.contains('hidden')) {
            return; // Ждём выбора
        } else if (!this.elements.customizationContainer.classList.contains('hidden')) {
            return; // Ждём кастомизации
        } else {
            this.nextDialogue();
        }
    }
    
    /**
     * Обработка клавиш
     */
    handleKeyPress(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.handleClick(e);
        } else if (e.key === 'Escape') {
            // Закрыть панели если открыты
        }
    }
    
    /**
     * Начать игру
     */
    startGame() {
        // Сброс состояния
        this.gameState.variables = {
            romance: 50,
            confidenceRenata: 50,
            respectFromOthers: 50,
            outfitChoice: null,
            path: 'neutral',
            successScore: 0
        };
        this.gameState.currentDialogueIndex = 0;
        
        // Обновить счётчик
        this.updateSuccessScore();
        
        // Показать счётчик
        if (this.elements.successCounter) {
            this.elements.successCounter.style.display = 'block';
        }
        
        // Переход к игре
        this.switchScreen('game');
        
        // Начать с первой сцены
        if (GAME_SCRIPT && GAME_SCRIPT.scenes) {
            const firstScene = Object.values(GAME_SCRIPT.scenes)[0];
            this.loadScene(firstScene);
        }
    }
    
    /**
     * Загрузить сцену
     */
    loadScene(scene) {
        this.gameState.currentScene = scene;
        this.gameState.currentDialogueIndex = 0;
        
        // Эффект перехода
        this.transition(() => {
            // Установить фон
            if (scene.background) {
                this.setBackground(scene.background);
            }
            
            // Очистить персонажей
            this.clearCharacters();
            
            // Показать начальных персонажей
            if (scene.characters) {
                scene.characters.forEach(char => {
                    this.showCharacter(char.id, char.position, char.emotion);
                });
            }
            
            // Начать диалог
            this.showDialogue();
        });
    }
    
    /**
     * Показать текущий диалог
     */
    showDialogue() {
        const scene = this.gameState.currentScene;
        const index = this.gameState.currentDialogueIndex;
        
        if (!scene || !scene.dialogue) {
            console.error('Сцена или диалог не найдены');
            return;
        }
        
        if (index >= scene.dialogue.length) {
            // Конец диалогов сцены
            this.handleSceneEnd();
            return;
        }
        
        const line = scene.dialogue[index];
        
        // Проверка условий
        if (line.condition && !this.checkCondition(line.condition)) {
            this.gameState.currentDialogueIndex++;
            this.showDialogue();
            return;
        }
        
        // Обработка специальных типов
        if (line.type === 'choice') {
            this.showChoices(line);
            return;
        }
        
        if (line.type === 'customization') {
            this.showCustomization(line);
            return;
        }
        
        if (line.type === 'effect') {
            this.applyEffect(line.effect);
            this.gameState.currentDialogueIndex++;
            this.showDialogue();
            return;
        }
        
        if (line.type === 'nextScene') {
            const nextScene = GAME_SCRIPT.scenes[line.sceneId];
            if (nextScene) {
                this.loadScene(nextScene);
            }
            return;
        }
        
        // Обычный диалог
        this.displayLine(line);
    }
    
    /**
     * Отобразить строку диалога
     */
    displayLine(line) {
        // Установить имя говорящего
        const speakerNames = {
            'renata': 'Рената',
            'sasha': 'Саша',
            'narrator': '',
            'sonyata': 'Сонейта',
            'anya': 'Аня'
        };
        
        const speaker = line.speaker || 'narrator';
        const speakerName = speakerNames[speaker] || speaker;
        
        // Устанавливаем имя и класс только если изменился говорящий
        if (this.elements.speakerName.textContent !== speakerName) {
            this.elements.speakerName.textContent = speakerName;
            this.elements.speakerName.className = 'speaker-name ' + speaker;
        }
        
        // Скрыть имя для нарратора
        if (speaker === 'narrator') {
            this.elements.speakerName.style.display = 'none';
        } else {
            this.elements.speakerName.style.display = 'inline-block';
        }
        
        // Обновить персонажей
        if (line.showCharacter) {
            this.showCharacter(line.showCharacter.id, line.showCharacter.position, line.showCharacter.emotion);
        }
        if (line.hideCharacter) {
            this.hideCharacter(line.hideCharacter);
        }
        if (line.characterEmotion) {
            this.setCharacterEmotion(line.characterEmotion.id, line.characterEmotion.emotion);
        }
        
        // Подсветка говорящего
        this.highlightSpeaker(speaker);
        
        // Анимация появления текста
        this.typeText(line.text);
        
        // Применить эффекты строки
        if (line.effects) {
            this.applyEffect(line.effects);
        }
    }
    
    /**
     * Анимация печати текста
     */
    typeText(text) {
        this.gameState.isTyping = true;
        this.elements.dialogueText.innerHTML = '';
        
        let charIndex = 0;
        this.currentText = text;
        
        const type = () => {
            if (charIndex < text.length && this.gameState.isTyping) {
                // Обработка HTML тегов
                if (text[charIndex] === '<') {
                    const endTag = text.indexOf('>', charIndex);
                    if (endTag !== -1) {
                        this.elements.dialogueText.innerHTML += text.substring(charIndex, endTag + 1);
                        charIndex = endTag + 1;
                    }
                } else {
                    this.elements.dialogueText.innerHTML += text[charIndex];
                    charIndex++;
                }
                
                this.typingTimer = setTimeout(type, this.settings.textSpeed);
            } else {
                this.gameState.isTyping = false;
                
                // Авто-переход
                if (this.gameState.isAutoPlay) {
                    this.gameState.autoPlayTimer = setTimeout(() => {
                        this.nextDialogue();
                    }, this.settings.autoPlayDelay);
                }
            }
        };
        
        type();
    }
    
    /**
     * Мгновенно завершить печать
     */
    completeTyping() {
        if (this.typingTimer) {
            clearTimeout(this.typingTimer);
        }
        this.gameState.isTyping = false;
        this.elements.dialogueText.innerHTML = this.currentText || '';
    }
    
    /**
     * Следующий диалог
     */
    nextDialogue() {
        if (this.gameState.autoPlayTimer) {
            clearTimeout(this.gameState.autoPlayTimer);
        }
        
        this.gameState.currentDialogueIndex++;
        this.showDialogue();
    }
    
    /**
     * Показать варианты выбора
     */
    showChoices(choiceData) {
        this.elements.choicesList.innerHTML = '';
        
        choiceData.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = choice.text;
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectChoice(choice, index);
            });
            
            this.elements.choicesList.appendChild(btn);
        });
        
        this.elements.choicesContainer.classList.remove('hidden');
    }
    
    /**
     * Обработка выбора
     */
    selectChoice(choice, index) {
        // Защита от двойных кликов
        if (this.elements.choicesContainer.classList.contains('hidden')) {
            return;
        }
        
        // Скрыть выборы
        this.elements.choicesContainer.classList.add('hidden');
        
        // Применить эффекты
        if (choice.effects) {
            this.applyEffect(choice.effects);
        }
        
        // Установить путь если указан
        if (choice.path) {
            this.gameState.variables.path = choice.path;
        }
        
        // Перейти к результату выбора
        if (choice.nextScene) {
            const nextScene = GAME_SCRIPT.scenes[choice.nextScene];
            if (nextScene) {
                this.loadScene(nextScene);
            }
        } else if (choice.insertDialogue) {
            // Вставить дополнительный диалог
            const scene = this.gameState.currentScene;
            const insertIndex = this.gameState.currentDialogueIndex + 1;
            scene.dialogue.splice(insertIndex, 0, ...choice.insertDialogue);
            this.gameState.currentDialogueIndex++;
            this.showDialogue();
        } else {
            this.gameState.currentDialogueIndex++;
            this.showDialogue();
        }
    }
    
    /**
     * Показать кастомизацию
     */
    showCustomization(customizationData) {
        this.elements.customizationTitle.textContent = customizationData.title || 'Выбери образ';
        this.elements.customizationOptions.innerHTML = '';
        
        customizationData.options.forEach((option, index) => {
            const div = document.createElement('div');
            div.className = 'customization-option';
            
            const img = document.createElement('img');
            img.src = option.image;
            img.alt = option.name;
            img.onerror = () => {
                img.style.display = 'none';
            };
            
            const name = document.createElement('div');
            name.className = 'customization-option-name';
            name.textContent = option.name;
            
            const desc = document.createElement('div');
            desc.className = 'customization-option-desc';
            desc.textContent = option.description;
            
            div.appendChild(img);
            div.appendChild(name);
            div.appendChild(desc);
            
            div.addEventListener('click', () => {
                // Убрать выделение с других
                document.querySelectorAll('.customization-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Выделить выбранный
                div.classList.add('selected');
                
                // Сохранить выбор
                this.gameState.variables.outfitChoice = option.id;
                
                // Применить эффекты
                if (option.effects) {
                    this.applyEffect(option.effects);
                }
                
                // Продолжить через 1 секунду
                setTimeout(() => {
                    this.elements.customizationContainer.classList.add('hidden');
                    this.gameState.currentDialogueIndex++;
                    this.showDialogue();
                }, 1000);
            });
            
            this.elements.customizationOptions.appendChild(div);
        });
        
        this.elements.customizationContainer.classList.remove('hidden');
    }
    
    /**
     * Показать персонажа
     */
    showCharacter(id, position = 'center', emotion = 'neutral') {
        const slot = this.elements['char' + position.charAt(0).toUpperCase() + position.slice(1)];
        if (!slot) return;
        
        // Очистить слот
        slot.innerHTML = '';
        
        // Создать изображение
        const img = document.createElement('img');
        
        // Определяем путь к изображению
        let imagePath = '';
        
        if (id === 'renata') {
            // Для Ренаты: если выбран образ, используем его
            if (this.gameState.variables.outfitChoice) {
                imagePath = `assets/characters/${id}/${this.gameState.variables.outfitChoice}-1.png`;
            } else if (emotion && emotion !== 'neutral') {
                // Если указана эмоция, ищем в подпапке emotions/
                imagePath = `assets/characters/${id}/emotions/${emotion}.png`;
            } else {
                // Дефолт: используем первый доступный образ или эмоцию
                imagePath = `assets/characters/${id}/casual-1.png`;
            }
        } else if (id === 'sasha' || id === 'sonyata' || id === 'anya') {
            // Для Саши, Сонейты и Ани - ищем в корне папки
            imagePath = `assets/characters/${id}/${emotion}.png`;
        } else {
            // Для других персонажей - дефолтный путь
            imagePath = `assets/characters/${id}/${emotion}.png`;
        }
        
        img.src = imagePath;
        img.alt = id;
        img.dataset.characterId = id;
        img.dataset.emotion = emotion;
        
        // Обработка ошибки загрузки
        img.onerror = () => {
            console.warn(`Изображение не найдено: ${imagePath}`);
            
            // Пробуем альтернативные пути
            let fallbackPath = '';
            
            if (id === 'renata') {
                // Пробуем найти любой доступный образ
                const outfits = ['casual-1', 'elegant-1', 'glamour-1'];
                for (const outfit of outfits) {
                    const testPath = `assets/characters/${id}/${outfit}.png`;
                    // Проверяем через новый Image объект
                    const testImg = new Image();
                    testImg.onload = () => {
                        img.src = testPath;
                        img.onerror = null; // Убираем обработчик ошибки
                    };
                    testImg.src = testPath;
                }
                
                // Если ничего не помогло, пробуем эмоцию
                if (emotion && emotion !== 'neutral') {
                    fallbackPath = `assets/characters/${id}/emotions/${emotion}.png`;
                }
            } else {
                // Для других персонажей пробуем дефолтные эмоции
                const defaultEmotions = ['smile', 'calm', 'happy'];
                for (const defEmotion of defaultEmotions) {
                    fallbackPath = `assets/characters/${id}/${defEmotion}.png`;
                    break;
                }
            }
            
            // Если есть fallback, пробуем его
            if (fallbackPath && fallbackPath !== imagePath) {
                img.src = fallbackPath;
                return;
            }
            
            // Если ничего не помогло, показываем плейсхолдер только после всех попыток
            setTimeout(() => {
                if (!img.complete || img.naturalWidth === 0) {
                    img.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = `
                        width: 200px;
                        height: 400px;
                        background: linear-gradient(180deg, rgba(255, 158, 200, 0.3) 0%, transparent 100%);
                        border-radius: 100px 100px 50px 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--color-pink);
                        font-family: var(--font-display);
                        font-size: 1.2rem;
                    `;
                    placeholder.textContent = id === 'renata' ? 'Рената' : 'Саша';
                    slot.appendChild(placeholder);
                }
            }, 500);
        };
        
        slot.appendChild(img);
        
        // Анимация появления
        slot.classList.add('character-enter');
        setTimeout(() => slot.classList.remove('character-enter'), 600);
    }
    
    /**
     * Скрыть персонажа
     */
    hideCharacter(id) {
        ['Left', 'Center', 'Right'].forEach(pos => {
            const slot = this.elements['char' + pos];
            const img = slot.querySelector('img');
            if (img && img.dataset.characterId === id) {
                slot.classList.add('character-exit');
                setTimeout(() => {
                    slot.innerHTML = '';
                    slot.classList.remove('character-exit');
                }, 400);
            }
        });
    }
    
    /**
     * Очистить всех персонажей
     */
    clearCharacters() {
        ['Left', 'Center', 'Right'].forEach(pos => {
            this.elements['char' + pos].innerHTML = '';
        });
    }
    
    /**
     * Изменить эмоцию персонажа
     */
    setCharacterEmotion(id, emotion) {
        ['Left', 'Center', 'Right'].forEach(pos => {
            const slot = this.elements['char' + pos];
            const img = slot.querySelector('img');
            if (img && img.dataset.characterId === id) {
                // Определяем путь в зависимости от персонажа
                let imagePath = '';
                
                if (id === 'renata') {
                    // Для Ренаты эмоции в подпапке emotions/
                    imagePath = `assets/characters/${id}/emotions/${emotion}.png`;
                } else {
                    // Для других персонажей - в корне
                    imagePath = `assets/characters/${id}/${emotion}.png`;
                }
                
                img.src = imagePath;
                img.dataset.emotion = emotion;
                
                // Обработка ошибки
                img.onerror = () => {
                    console.warn(`Эмоция не найдена: ${imagePath}`);
                    // Пробуем альтернативные пути
                if (id === 'renata') {
                    // Если эмоция не найдена, оставляем текущее изображение
                    // или пробуем найти похожую эмоцию
                    const similarEmotions = {
                        'happy': 'confident',
                        'confident': 'happy',
                        'nervous': 'thoughtful',
                        'thoughtful': 'nervous'
                    };
                    if (similarEmotions[emotion]) {
                        img.src = `assets/characters/${id}/emotions/${similarEmotions[emotion]}.png`;
                    }
                } else if (id === 'sonyata' || id === 'anya') {
                    // Для подруг пробуем дефолтные эмоции
                    const defaultEmotions = ['happy', 'excited', 'smile'];
                    for (const defEmotion of defaultEmotions) {
                        const testPath = `assets/characters/${id}/${defEmotion}.png`;
                        const testImg = new Image();
                        testImg.onload = () => {
                            img.src = testPath;
                        };
                        testImg.src = testPath;
                        break;
                    }
                }
                };
            }
        });
    }
    
    /**
     * Подсветка говорящего персонажа
     */
    highlightSpeaker(speakerId) {
        ['Left', 'Center', 'Right'].forEach(pos => {
            const slot = this.elements['char' + pos];
            const img = slot.querySelector('img');
            
            if (img) {
                if (img.dataset.characterId === speakerId) {
                    slot.classList.add('speaking');
                    slot.classList.remove('dimmed');
                } else if (img.dataset.characterId) {
                    slot.classList.remove('speaking');
                    slot.classList.add('dimmed');
                }
            }
        });
    }
    
    /**
     * Установить фон
     */
    setBackground(bgPath) {
        if (!bgPath) {
            // Если путь не указан, используем дефолтный градиент
            this.elements.sceneBackground.style.backgroundImage = '';
            this.elements.sceneBackground.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)';
            return;
        }
        
        // Проверяем, загружается ли изображение
        const img = new Image();
        
        img.onload = () => {
            // Изображение загрузилось успешно
            this.elements.sceneBackground.style.backgroundImage = `url(${bgPath})`;
            this.elements.sceneBackground.style.backgroundSize = 'cover';
            this.elements.sceneBackground.style.backgroundPosition = 'center';
            this.elements.sceneBackground.style.backgroundRepeat = 'no-repeat';
        };
        
        img.onerror = () => {
            // Изображение не загрузилось - используем красивый градиент-плейсхолдер
            console.warn(`Фон не найден: ${bgPath}. Используется плейсхолдер.`);
            this.elements.sceneBackground.style.backgroundImage = '';
            
            // Красивый романтический градиент в зависимости от сцены
            const gradients = {
                'bedroom-morning': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ffecd2 100%)',
                'car-ride': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #a8edea 100%)',
                'event-venue': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #ff9a9e 100%)',
                'romantic-ending': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)'
            };
            
            // Определяем тип сцены по пути
            let gradient = 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)';
            for (const [key, value] of Object.entries(gradients)) {
                if (bgPath.includes(key)) {
                    gradient = value;
                    break;
                }
            }
            
            this.elements.sceneBackground.style.background = gradient;
        };
        
        // Начинаем загрузку
        img.src = bgPath;
    }
    
    /**
     * Переход между сценами
     */
    transition(callback, duration = 600) {
        this.elements.transitionOverlay.classList.add('active');
        
        setTimeout(() => {
            if (callback) callback();
            
            setTimeout(() => {
                this.elements.transitionOverlay.classList.remove('active');
            }, duration / 2);
        }, duration / 2);
    }
    
    /**
     * Проверить условие
     */
    checkCondition(condition) {
        if (typeof condition === 'function') {
            return condition(this.gameState.variables);
        }
        
        if (typeof condition === 'object') {
            return Object.entries(condition).every(([key, value]) => {
                const varValue = this.gameState.variables[key];
                
                if (typeof value === 'object') {
                    if (value.gte !== undefined && varValue < value.gte) return false;
                    if (value.lte !== undefined && varValue > value.lte) return false;
                    if (value.eq !== undefined && varValue !== value.eq) return false;
                    return true;
                }
                
                return varValue === value;
            });
        }
        
        return true;
    }
    
    /**
     * Применить эффект
     */
    applyEffect(effect) {
        if (typeof effect === 'function') {
            effect(this.gameState.variables);
            this.updateSuccessScore();
            return;
        }
        
        Object.entries(effect).forEach(([key, value]) => {
            if (typeof value === 'number') {
                this.gameState.variables[key] = Math.max(0, Math.min(100, 
                    (this.gameState.variables[key] || 0) + value
                ));
            } else {
                this.gameState.variables[key] = value;
            }
        });
        
        // Обновить счётчик успеха
        this.updateSuccessScore();
    }
    
    /**
     * Обновить счётчик успеха
     */
    updateSuccessScore() {
        const vars = this.gameState.variables;
        
        // Вычисляем общий успех на основе всех переменных
        const score = Math.round(
            (vars.romance * 0.3) +
            (vars.confidenceRenata * 0.3) +
            (vars.respectFromOthers * 0.4)
        );
        
        vars.successScore = Math.max(0, Math.min(100, score));
        
        // Обновить UI
        if (this.elements.successScore) {
            this.elements.successScore.textContent = vars.successScore;
        }
        if (this.elements.successBar) {
            this.elements.successBar.style.width = vars.successScore + '%';
        }
    }
    
    /**
     * Обработка конца сцены
     */
    handleSceneEnd() {
        const scene = this.gameState.currentScene;
        
        if (scene.nextScene) {
            const nextScene = GAME_SCRIPT.scenes[scene.nextScene];
            if (nextScene) {
                this.loadScene(nextScene);
            }
        } else if (scene.isEnding) {
            this.showEnding(scene.endingType);
        } else {
            // Проверить финалы
            this.checkEndings();
        }
    }
    
    /**
     * Проверить условия финалов
     */
    checkEndings() {
        if (!GAME_SCRIPT.endings) return;
        
        // Проверить все финалы (кроме default)
        for (const [endingId, ending] of Object.entries(GAME_SCRIPT.endings)) {
            if (endingId === 'default') continue;
            
            if (ending.condition) {
                let conditionMet = false;
                
                // Если условие - функция
                if (typeof ending.condition === 'function') {
                    conditionMet = ending.condition(this.gameState.variables);
                } 
                // Если условие - объект с переменными
                else if (typeof ending.condition === 'object') {
                    conditionMet = this.checkCondition(ending.condition);
                }
                
                if (conditionMet) {
                    this.showEnding(endingId);
                    return;
                }
            }
        }
        
        // Если ничего не подошло, показать дефолтный финал
        const defaultEnding = GAME_SCRIPT.endings.default || Object.values(GAME_SCRIPT.endings)[0];
        if (defaultEnding) {
            this.showEnding(defaultEnding.id || Object.keys(GAME_SCRIPT.endings)[0]);
        }
    }
    
    /**
     * Показать финал
     */
    showEnding(endingId) {
        const ending = GAME_SCRIPT.endings[endingId];
        if (!ending) {
            console.error('Финал не найден:', endingId);
            return;
        }
        
        this.switchScreen('ending');
        
        // Установить фон если есть
        if (ending.background) {
            this.setBackground(ending.background);
        }
        
        // Показать текст финала
        this.elements.endingTitle.textContent = ending.title || '💕';
        this.elements.endingText.innerHTML = ending.text || '';
        
        // Если есть диалоги, показать их
        if (ending.dialogue) {
            // Можно добавить анимацию показа диалогов финала
        }
    }
    
    /**
     * Переключить экран
     */
    switchScreen(screenName) {
        const screens = ['main-menu', 'game-screen', 'ending-screen'];
        const targetId = screenName === 'menu' ? 'main-menu' : 
                         screenName === 'game' ? 'game-screen' :
                         screenName === 'ending' ? 'ending-screen' : screenName;
        
        screens.forEach(id => {
            const el = document.getElementById(id);
            if (id === targetId) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
        
        // Управление видимостью счётчика
        if (this.elements.successCounter) {
            if (screenName === 'game') {
                this.elements.successCounter.style.display = 'block';
            } else {
                this.elements.successCounter.style.display = 'none';
            }
        }
    }
    
    /**
     * Пропустить до выбора
     */
    skipToChoice() {
        const scene = this.gameState.currentScene;
        if (!scene || !scene.dialogue) return;
        
        for (let i = this.gameState.currentDialogueIndex; i < scene.dialogue.length; i++) {
            if (scene.dialogue[i].type === 'choice') {
                this.gameState.currentDialogueIndex = i;
                this.showDialogue();
                return;
            }
        }
    }
    
    /**
     * Переключить авто-проигрывание
     */
    toggleAutoPlay() {
        this.gameState.isAutoPlay = !this.gameState.isAutoPlay;
        this.elements.btnAuto.classList.toggle('active', this.gameState.isAutoPlay);
        
        if (this.gameState.isAutoPlay && !this.gameState.isTyping) {
            this.gameState.autoPlayTimer = setTimeout(() => {
                this.nextDialogue();
            }, this.settings.autoPlayDelay);
        }
    }
}

// Глобальный экземпляр движка
const engine = new VNEngine();

