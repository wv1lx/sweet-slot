import './style.css';
import { Sprite, Texture, Container, Text, TextStyle, Graphics, Assets } from 'pixi.js';
import { game } from './core/Game';
import { AssetLoader } from './core/AssetLoader';
import { GridMath } from './logic/GridMath';
import { MatchLogic } from './logic/MatchLogic';
import { CascadeMath } from './logic/CascadeMath';
import { GridView } from './components/grid/GridView';
import { GameConfig } from './config/GameConfig';
import gsap from 'gsap';

// Генераторы бесшовных текстур градиента для свечения по сторонам экрана
function createHorizontalGlowTexture(fromLeft: boolean): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 2;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(fromLeft ? 0 : 256, 0, fromLeft ? 256 : 0, 0);
    grad.addColorStop(0, 'rgba(0, 235, 255, 0.95)');
    grad.addColorStop(0.18, 'rgba(0, 215, 255, 0.55)');
    grad.addColorStop(0.55, 'rgba(0, 180, 255, 0.18)');
    grad.addColorStop(1, 'rgba(0, 140, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 2);
    return Texture.from(canvas);
}

function createVerticalGlowTexture(fromTop: boolean): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, fromTop ? 0 : 256, 0, fromTop ? 256 : 0);
    grad.addColorStop(0, 'rgba(0, 235, 255, 0.95)');
    grad.addColorStop(0.18, 'rgba(0, 215, 255, 0.55)');
    grad.addColorStop(0.55, 'rgba(0, 180, 255, 0.18)');
    grad.addColorStop(1, 'rgba(0, 140, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 256);
    return Texture.from(canvas);
}

