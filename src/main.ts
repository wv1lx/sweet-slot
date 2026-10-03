import { game } from './core/Game';
import { GridMath } from './logic/GridMath';
import { MatchLogic } from './logic/MatchLogic';
import { CascadeMath } from './logic/CascadeMath'; // Добавили импорт
import { GridView } from './components/grid/GridView';
import { SpinButton } from './components/ui/SpinButton';
import { GameConfig } from './config/GameConfig';

async function bootstrap() {
    await game.init(document.body);

    const gridView = new GridView();
    let currentGridData = GridMath.generateInitialGrid();
    
    const { columns, rows, symbolSize, padding } = GameConfig.grid;
    const gridWidth = columns * symbolSize + (columns - 1) * padding;
    const gridHeight = rows * symbolSize + (rows - 1) * padding;

    gridView.x = (game.width - gridWidth) / 2;
    gridView.y = (game.height - gridHeight) / 2 - 50;

    game.app.stage.addChild(gridView);
    await gridView.renderGrid(currentGridData);

    const spinBtn = new SpinButton();
    spinBtn.x = (game.width - spinBtn.width) / 2;
    spinBtn.y = gridView.y + gridHeight + 40;
    
    game.app.stage.addChild(spinBtn);

    let isSpinning = false;

    spinBtn.setAction(async () => {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.alpha = 0.5;

        // 1. Первичный спин
        currentGridData = GridMath.generateInitialGrid();
        await gridView.renderGrid(currentGridData);

        // 2. Цикл каскадов
        while (true) {
            const wins = MatchLogic.findWins(currentGridData);
            
            // Если выигрышей нет - прерываем цикл каскадов
            if (wins.length === 0) {
                break;
            }

            console.log('🔥 ВЗРЫВ!', wins);

            // 3. Рассчитываем новую математическую матрицу после падения
            const nextGridData = CascadeMath.applyCascades(currentGridData, wins);
            
            // 4. Проигрываем анимации: взрывы старых и падения новых
            await gridView.playCascades(wins, nextGridData);
            
            // 5. Записываем новую матрицу как текущую для следующей итерации цикла
            currentGridData = nextGridData;
        }

        isSpinning = false;
        spinBtn.alpha = 1;
    });
}

bootstrap().catch(console.error);