import './style.css';
import { Sprite, Texture, Container, Text, TextStyle, Graphics } from 'pixi.js';
import { game } from './core/Game';
import { AssetLoader } from './core/AssetLoader';
import { GridMath } from './logic/GridMath';
import { MatchLogic } from './logic/MatchLogic';
import { CascadeMath } from './logic/CascadeMath';
import { GridView } from './components/grid/GridView';
import { GameConfig } from './config/GameConfig';

async function bootstrap() {
    await game.init(document.body);
    await AssetLoader.loadAll();

    // 1. Задний фон
    const bg = new Sprite(Texture.from('bg'));
    bg.anchor.set(0.5); 
    bg.tint = 0xffffff;
    game.app.stage.addChildAt(bg, 0);

    // 2. Игровое поле (рамка + сетка)
    const slotContainer = new Container();
    game.app.stage.addChild(slotContainer);

    const gridView = new GridView();
    let currentGridData = GridMath.generateInitialGrid();
    slotContainer.addChild(gridView);

    const frame = new Sprite(Texture.from('frame'));
    frame.anchor.set(0.5);
    slotContainer.addChild(frame);

    // 3. Отдельная нижняя панель управления на всю ширину
    const bottomBar = new Container();
    game.app.stage.addChild(bottomBar);

    const barBg = new Graphics();
    bottomBar.addChild(barBg);

    // Вспомогательная функция для интерактивности кнопок с увеличенным базовым размером
    const setupButton = (sprite: Sprite, baseW: number, baseH: number) => {
        sprite.anchor.set(0.5);
        sprite.width = baseW;
        sprite.height = baseH;
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', () => { sprite.width = baseW * 0.92; sprite.height = baseH * 0.92; });
        sprite.on('pointerup', () => { sprite.width = baseW; sprite.height = baseH; });
        sprite.on('pointerupoutside', () => { sprite.width = baseW; sprite.height = baseH; });
        bottomBar.addChild(sprite);
    };

    // Кнопки левой стороны (увеличены до 46x46)
    const infoBtn = new Sprite(Texture.from('info'));
    setupButton(infoBtn, 46, 46);

    const settingsBtn = new Sprite(Texture.from('settings'));
    setupButton(settingsBtn, 46, 46);

    // Кнопки правой стороны (Spin увеличен до 96x96, +/- до 58x58, Auto до 50x50)
    const minusBtn = new Sprite(Texture.from('minus'));
    setupButton(minusBtn, 58, 58);

    const spinBtn = new Sprite(Texture.from('spin'));
    setupButton(spinBtn, 96, 96);

    const plusBtn = new Sprite(Texture.from('plus'));
    setupButton(plusBtn, 58, 58);

    const autoBtn = new Sprite(Texture.from('auto'));
    setupButton(autoBtn, 50, 50);

    // 4. Тексты интерфейса
    const labelStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 15,
        fontWeight: 'bold',
        fill: 0xffb800
    });

    const valueStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffffff
    });

    const winTitleStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 17,
        fontWeight: 'bold',
        fill: 0xffb800
    });

    const winValueStyle = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 34,
        fontWeight: 'bold',
        fill: 0xffffff
    });

    // Левый блок текстов (CREDIT и BET)
    const creditLabel = new Text({ text: 'CREDIT', style: labelStyle });
    creditLabel.anchor.set(0, 0.5);
    bottomBar.addChild(creditLabel);

    const creditValue = new Text({ text: '$10,000.00', style: valueStyle });
    creditValue.anchor.set(0, 0.5);
    bottomBar.addChild(creditValue);

    const betLabel = new Text({ text: 'BET', style: labelStyle });
    betLabel.anchor.set(0, 0.5);
    bottomBar.addChild(betLabel);

    const betValue = new Text({ text: '$1.00', style: valueStyle });
    betValue.anchor.set(0, 0.5);
    bottomBar.addChild(betValue);

    // Центральный блок выигрыша (WIN)
    const winTitle = new Text({ text: 'WIN', style: winTitleStyle });
    winTitle.anchor.set(0.5, 0.5);
    bottomBar.addChild(winTitle);

    const winValue = new Text({ text: '$0.00', style: winValueStyle });
    winValue.anchor.set(0.5, 0.5);
    bottomBar.addChild(winValue);

    // Переменные баланса и ставок
    let balance = 10000.00;
    let currentBet = 1.00;
    const betSteps = [0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00];
    let betIndex = 1;

    const updateUI = () => {
        creditValue.text = `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        betValue.text = `$${currentBet.toFixed(2)}`;
    };
    updateUI();

    // 5. Адаптивная раскладка экрана
    const resizeAll = () => {
        const sw = game.app.screen.width;
        const sh = game.app.screen.height;
        const barHeight = 125; // Увеличенная высота панели под более крупные кнопки

        // Фон
        bg.x = sw / 2;
        bg.y = sh / 2;
        bg.scale.set(Math.max(sw / bg.texture.width, sh / bg.texture.height));

        // Нижняя черная подложка
        bottomBar.y = sh - barHeight;
        barBg.clear()
            .rect(0, 0, sw, barHeight)
            .fill({ color: 0x000000, alpha: 0.65 });

        // Левая часть панели: Info, Settings, Баланс и Ставка
        infoBtn.x = 48;
        infoBtn.y = 35;

        settingsBtn.x = 48;
        settingsBtn.y = 88;

        creditLabel.x = 88;
        creditLabel.y = 35;
        creditValue.x = 165;
        creditValue.y = 35;

        betLabel.x = 88;
        betLabel.y = 88;
        betValue.x = 165;
        betValue.y = 88;

        // Центральная часть: выигрыш
        winTitle.x = sw / 2;
        winTitle.y = 30;

        winValue.x = sw / 2;
        winValue.y = 75;

        // Правая часть: Spin, Minus, Plus, Auto
        const rightGroupX = sw - 165;
        const spinCenterY = barHeight / 2 - 12;

        spinBtn.x = rightGroupX;
        spinBtn.y = spinCenterY;

        minusBtn.x = rightGroupX - 78;
        minusBtn.y = spinCenterY;

        plusBtn.x = rightGroupX + 78;
        plusBtn.y = spinCenterY;

        autoBtn.x = rightGroupX;
        autoBtn.y = spinCenterY + 54;

        // Позиционирование барабанов и рамки в свободной верхней части экрана
        const { columns, rows, symbolSize, padding } = GameConfig.grid;
        const gridWidth = columns * symbolSize + (columns - 1) * padding;
        const gridHeight = rows * symbolSize + (rows - 1) * padding;

        const frameThicknessX = 200;
        const frameThicknessY = 220;

        const totalSlotW = gridWidth + frameThicknessX;
        const totalSlotH = gridHeight + frameThicknessY;

        gridView.x = -gridWidth / 2;
        gridView.y = -gridHeight / 2;
        frame.x = 0;
        frame.y = 0;
        frame.width = totalSlotW;
        frame.height = totalSlotH;

        const availableH = sh - barHeight;
        const scaleX = (sw * 0.94) / totalSlotW;
        const scaleY = (availableH * 0.92) / totalSlotH;
        const safeScale = Math.min(scaleX, scaleY, 1);

        slotContainer.scale.set(safeScale);
        slotContainer.x = sw / 2;
        slotContainer.y = availableH / 2;
    };

    resizeAll();
    window.addEventListener('resize', resizeAll);

    await gridView.renderGrid(currentGridData);

    let isSpinning = false;

    // Управление ставкой
    minusBtn.on('pointerdown', () => {
        if (isSpinning) return;
        if (betIndex > 0) {
            betIndex--;
            currentBet = betSteps[betIndex];
            updateUI();
        }
    });

    plusBtn.on('pointerdown', () => {
        if (isSpinning) return;
        if (betIndex < betSteps.length - 1) {
            betIndex++;
            currentBet = betSteps[betIndex];
            updateUI();
        }
    });

    // Бонусная игра фриспинов
    const playFreeSpins = async (spinsCount: number) => {
        let totalBonusWin = 0;

        for (let i = 0; i < spinsCount; i++) {
            await new Promise(res => setTimeout(res, 1000));
            let currentSpinWin = 0;

            currentGridData = GridMath.generateInitialGrid();
            await gridView.renderGrid(currentGridData);

            while (true) {
                const wins = MatchLogic.findWins(currentGridData);
                if (wins.length === 0) break;

                wins.forEach(win => {
                    currentSpinWin += win.count * 10 * currentBet;
                });

                const nextGridData = CascadeMath.applyCascades(currentGridData, wins);
                await gridView.playCascades(wins, nextGridData);
                currentGridData = nextGridData;
            }

            if (currentSpinWin > 0) {
                const multiSum = gridView.getActiveMultipliers();
                if (multiSum > 0) {
                    currentSpinWin *= multiSum;
                }
            }

            totalBonusWin += currentSpinWin;
            winValue.text = `$${totalBonusWin.toFixed(2)}`;
        }

        balance += totalBonusWin;
        updateUI();
    };

    // Вращение барабанов (SPIN)
    spinBtn.on('pointerdown', async () => {
        if (isSpinning) return;
        if (balance < currentBet) {
            console.warn('Недостаточно средств!');
            return;
        }

        isSpinning = true;
        spinBtn.alpha = 0.5;
        balance -= currentBet;
        updateUI();
        winValue.text = '$0.00';

        currentGridData = GridMath.generateInitialGrid();
        await gridView.renderGrid(currentGridData);

        let spinTotalWin = 0;

        while (true) {
            const wins = MatchLogic.findWins(currentGridData);
            if (wins.length === 0) break;

            let stepWin = 0;
            wins.forEach(w => {
                stepWin += w.count * 5 * currentBet;
            });
            spinTotalWin += stepWin;
            winValue.text = `$${spinTotalWin.toFixed(2)}`;

            const nextGridData = CascadeMath.applyCascades(currentGridData, wins);
            await gridView.playCascades(wins, nextGridData);
            currentGridData = nextGridData;
        }

        if (spinTotalWin > 0) {
            balance += spinTotalWin;
            updateUI();
        }

        // Проверка скаттеров
        let scatterCount = 0;
        for (let col = 0; col < currentGridData.length; col++) {
            for (let row = 0; row < currentGridData[col].length; row++) {
                if (currentGridData[col][row] === GameConfig.scatterId) {
                    scatterCount++;
                }
            }
        }

        if (scatterCount >= 4) {
            await playFreeSpins(10);
        }

        isSpinning = false;
        spinBtn.alpha = 1;
    });
}

bootstrap().catch(console.error);