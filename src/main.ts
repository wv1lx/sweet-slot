import './style.css';
import { Sprite, Texture, Container, Text, TextStyle, Graphics, Assets } from 'pixi.js';
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

    // Ждем полной готовности шрифта Changa One в браузере
    await document.fonts.ready;

    // 1. Задний фон
    const bg = new Sprite(Texture.from('bg'));
    bg.anchor.set(0.5); 
    bg.tint = 0xffffff;
    game.app.stage.addChildAt(bg, 0);

    // 2. Игровое поле (сетка + бамбуковая рамка)
    const slotContainer = new Container();
    game.app.stage.addChild(slotContainer);

    const gridView = new GridView();
    let currentGridData = GridMath.generateInitialGrid();
    slotContainer.addChild(gridView);

    const frame = new Sprite(Texture.from('frame'));
    frame.anchor.set(0.5);
    slotContainer.addChild(frame);

    // 3. Блок покупки бонуса слева
    const buyBonusContainer = new Container();
    game.app.stage.addChild(buyBonusContainer);

    const frameWidth = 260;
    const frameHeight = 225;

    // Сама бамбуковая рамка frame_bs (черная подложка убрана)
    const frameBsTexture = Assets.get('frame_bs') || Texture.from('frame_bs');
    const buyFrame = new Sprite(frameBsTexture);
    buyFrame.anchor.set(0.5);
    buyFrame.width = frameWidth;
    buyFrame.height = frameHeight;
    buyBonusContainer.addChild(buyFrame);

    // Тексты внутри рамки (шрифт Changa One, компактное позиционирование)
    const infoTitleStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 18,
        fontWeight: 'normal',
        fill: 0xffd700,
        stroke: { color: 0x221100, width: 4 }
    });

    const infoDescStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 12,
        fontWeight: 'normal',
        fill: 0xffffff,
        stroke: { color: 0x051b2c, width: 3 }
    });

    const infoSubStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 10,
        fontWeight: 'normal',
        fill: 0x4df0ff,
        stroke: { color: 0x02101e, width: 2 }
    });

    const buyTitle = new Text({ text: 'BUY FEATURE', style: infoTitleStyle });
    buyTitle.anchor.set(0.5, 0.5);
    buyTitle.y = -52; // Опущено ниже верхних бревен
    buyBonusContainer.addChild(buyTitle);

    const buyDesc = new Text({ text: '10 FREE SPINS', style: infoDescStyle });
    buyDesc.anchor.set(0.5, 0.5);
    buyDesc.y = -26;
    buyBonusContainer.addChild(buyDesc);

    const buySub = new Text({ text: 'MULTIPLIERS UP TO 100x', style: infoSubStyle });
    buySub.anchor.set(0.5, 0.5);
    buySub.y = -8;
    buyBonusContainer.addChild(buySub);

    // Кнопка покупки в стилистике бамбука и дерева
    const buyBtn = new Container();
    buyBtn.eventMode = 'static';
    buyBtn.cursor = 'pointer';
    buyBtn.y = 38; // Расположена строго над нижним бревном
    buyBonusContainer.addChild(buyBtn);

    const btnW = 165;
    const btnH = 50;

    const buyBtnBg = new Graphics();
    const drawBuyBtnBg = (hover: boolean) => {
        buyBtnBg.clear();
        // Внешний темный контур под дерево
        buyBtnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
            .fill({ color: hover ? 0x945415 : 0x70380c, alpha: 1 })
            .stroke({ color: 0x261102, width: 3 });

        // Внутренняя золотистая тесьма
        buyBtnBg.roundRect(-btnW / 2 + 3, -btnH / 2 + 3, btnW - 6, btnH - 6, 9)
            .stroke({ color: hover ? 0xfff085 : 0xffbe26, width: 2 });
    };
    drawBuyBtnBg(false);
    buyBtn.addChild(buyBtnBg);

    const buyBtnLabel = new Text({
        text: 'BUY',
        style: new TextStyle({
            fontFamily: 'Changa One',
            fontSize: 12,
            fill: 0xffe680,
            stroke: { color: 0x331a00, width: 3 }
        })
    });
    buyBtnLabel.anchor.set(0.5, 0.5);
    buyBtnLabel.y = -9;
    buyBtn.addChild(buyBtnLabel);

    const buyBtnPrice = new Text({
        text: '$100.00',
        style: new TextStyle({
            fontFamily: 'Changa One',
            fontSize: 20,
            fill: 0xffffff,
            stroke: { color: 0x221100, width: 4 }
        })
    });
    buyBtnPrice.anchor.set(0.5, 0.5);
    buyBtnPrice.y = 9;
    buyBtn.addChild(buyBtnPrice);

    buyBtn.on('pointerover', () => drawBuyBtnBg(true));
    buyBtn.on('pointerout', () => drawBuyBtnBg(false));
    buyBtn.on('pointerdown', () => buyBtn.scale.set(0.93));
    buyBtn.on('pointerup', () => buyBtn.scale.set(1.0));
    buyBtn.on('pointerupoutside', () => buyBtn.scale.set(1.0));

    // 4. Нижняя черная панель управления
    const bottomBar = new Container();
    game.app.stage.addChild(bottomBar);

    const barBg = new Graphics();
    bottomBar.addChild(barBg);

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

    const infoBtn = new Sprite(Texture.from('info'));
    setupButton(infoBtn, 46, 46);

    const settingsBtn = new Sprite(Texture.from('settings'));
    setupButton(settingsBtn, 46, 46);

    const minusBtn = new Sprite(Texture.from('minus'));
    setupButton(minusBtn, 58, 58);

    const spinBtn = new Sprite(Texture.from('spin'));
    setupButton(spinBtn, 96, 96);

    const plusBtn = new Sprite(Texture.from('plus'));
    setupButton(plusBtn, 58, 58);

    const autoBtn = new Sprite(Texture.from('auto'));
    setupButton(autoBtn, 50, 50);

    // 5. Тексты нижней панели (шрифт Changa One)
    const labelStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 15,
        fill: 0xffb800,
        stroke: { color: 0x000000, width: 2 }
    });

    const valueStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 20,
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 3 }
    });

    const winTitleStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 17,
        fill: 0xffb800,
        stroke: { color: 0x000000, width: 2 }
    });

    const winValueStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 34,
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 4 }
    });

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

    const winTitle = new Text({ text: 'WIN', style: winTitleStyle });
    winTitle.anchor.set(0.5, 0.5);
    bottomBar.addChild(winTitle);

    const winValue = new Text({ text: '$0.00', style: winValueStyle });
    winValue.anchor.set(0.5, 0.5);
    bottomBar.addChild(winValue);

    // Состояние баланса и ставок
    let balance = 10000.00;
    let currentBet = 1.00;
    const betSteps = [0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00];
    let betIndex = 1;
    let buyBonusBaseScale = 1;

    const updateUI = () => {
        creditValue.text = `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        betValue.text = `$${currentBet.toFixed(2)}`;
        const bonusCost = currentBet * 100;
        buyBtnPrice.text = `$${bonusCost.toFixed(2)}`;
    };
    updateUI();

    // 6. Адаптивная раскладка экрана
    const resizeAll = () => {
        const sw = game.app.screen.width;
        const sh = game.app.screen.height;
        const barHeight = 125;
        const availableH = sh - barHeight;

        // Фон
        bg.x = sw / 2;
        bg.y = sh / 2;
        bg.scale.set(Math.max(sw / bg.texture.width, sh / bg.texture.height));

        // Нижняя панель
        bottomBar.y = sh - barHeight;
        barBg.clear().rect(0, 0, sw, barHeight).fill({ color: 0x000000, alpha: 0.88 });

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

        winTitle.x = sw / 2;
        winTitle.y = 30;

        winValue.x = sw / 2;
        winValue.y = 75;

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

        // Размеры барабанов
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

        // Рамка бонуса слева
        const buyMarginLeft = Math.max(30, sw * 0.025);
        buyBonusBaseScale = Math.min((availableH * 0.42) / frameHeight, (sw * 0.22) / frameWidth, 1.35);
        buyBonusBaseScale = Math.max(buyBonusBaseScale, 0.95);

        buyBonusContainer.scale.set(buyBonusBaseScale);
        buyBonusContainer.x = buyMarginLeft + (frameWidth * buyBonusBaseScale) / 2;
        buyBonusContainer.y = availableH / 2;

        // Зона под слот: от рамки бонуса до правого края экрана
        const buyRightEdge = buyBonusContainer.x + (frameWidth * buyBonusBaseScale) / 2;
        const slotMarginRight = Math.max(25, sw * 0.02);
        const slotStartX = buyRightEdge + 35;
        const availableSlotWidth = sw - slotMarginRight - slotStartX;

        // Слот занимает 96% высоты экрана и растянут по ширине
        const baseScaleY = (availableH * 0.96) / totalSlotH;
        const stretchX = 1.22;
        const baseScaleX = baseScaleY * stretchX;

        slotContainer.scale.set(baseScaleX, baseScaleY);
        slotContainer.x = slotStartX + availableSlotWidth / 2;
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
        winTitle.text = 'BONUS WIN';

        for (let i = 0; i < spinsCount; i++) {
            await new Promise(res => setTimeout(res, 900));
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
        winTitle.text = 'WIN';
    };

    // Нажатие на кнопку покупки бонуса
    buyBtn.on('pointerdown', async () => {
        if (isSpinning) return;
        const bonusCost = currentBet * 100;
        if (balance < bonusCost) {
            console.warn('Недостаточно средств для покупки бонуса!');
            return;
        }

        isSpinning = true;
        buyBtn.alpha = 0.5;
        balance -= bonusCost;
        updateUI();
        winValue.text = '$0.00';

        await playFreeSpins(10);

        isSpinning = false;
        buyBtn.alpha = 1.0;
    });

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