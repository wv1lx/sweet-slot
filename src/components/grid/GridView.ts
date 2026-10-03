import { Container } from 'pixi.js';
import { SymbolView } from './SymbolView';
import { GameConfig } from '../../config/GameConfig';
import type { WinResult } from '../../logic/MatchLogic';
import gsap from 'gsap';

export class GridView extends Container {
    private symbols: SymbolView[][] = [];

    constructor() {
        super();
    }

    public async renderGrid(gridData: number[][]): Promise<void> {
        this.removeChildren();
        this.symbols = [];

        const { symbolSize, padding } = GameConfig.grid;
        const dropPromises: Promise<void>[] = [];

        for (let col = 0; col < gridData.length; col++) {
            const columnView: SymbolView[] = [];
            for (let row = 0; row < gridData[col].length; row++) {
                const symbolId = gridData[col][row];
                const symbolView = new SymbolView(symbolId);
                
                const targetX = col * (symbolSize + padding);
                const targetY = row * (symbolSize + padding);
                
                symbolView.x = targetX;
                symbolView.y = targetY - 600; 
                
                this.addChild(symbolView);
                columnView.push(symbolView);

                const promise = new Promise<void>((resolve) => {
                    gsap.to(symbolView, {
                        y: targetY,
                        duration: 1.3,
                        ease: 'elastic.out(1, 0.4)',
                        delay: col * 0.08 + row * 0.04,
                        onComplete: resolve
                    });
                });
                
                dropPromises.push(promise);
            }
            this.symbols.push(columnView);
        }

        await Promise.all(dropPromises);
    }

    // Новый метод для анимации каскадов
    public async playCascades(wins: WinResult[], nextGridData: number[][]): Promise<void> {
        const explodePromises: Promise<void>[] = [];

        // 1. Анимируем "взрыв" выигрышных символов
        wins.forEach(win => {
            win.positions.forEach(pos => {
                const symView = this.symbols[pos.col][pos.row];
                if (symView) {
                    const p = new Promise<void>(resolve => {
                        // Уменьшаем масштаб до 0
                        gsap.to(symView.scale, { 
                            x: 0, 
                            y: 0, 
                            duration: 0.3, 
                            ease: 'back.in(2)', 
                            onComplete: () => {
                                symView.destroy(); // Удаляем объект из памяти Pixi
                                resolve();
                            }
                        });
                    });
                    explodePromises.push(p);
                    // Помечаем ячейку как пустую
                    this.symbols[pos.col][pos.row] = null as any; 
                }
            });
        });

        // Ждем окончания всех взрывов
        await Promise.all(explodePromises);

        const { symbolSize, padding } = GameConfig.grid;
        const dropPromises: Promise<void>[] = [];
        const newSymbolsArray: SymbolView[][] = [];

        // 2. Сдвигаем старые символы вниз и генерируем новые сверху
        for (let col = 0; col < nextGridData.length; col++) {
            const newColView: SymbolView[] = [];
            // Фильтруем удаленные символы (оставляем только "живые")
            const oldColRemaining = this.symbols[col].filter(s => s !== null);

            for (let row = 0; row < nextGridData[col].length; row++) {
                const symbolId = nextGridData[col][row];
                const targetX = col * (symbolSize + padding);
                const targetY = row * (symbolSize + padding);

                // Количество новых символов в колонке
                const newCount = nextGridData[col].length - oldColRemaining.length;
                let symView: SymbolView;

                if (row < newCount) {
                    // Создаем новый падающий символ
                    symView = new SymbolView(symbolId);
                    symView.x = targetX;
                    symView.y = targetY - 600 - (newCount - row) * 100;
                    this.addChild(symView);
                } else {
                    // Берем существующий символ, который избежал взрыва
                    symView = oldColRemaining[row - newCount];
                }

                newColView.push(symView);

                // Запускаем падение до новой целевой позиции Y
                if (symView.y !== targetY) {
                    const p = new Promise<void>(resolve => {
                        gsap.to(symView, { 
                            y: targetY, 
                            duration: 0.4, 
                            ease: 'bounce.out', 
                            onComplete: resolve 
                        });
                    });
                    dropPromises.push(p);
                }
            }
            newSymbolsArray.push(newColView);
        }

        // Обновляем матрицу визуальных символов
        this.symbols = newSymbolsArray;
        
        // Ждем, пока упадут все новые и сдвинутые символы
        await Promise.all(dropPromises);
    }
}