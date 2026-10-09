import { GameConfig } from '../config/GameConfig';

export interface WinResult {
    symbolId: number;
    positions: { col: number, row: number }[];
    count: number;
}

export class MatchLogic {
    public static findWins(grid: number[][]): WinResult[] {
        const counts: Record<number, { col: number, row: number }[]> = {};

        for (let col = 0; col < grid.length; col++) {
            for (let row = 0; row < grid[col].length; row++) {
                const id = grid[col][row];
                
                if (id === GameConfig.scatterId || id === GameConfig.multiplierId) {
                    continue; 
                }

                if (!counts[id]) counts[id] = [];
                counts[id].push({ col, row });
            }
        }

        const wins: WinResult[] = [];
        for (const id in counts) {
            if (counts[id].length >= 8) { 
                wins.push({
                    symbolId: parseInt(id),
                    positions: counts[id],
                    count: counts[id].length
                });
            }
        }

        return wins;
    }
}