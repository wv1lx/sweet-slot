import './style.css';
import { Sprite, Texture, Container } from 'pixi.js';
import { game } from './core/Game';
import { AssetLoader } from './core/AssetLoader';
import { GridMath } from './logic/GridMath';
import { MatchLogic } from './logic/MatchLogic';
import { CascadeMath } from './logic/CascadeMath';
import { GridView } from './components/grid/GridView';
import { SpinButton } from './components/ui/SpinButton';
import { GameConfig } from './config/GameConfig';

async function bootstrap() {
    await game.init(document.body);
    await AssetLoader.loadAll();

    // 1. Фон (отвязан от слота, живет своей жизнью)
    const bg = new Sprite(Texture.from('bg'));
    bg.anchor.set(0.5); 
    bg.tint = 0xffffff;
    game.app.stage.addChildAt(bg, 0);

    // 2. Создаем главный контейнер для всего слота
    const slotContainer = new Container();
    game.app.stage.addChild(slotContainer);

    // Добавляем все элементы ВНУТРЬ контейнера
    const gridView = new GridView();
    let currentGridData = GridMath.generateInitialGrid();
    slotContainer.addChild(gridView);

    const frame = new Sprite(Texture.from('frame'));
    frame.anchor.set(0.5);
    slotContainer.addChild(frame);

    const spinBtn = new SpinButton();
    slotContainer.addChild(spinBtn);

    // 3. Идеальная адаптивность
    const resizeAll = () => {
        const sw = game.app.screen.width;
        const sh = game.app.screen.height;

        // Растягиваем фон
        bg.x = sw / 2;
        bg.y = sh / 2;
        const bgScaleX = sw / bg.texture.width;
        const bgScaleY = sh / bg.texture.height;
        bg.scale.set(Math.max(bgScaleX, bgScaleY)); 

        // === ШАГ А: СОБИРАЕМ СЛОТ В ОРИГИНАЛЬНОМ РАЗМЕРЕ ===
        const { columns, rows, symbolSize, padding } = GameConfig.grid;
        const gridWidth = columns * symbolSize + (columns - 1) * padding;
        const gridHeight = rows * symbolSize + (rows - 1) * padding;

        // Толщина твоей новой простой рамки[cite: 10]
        const frameThicknessX = 200; 
        const frameThicknessY = 220; 

        gridView.x = 0;
        gridView.y = 0;

        frame.x = gridWidth / 2;
        frame.y = gridHeight / 2;
        frame.width = gridWidth + frameThicknessX;
        frame.height = gridHeight + frameThicknessY;

        spinBtn.x = (gridWidth - spinBtn.width) / 2;
        spinBtn.y = frame.y + (frame.height / 2) + 30;

        // === ШАГ Б: МАСШТАБИРУЕМ ВЕСЬ КОНТЕЙНЕР ПОД ЭКРАН ===
        const slotTotalWidth = frame.width;
        const slotTotalHeight = spinBtn.y + spinBtn.height - (frame.y - frame.height / 2);

        // Гарантируем, что слот занимает максимум 95% экрана, чтобы кнопка никогда не обрезалась
        const scaleX = (sw * 0.95) / slotTotalWidth;
        const scaleY = (sh * 0.95) / slotTotalHeight;
        const safeScale = Math.min(scaleX, scaleY, 1); 

        slotContainer.scale.set(safeScale);

        // Центрируем масштабированный контейнер ровно посередине окна
        const contentLeft = -frameThicknessX / 2;
        const contentTop = -frameThicknessY / 2;

        slotContainer.x = (sw - slotTotalWidth * safeScale) / 2 - (contentLeft * safeScale);
        slotContainer.y = (sh - slotTotalHeight * safeScale) / 2 - (contentTop * safeScale);
    };
    
    resizeAll();
    window.addEventListener('resize', resizeAll);

    await gridView.renderGrid(currentGridData);

    let isSpinning = false;
    spinBtn.setAction(async () => {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.alpha = 0.5;

        currentGridData = GridMath.generateInitialGrid();
        await gridView.renderGrid(currentGridData);

        while (true) {
            const wins = MatchLogic.findWins(currentGridData);
            if (wins.length === 0) break;

            const nextGridData = CascadeMath.applyCascades(currentGridData, wins);
            await gridView.playCascades(wins, nextGridData);
            currentGridData = nextGridData;
        }

        isSpinning = false;
        spinBtn.alpha = 1;
    });
}

bootstrap().catch(console.error);