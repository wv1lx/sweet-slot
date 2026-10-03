export interface WinResult {
    symbolId: number;
    count: number;
    positions: { col: number; row: number }[];
}

export class MatchLogic {
    public static findWins(grid: number[][]): WinResult[] {
        const symbolMap = new Map<number, { col: number; row: number }[]>();

        for (let col = 0; col < grid.length; col++) {
            for (let row = 0; row < grid[col].length; row++) {
                const sym = grid[col][row];
                if (!symbolMap.has(sym)) {
                    symbolMap.set(sym, []);
                }
                symbolMap.get(sym)!.push({ col, row });
            }
        }

        const wins: WinResult[] = [];
        
        symbolMap.forEach((positions, symbolId) => {
            if (symbolId !== 10 && symbolId !== 11 && positions.length >= 8) {
                wins.push({ symbolId, count: positions.length, positions });
            }
            if (symbolId === 10 && positions.length >= 4) {
                wins.push({ symbolId, count: positions.length, positions });
            }
        });

        return wins;
    }
}