async function bootstrap() {
    await game.init(document.body);
    await AssetLoader.loadAll();
    await document.fonts.ready;

    // 1. Задний фон: базовый и бонусный
    const bgContainer = new Container();
    game.app.stage.addChildAt(bgContainer, 0);

    const bg = new Sprite(Texture.from('bg'));
    bg.anchor.set(0.5);
    bg.tint = 0xffffff;
    bgContainer.addChild(bg);

    const bgBonus = new Sprite(Texture.from('bg_bonus'));
    bgBonus.anchor.set(0.5);
    bgBonus.alpha = 0;
    bgContainer.addChild(bgBonus);

    // 2. Игровое поле
    const slotContainer = new Container();
    game.app.stage.addChild(slotContainer);

    // Полупрозрачная подложка строго для бонусной игры
    const gridBacking = new Graphics();
    gridBacking.alpha = 0;
    slotContainer.addChild(gridBacking);

    const gridView = new GridView();
    let currentGridData = GridMath.generateInitialGrid();
    slotContainer.addChild(gridView);

    const frame = new Sprite(Texture.from('frame'));
    frame.anchor.set(0.5);
    slotContainer.addChild(frame);

    // 3. Блок покупки бонуса слева / счетчик фриспинов
    const buyBonusContainer = new Container();
    game.app.stage.addChild(buyBonusContainer);

    const frameWidth = 260;
    const frameHeight = 225;

    const frameBsTexture = Assets.get('frame_bs') || Texture.from('frame_bs');
    const buyFrame = new Sprite(frameBsTexture);
    buyFrame.anchor.set(0.5);
    buyFrame.width = frameWidth;
    buyFrame.height = frameHeight;
    buyBonusContainer.addChild(buyFrame);

    const infoTitleStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 18,
        fontWeight: 'normal',
        fill: 0xffd700,
        stroke: { color: 0x221100, width: 4 }
    });

    const infoDescStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 13,
        fontWeight: 'normal',
        fill: 0xffffff,
        stroke: { color: 0x051b2c, width: 3 }
    });

    const infoSubStyle = new TextStyle({
        fontFamily: 'Changa One',
        fontSize: 11,
        fontWeight: 'normal',
        fill: 0x4df0ff,
        stroke: { color: 0x02101e, width: 2 }
    });

    const buyTitle = new Text({ text: 'BUY FEATURE', style: infoTitleStyle });
    buyTitle.anchor.set(0.5, 0.5);
    buyTitle.y = -52;
    buyBonusContainer.addChild(buyTitle);

    const buyDesc = new Text({ text: '10 FREE SPINS', style: infoDescStyle });
    buyDesc.anchor.set(0.5, 0.5);
    buyDesc.y = -26;
    buyBonusContainer.addChild(buyDesc);

    const buySub = new Text({ text: 'MULTIPLIERS UP TO 100x', style: infoSubStyle });
    buySub.anchor.set(0.5, 0.5);
    buySub.y = -8;
    buyBonusContainer.addChild(buySub);

    const buyBtn = new Container();
    buyBtn.eventMode = 'static';
    buyBtn.cursor = 'pointer';
    buyBtn.y = 38;
    buyBonusContainer.addChild(buyBtn);

    const btnW = 165;
    const btnH = 50;

    const buyBtnBg = new Graphics();
    const drawBuyBtnBg = (hover: boolean) => {
        buyBtnBg.clear();
        buyBtnBg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
            .fill({ color: hover ? 0x945415 : 0x70380c, alpha: 1 })
            .stroke({ color: 0x261102, width: 3 });

        buyBtnBg.roundRect(-btnW / 2 + 3, -btnH / 2 + 3, btnW - 6, btnH - 6, 9)
            .stroke({ color: hover ? 0xfff085 : 0xffbe26, width: 2 });
    };
    drawBuyBtnBg(false);
    buyBtn.addChild(buyBtnBg);

    const buyBtnLabel = new Text({
        text: 'BUY',
        style: new TextStyle({ fontFamily: 'Changa One', fontSize: 12, fill: 0xffe680, stroke: { color: 0x331a00, width: 3 } })
    });
    buyBtnLabel.anchor.set(0.5, 0.5);
    buyBtnLabel.y = -9;
    buyBtn.addChild(buyBtnLabel);

    const buyBtnPrice = new Text({
        text: '$100.00',
        style: new TextStyle({ fontFamily: 'Changa One', fontSize: 20, fill: 0xffffff, stroke: { color: 0x221100, width: 4 } })
    });
    buyBtnPrice.anchor.set(0.5, 0.5);
    buyBtnPrice.y = 9;
    buyBtn.addChild(buyBtnPrice);

    buyBtn.on('pointerover', () => drawBuyBtnBg(true));
    buyBtn.on('pointerout', () => drawBuyBtnBg(false));
    buyBtn.on('pointerdown', () => buyBtn.scale.set(0.93));
    buyBtn.on('pointerup', () => buyBtn.scale.set(1.0));
    buyBtn.on('pointerupoutside', () => buyBtn.scale.set(1.0));

    const bonusCounterText = new Text({
        text: '',
        style: new TextStyle({
            fontFamily: 'Changa One',
            fontSize: 32,
            fill: 0xffea00,
            stroke: { color: 0x221100, width: 5 }
        })
    });
    bonusCounterText.anchor.set(0.5, 0.5);
    bonusCounterText.y = 35;
    bonusCounterText.visible = false;
    buyBonusContainer.addChild(bonusCounterText);

    // 4. Нижняя черная панель управления
    const bottomBar = new Container();
    bottomBar.zIndex = 40;
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

    // 5. Тексты нижней панели
    const labelStyle = new TextStyle({ fontFamily: 'Changa One', fontSize: 15, fill: 0xffb800, stroke: { color: 0x000000, width: 2 } });
    const valueStyle = new TextStyle({ fontFamily: 'Changa One', fontSize: 20, fill: 0xffffff, stroke: { color: 0x000000, width: 3 } });
    const winTitleStyle = new TextStyle({ fontFamily: 'Changa One', fontSize: 17, fill: 0xffb800, stroke: { color: 0x000000, width: 2 } });
    const winValueStyle = new TextStyle({ fontFamily: 'Changa One', fontSize: 34, fill: 0xffffff, stroke: { color: 0x000000, width: 4 } });

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

    const animateWinValue = async (startVal: number, endVal: number, duration: number = 0.35) => {
        const counter = { val: startVal };
        await new Promise<void>(resolve => {
            gsap.to(counter, {
                val: endVal,
                duration: duration,
                ease: 'power1.out',
                onUpdate: () => {
                    winValue.text = `$${counter.val.toFixed(2)}`;
                },
                onComplete: resolve
            });
        });
    };

    // 6. Окно крупного выигрыша со свечением по 4 сторонам монитора
    const bigWinOverlay = new Container();
    bigWinOverlay.visible = false;
    bigWinOverlay.zIndex = 100;
    game.app.stage.addChild(bigWinOverlay);

    const bigWinBg = new Graphics();
    bigWinOverlay.addChild(bigWinBg);

    // Слой плавного неонового свечения вдоль сторон экрана
    const edgeGlowContainer = new Container();
    bigWinOverlay.addChild(edgeGlowContainer);

    const glowLeft = new Sprite(createHorizontalGlowTexture(true));
    const glowRight = new Sprite(createHorizontalGlowTexture(false));
    const glowTop = new Sprite(createVerticalGlowTexture(true));
    const glowBottom = new Sprite(createVerticalGlowTexture(false));

    edgeGlowContainer.addChild(glowLeft);
    edgeGlowContainer.addChild(glowRight);
    edgeGlowContainer.addChild(glowTop);
    edgeGlowContainer.addChild(glowBottom);

    const bigWinContent = new Container();
    bigWinOverlay.addChild(bigWinContent);

    const bigWinTitle = new Text({
        text: 'BIG WIN!',
        style: new TextStyle({
            fontFamily: 'Changa One',
            fontSize: 64,
            fill: 0xffea00,
            stroke: { color: 0x3d1c00, width: 8 },
            dropShadow: { alpha: 0.8, angle: Math.PI / 6, blur: 10, color: 0x000000, distance: 8 }
        })
    });
    bigWinTitle.anchor.set(0.5, 0.5);
    bigWinTitle.y = -45;
    bigWinContent.addChild(bigWinTitle);

    const bigWinAmount = new Text({
        text: '$0.00',
        style: new TextStyle({
            fontFamily: 'Changa One',
            fontSize: 54,
            fill: 0xffffff,
            stroke: { color: 0x111111, width: 8 }
        })
    });
    bigWinAmount.anchor.set(0.5, 0.5);
    bigWinAmount.y = 40;
    bigWinContent.addChild(bigWinAmount);

    const showBigWinAnimation = async (amount: number, bet: number, customTitle?: string): Promise<void> => {
        const ratio = amount / bet;

        if (customTitle) {
            bigWinTitle.text = customTitle;
            bigWinTitle.style.fill = 0xffd700;
        } else if (ratio >= 50) {
            bigWinTitle.text = 'EPIC WIN!';
            bigWinTitle.style.fill = 0xff3b30;
        } else if (ratio >= 30) {
            bigWinTitle.text = 'MEGA WIN!';
            bigWinTitle.style.fill = 0xff9500;
        } else {
            bigWinTitle.text = 'BIG WIN!';
            bigWinTitle.style.fill = 0xffea00;
        }

        const sw = game.app.screen.width;
        const sh = game.app.screen.height;

        bigWinBg.clear().rect(0, 0, sw, sh).fill({ color: 0x000000, alpha: 0.75 });

        // Растягиваем 4 градиентные полосы вдоль всех сторон экрана
        const glowDepthH = Math.min(sw * 0.18, 220);
        const glowDepthV = Math.min(sh * 0.18, 170);

        glowLeft.x = 0; glowLeft.y = 0; glowLeft.width = glowDepthH; glowLeft.height = sh;
        glowRight.x = sw - glowDepthH; glowRight.y = 0; glowRight.width = glowDepthH; glowRight.height = sh;
        glowTop.x = 0; glowTop.y = 0; glowTop.width = sw; glowTop.height = glowDepthV;
        glowBottom.x = 0; glowBottom.y = sh - glowDepthV; glowBottom.width = sw; glowBottom.height = glowDepthV;

        bigWinContent.x = sw / 2;
        bigWinContent.y = sh / 2;
        bigWinContent.scale.set(0.2);
        bigWinOverlay.alpha = 0;
        bigWinOverlay.visible = true;

        // Плавная пульсация неонового свечения по периметру
        gsap.fromTo(edgeGlowContainer, 
            { alpha: 0.45 }, 
            { alpha: 1, duration: 0.55, repeat: -1, yoyo: true, ease: 'sine.inOut' }
        );

        // Нарастание цифр (тикер)
        const counter = { val: 0 };
        gsap.to(counter, {
            val: amount,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
                bigWinAmount.text = `$${counter.val.toFixed(2)}`;
            }
        });

        await new Promise<void>(resolve => {
            gsap.timeline({ onComplete: resolve })
                .to(bigWinOverlay, { alpha: 1, duration: 0.25 })
                .to(bigWinContent.scale, { x: 1.15, y: 1.15, duration: 0.45, ease: 'back.out(2)' })
                .to(bigWinContent.scale, { x: 1.0, y: 1.0, duration: 0.25 })
                .to(bigWinContent.scale, { x: 1.08, y: 1.08, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' })
                .to({}, { duration: 0.9 });
        });

        await new Promise<void>(resolve => {
            gsap.to(bigWinOverlay, {
                alpha: 0,
                duration: 0.35,
                onComplete: () => {
                    bigWinOverlay.visible = false;
                    gsap.killTweensOf(edgeGlowContainer);
                    resolve();
                }
            });
        });
    };

    // 7. Слой виньеточного перехода (Iris Vignette)
    const irisGraphics = new Graphics();
    irisGraphics.zIndex = 60;
    game.app.stage.addChild(irisGraphics);

    const switchGameBackground = async (toBonus: boolean): Promise<void> => {
        const sw = game.app.screen.width;
        const sh = game.app.screen.height;
        const cx = sw / 2;
        const cy = sh / 2;
        const maxRadius = Math.hypot(sw, sh) / 2 + 120;
        const bigStrokeWidth = 3200;

        const drawIris = (radius: number) => {
            irisGraphics.clear();
            if (radius >= maxRadius) return;

            irisGraphics.circle(cx, cy, radius + bigStrokeWidth / 2)
                .stroke({ color: 0x000000, width: bigStrokeWidth, alpha: 1 });

            if (radius > 15) {
                irisGraphics.circle(cx, cy, radius + 40)
                    .stroke({ color: 0x000000, width: 80, alpha: 0.55 });
                irisGraphics.circle(cx, cy, radius + 95)
                    .stroke({ color: 0x000000, width: 110, alpha: 0.85 });
            } else {
                irisGraphics.rect(0, 0, sw, sh).fill({ color: 0x000000, alpha: 1 });
            }
        };

        // Затемнение стягивается от краев к центру
        const closeAnim = { r: maxRadius };
        await new Promise<void>(resolve => {
            gsap.to(closeAnim, {
                r: 0,
                duration: 1.25,
                ease: 'power2.inOut',
                onUpdate: () => drawIris(closeAnim.r),
                onComplete: resolve
            });
        });

        // Смена фона и подложки происходит в полной темноте без задержки
        if (toBonus) {
            bg.alpha = 0;
            bgBonus.alpha = 1;
            gridBacking.alpha = 1; // Подложка уже готова к моменту открытия
        } else {
            bg.alpha = 1;
            bgBonus.alpha = 0;
            gridBacking.alpha = 0; // Скрываем подложку в темноте
        }

        await new Promise(res => setTimeout(res, 280));

        // Свет раскрывается из центра к краям
        const openAnim = { r: 0 };
        await new Promise<void>(resolve => {
            gsap.to(openAnim, {
                r: maxRadius,
                duration: 1.25,
                ease: 'power2.out',
                onUpdate: () => drawIris(openAnim.r),
                onComplete: () => {
                    irisGraphics.clear();
                    resolve();
                }
            });
        });
    };

    // Генерация 4 гарантированных скаттеров при покупке
    const generateGuaranteedScatterGrid = (count: number = 4): number[][] => {
        const { columns, rows } = GameConfig.grid;
        const grid = GridMath.generateInitialGrid(false);

        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows; r++) {
                if (grid[c][r] === GameConfig.scatterId) {
                    grid[c][r] = GridMath.getRandomRegularSymbol();
                }
            }
        }

        const availableCols = Array.from({ length: columns }, (_, i) => i);
        for (let i = availableCols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableCols[i], availableCols[j]] = [availableCols[j], availableCols[i]];
        }
        const chosenCols = availableCols.slice(0, count);

        chosenCols.forEach(col => {
            const randomRow = Math.floor(Math.random() * rows);
            grid[col][randomRow] = GameConfig.scatterId;
        });

        return grid;
    };

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

    // 8. Адаптивная раскладка
    const resizeAll = () => {
        const sw = game.app.screen.width;
        const sh = game.app.screen.height;
        const barHeight = 125;
        const availableH = sh - barHeight;

        const maxScale = Math.max(sw / bg.texture.width, sh / bg.texture.height);
        bg.x = sw / 2;
        bg.y = sh / 2;
        bg.scale.set(maxScale);

        bgBonus.x = sw / 2;
        bgBonus.y = sh / 2;
        bgBonus.scale.set(maxScale);

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

        const { columns, rows, symbolSize, padding } = GameConfig.grid;
        const gridWidth = columns * symbolSize + (columns - 1) * padding;
        const gridHeight = rows * symbolSize + (rows - 1) * padding;

        const frameThicknessX = 200;
        const frameThicknessY = 220;
        const totalSlotW = gridWidth + frameThicknessX;
        const totalSlotH = gridHeight + frameThicknessY;

        // Расширенная полупрозрачная подложка под всю внутреннюю площадь рамки
        const backingW = gridWidth + 70;
        const backingH = gridHeight + 70;
        gridBacking.clear()
            .roundRect(-backingW / 2, -backingH / 2, backingW, backingH, 22)
            .fill({ color: 0x041c38, alpha: 0.55 })
            .stroke({ color: 0x00d4ff, width: 2.5, alpha: 0.35 });

        gridView.x = -gridWidth / 2;
        gridView.y = -gridHeight / 2;
        frame.x = 0;
        frame.y = 0;
        frame.width = totalSlotW;
        frame.height = totalSlotH;

        const buyMarginLeft = Math.max(30, sw * 0.025);
        buyBonusBaseScale = Math.min((availableH * 0.42) / frameHeight, (sw * 0.22) / frameWidth, 1.35);
        buyBonusBaseScale = Math.max(buyBonusBaseScale, 0.95);

        buyBonusContainer.scale.set(buyBonusBaseScale);
        buyBonusContainer.x = buyMarginLeft + (frameWidth * buyBonusBaseScale) / 2;
        buyBonusContainer.y = availableH / 2;

        const buyRightEdge = buyBonusContainer.x + (frameWidth * buyBonusBaseScale) / 2;
        const slotMarginRight = Math.max(25, sw * 0.02);
        const slotStartX = buyRightEdge + 35;
        const availableSlotWidth = sw - slotMarginRight - slotStartX;

        const baseScaleY = (availableH * 0.96) / totalSlotH;
        const stretchX = 1.22;
        const baseScaleX = baseScaleY * stretchX;

        slotContainer.scale.set(baseScaleX, baseScaleY);
        slotContainer.x = slotStartX + availableSlotWidth / 2;
        slotContainer.y = availableH / 2;

        if (bigWinOverlay.visible) {
            bigWinBg.clear().rect(0, 0, sw, sh).fill({ color: 0x000000, alpha: 0.75 });
            const gDepthH = Math.min(sw * 0.18, 220);
            const gDepthV = Math.min(sh * 0.18, 170);
            glowLeft.width = gDepthH; glowLeft.height = sh;
            glowRight.x = sw - gDepthH; glowRight.width = gDepthH; glowRight.height = sh;
            glowTop.width = sw; glowTop.height = gDepthV;
            glowBottom.y = sh - gDepthV; glowBottom.width = sw; glowBottom.height = gDepthV;
            bigWinContent.x = sw / 2;
            bigWinContent.y = sh / 2;
        }
    };

    resizeAll();
    window.addEventListener('resize', resizeAll);

    await gridView.renderGrid(currentGridData);

    let isSpinning = false;

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

    // --- БОНУСНАЯ ИГРА ---
    const playFreeSpins = async (spinsCount: number) => {
        let totalBonusWin = 0;
        winTitle.text = 'BONUS WIN';

        // 1. Плавный виньеточный переход в сокровищницу (подложка активируется внутри перехода)
        await switchGameBackground(true);

        buyBtn.visible = false;
        bonusCounterText.visible = true;
        buyTitle.text = 'FREE SPINS';

        for (let i = 0; i < spinsCount; i++) {
            const currentSpinNum = i + 1;
            const remainingSpins = spinsCount - currentSpinNum;

            buyDesc.text = `SPIN ${currentSpinNum} OF ${spinsCount}`;
            buySub.text = `REMAINING SPINS`;
            bonusCounterText.text = `${remainingSpins}`;

            gsap.fromTo(bonusCounterText.scale, { x: 1.4, y: 1.4 }, { x: 1, y: 1, duration: 0.35, ease: 'back.out(2)' });

            await new Promise(res => setTimeout(res, 800));
            let currentSpinTumbleWin = 0;

            currentGridData = GridMath.generateInitialGrid(true);
            await gridView.renderGrid(currentGridData);

            while (true) {
                const wins = MatchLogic.findWins(currentGridData);
                if (wins.length === 0) break;

                const winAmounts = wins.map(win => win.count * 10 * currentBet);
                const stepSum = winAmounts.reduce((a, b) => a + b, 0);

                const prevTumble = currentSpinTumbleWin;
                currentSpinTumbleWin += stepSum;

                await animateWinValue(totalBonusWin + prevTumble, totalBonusWin + currentSpinTumbleWin, 0.3);

                const nextGridData = CascadeMath.applyCascades(currentGridData, wins);
                await gridView.playCascades(wins, nextGridData, winAmounts);
                currentGridData = nextGridData;
            }

            if (currentSpinTumbleWin > 0) {
                const multiSum = gridView.getActiveMultipliers();
                if (multiSum > 0) {
                    await gridView.highlightMultipliers();
                    winTitle.text = `BONUS WIN (x${multiSum})`;

                    const multipliedSpinWin = currentSpinTumbleWin * multiSum;
                    await animateWinValue(totalBonusWin + currentSpinTumbleWin, totalBonusWin + multipliedSpinWin, 0.7);
                    currentSpinTumbleWin = multipliedSpinWin;
                }
            }

            totalBonusWin += currentSpinTumbleWin;
            winValue.text = `$${totalBonusWin.toFixed(2)}`;
            winTitle.text = 'BONUS WIN';
        }

        // 2. ДЕМОНСТРАЦИЯ РЕЗУЛЬТАТОВ СТРОГО В БОНУСНОЙ ИГРЕ (до перехода назад)
        if (totalBonusWin > 0) {
            const isBig = totalBonusWin >= currentBet * 15;
            await showBigWinAnimation(
                totalBonusWin, 
                currentBet, 
                isBig ? undefined : 'TOTAL BONUS WIN!'
            );
        }

        // Небольшая пауза после закрытия окна перед возвратом
        await new Promise(res => setTimeout(res, 400));

        // 3. Плавный виньеточный переход обратно на обычный фон (подложка скрывается внутри)
        await switchGameBackground(false);

        balance += totalBonusWin;
        updateUI();
        winTitle.text = 'WIN';

        buyBtn.visible = true;
        bonusCounterText.visible = false;
        buyTitle.text = 'BUY FEATURE';
        buyDesc.text = '10 FREE SPINS';
        buySub.text = 'MULTIPLIERS UP TO 100x';
    };

    // --- ПОКУПКА БОНУСА (с гарантированным спином на 4 скаттера) ---
    buyBtn.on('pointerdown', async () => {
        if (isSpinning) return;
        const bonusCost = currentBet * 100;
        if (balance < bonusCost) {
            console.warn('Недостаточно средств!');
            return;
        }

        isSpinning = true;
        buyBtn.alpha = 0.5;
        balance -= bonusCost;
        updateUI();

        winTitle.text = 'WIN';
        winValue.text = '$0.00';

        currentGridData = generateGuaranteedScatterGrid(4);
        await gridView.renderGrid(currentGridData);

        const scatterPositions: { col: number; row: number }[] = [];
        for (let col = 0; col < currentGridData.length; col++) {
            for (let row = 0; row < currentGridData[col].length; row++) {
                if (currentGridData[col][row] === GameConfig.scatterId) {
                    scatterPositions.push({ col, row });
                }
            }
        }

        winTitle.text = 'SCATTERS!';
        winValue.text = `${scatterPositions.length} SCATTERS`;

        await gridView.highlightScatters(scatterPositions);
        await new Promise(res => setTimeout(res, 600));

        await playFreeSpins(10);

        isSpinning = false;
        buyBtn.alpha = 1.0;
    });

    // --- ОБЫЧНЫЙ СПИН ---
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

        winTitle.text = 'WIN';
        winValue.text = '$0.00';

        currentGridData = GridMath.generateInitialGrid(false);
        await gridView.renderGrid(currentGridData);

        let spinTumbleWin = 0;

        while (true) {
            const wins = MatchLogic.findWins(currentGridData);
            if (wins.length === 0) break;

            const winAmounts = wins.map(w => w.count * 5 * currentBet);
            const stepWin = winAmounts.reduce((a, b) => a + b, 0);

            const prevWin = spinTumbleWin;
            spinTumbleWin += stepWin;

            await animateWinValue(prevWin, spinTumbleWin, 0.3);

            const nextGridData = CascadeMath.applyCascades(currentGridData, wins);
            await gridView.playCascades(wins, nextGridData, winAmounts);
            currentGridData = nextGridData;
        }

        if (spinTumbleWin > 0) {
            const multiSum = gridView.getActiveMultipliers();
            if (multiSum > 0) {
                await gridView.highlightMultipliers();
                winTitle.text = `WIN (x${multiSum})`;

                const multipliedTotal = spinTumbleWin * multiSum;
                await animateWinValue(spinTumbleWin, multipliedTotal, 0.7);
                spinTumbleWin = multipliedTotal;
            }

            balance += spinTumbleWin;
            updateUI();

            if (spinTumbleWin >= currentBet * 15) {
                await showBigWinAnimation(spinTumbleWin, currentBet);
            }
        }

        // Естественное выпадение 4+ скаттеров
        const scatterPositions: { col: number; row: number }[] = [];
        for (let col = 0; col < currentGridData.length; col++) {
            for (let row = 0; row < currentGridData[col].length; row++) {
                if (currentGridData[col][row] === GameConfig.scatterId) {
                    scatterPositions.push({ col, row });
                }
            }
        }

        if (scatterPositions.length >= 4) {
            winTitle.text = 'SCATTERS!';
            winValue.text = `${scatterPositions.length} SCATTERS`;

            await gridView.highlightScatters(scatterPositions);
            await new Promise(res => setTimeout(res, 600));

            await playFreeSpins(10);
        }

        isSpinning = false;
        spinBtn.alpha = 1;
    });
}

bootstrap().catch(console.error);