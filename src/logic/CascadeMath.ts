import { GameConfig } from '../config/GameConfig';
import type { WinResult } from './MatchLogic';

export class CascadeMath {
    public static applyCascades(grid: number[][], wins: WinResult[]): number[][] {
        // 1. Делаем поверхностную копию сетки
        const newGrid = grid.map(col => [...col]);

        // 2. Помечаем выигрышные ячейки как -1 (пустота)
        wins.forEach(win => {
            win.positions.forEach(pos => {
                newGrid[pos.col][pos.row] = -1;
            });
        });

        const availableSymbols = GameConfig.symbols.types;

        // 3. Сдвигаем оставшиеся символы вниз и генерируем новые сверху
        for (let col = 0; col < newGrid.length; col++) {
            // Отфильтровываем удаленные символы (оставляем только "живые")
            const remainingSymbols = newGrid[col].filter(sym => sym !== -1);
            
            // Считаем, сколько новых символов нужно сгенерировать
            const missingCount = GameConfig.grid.rows - remainingSymbols.length;

            const newSymbols: number[] = [];
            for (let i = 0; i < missingCount; i++) {
                const randomIdx = Math.floor(Math.random() * availableSymbols.length);
                newSymbols.push(availableSymbols[randomIdx]);
            }

            // Формируем новую колонку: новые символы падают сверху (в начало массива), старые остаются внизу
            newGrid[col] = [...newSymbols, ...remainingSymbols];
        }

        return newGrid;
    }
}