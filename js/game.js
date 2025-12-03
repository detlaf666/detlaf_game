/**
 * ═══════════════════════════════════════════════════════════
 * ИНИЦИАЛИЗАЦИЯ ИГРЫ
 * Для Ренусики 💕
 * ═══════════════════════════════════════════════════════════
 */

// Ждём загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('💕 Игра загружается...');
    
    // Инициализация движка
    engine.init();
    
    // Добавляем эффекты в меню
    createMenuEffects();
    
    console.log('💕 Игра готова! Нажми "Начать историю" для начала.');
});

/**
 * Создание эффектов в меню
 */
function createMenuEffects() {
    const particlesContainer = document.querySelector('.particles');
    const heartsContainer = document.querySelector('.floating-hearts');
    
    // Создаём больше частиц
    if (particlesContainer) {
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 3 + 2;
            const delay = Math.random() * 25;
            const duration = Math.random() * 15 + 20;
            const left = Math.random() * 100;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(255, 158, 200, ${Math.random() * 0.4 + 0.4});
                border-radius: 50%;
                left: ${left}%;
                top: ${Math.random() * 100}%;
                animation: float-particle ${duration}s linear infinite;
                animation-delay: -${delay}s;
                pointer-events: none;
                box-shadow: 0 0 ${size * 2}px rgba(255, 158, 200, 0.8);
            `;
            particlesContainer.appendChild(particle);
        }
    }
    
    // Создаём плавающие сердечки
    if (heartsContainer) {
        const hearts = ['💕', '💖', '💗', '💝', '✨'];
        for (let i = 0; i < 8; i++) {
            const heart = document.createElement('div');
            const heartEmoji = hearts[Math.floor(Math.random() * hearts.length)];
            const delay = Math.random() * 20;
            const duration = Math.random() * 10 + 18;
            const left = Math.random() * 100;
            const size = Math.random() * 0.8 + 1.2;
            
            heart.textContent = heartEmoji;
            heart.style.cssText = `
                position: absolute;
                font-size: ${size}rem;
                left: ${left}%;
                top: ${Math.random() * 100}%;
                animation: heart-float ${duration}s ease-in-out infinite;
                animation-delay: -${delay}s;
                pointer-events: none;
                opacity: ${Math.random() * 0.4 + 0.4};
            `;
            heartsContainer.appendChild(heart);
        }
    }
    
    // Добавляем стиль анимации если его нет
    if (!document.querySelector('#particle-style')) {
        const style = document.createElement('style');
        style.id = 'particle-style';
        style.textContent = `
            @keyframes float-particle {
                0% {
                    transform: translateY(100vh) translateX(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 80 + 40}px) rotate(360deg);
                    opacity: 0;
                }
            }
            @keyframes heart-float {
                0% {
                    transform: translateY(100vh) translateX(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.6;
                }
                90% {
                    opacity: 0.6;
                }
                100% {
                    transform: translateY(-100px) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 60 + 30}px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Утилиты для отладки (можно использовать в консоли)
window.debug = {
    // Показать текущие переменные
    showVars: () => {
        console.table(engine.gameState.variables);
    },
    
    // Установить переменную
    setVar: (key, value) => {
        engine.gameState.variables[key] = value;
        console.log(`✅ ${key} = ${value}`);
    },
    
    // Перейти к сцене
    goToScene: (sceneId) => {
        const scene = GAME_SCRIPT.scenes[sceneId];
        if (scene) {
            engine.loadScene(scene);
            console.log(`✅ Переход к сцене: ${sceneId}`);
        } else {
            console.error(`❌ Сцена не найдена: ${sceneId}`);
            console.log('Доступные сцены:', Object.keys(GAME_SCRIPT.scenes).join(', '));
        }
    },
    
    // Максимизировать романтику
    maxRomance: () => {
        engine.gameState.variables.romance = 100;
        engine.gameState.variables.confidenceRenata = 100;
        engine.gameState.variables.respectFromOthers = 100;
        console.log('✅ Все переменные максимизированы!');
    }
};

console.log('💕 Команды отладки доступны через window.debug:');
console.log('   debug.showVars() — показать переменные');
console.log('   debug.setVar("romance", 100) — установить переменную');
console.log('   debug.goToScene("scene2_road") — перейти к сцене');
console.log('   debug.maxRomance() — максимизировать все переменные');

