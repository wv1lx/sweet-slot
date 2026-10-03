import { GameConfig } from '../config/GameConfig';

export class GridMath {
    public static generateInitialGrid(): number[][] {
        const grid: number[][] = [];
        const { columns, rows } = GameConfig.grid;
        const availableSymbols = GameConfig.symbols.types;

        for (let col = 0; col < columns; col++) {
            const column: number[] = [];
            for (let row = 0; row < rows; row++) {
                const randomIdx = Math.floor(Math.random() * availableSymbols.length);
                column.push(availableSymbols[randomIdx]);
            }
            grid.push(column);
        }

        return grid;
    }
}