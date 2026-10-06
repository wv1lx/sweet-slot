import { Container, Graphics } from 'pixi.js';
import { SymbolView } from './SymbolView';
import { GameConfig } from '../../config/GameConfig';
import type { WinResult } from '../../logic/MatchLogic';
import gsap from 'gsap';

export class GridView extends Container {
    private symbols: SymbolView[][] = [];
    private symbolsContainer: Container;

    constructor() {
        super();

        this.symbolsContainer = new Container();
        this.addChild(this.symbolsContainer);

        const { columns, rows, symbolSize, padding } = GameConfig.grid;
        const gridWidth = columns * symbolSize + (columns - 1) * padding;
        const gridHeight = rows * symbolSize + (rows - 1) * padding;

        const mask = new Graphics()
            .rect(0, 0, gridWidth, gridHeight)
            .fill(0xffffff); 
        
        this.addChild(mask);
        this.symbolsContainer.mask = mask;
    }

    public async renderGrid(gridData: number[][]): Promise<void> {
        this.symbolsContainer.removeChildren();
        this.symbols = [];

        const { symbolSize, padding, rows } = GameConfig.grid;
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
                
                this.symbolsContainer.addChild(symbolView);
                columnView.push(symbolView);

                const invertedRow = rows - 1 - row;

                const promise = new Promise<void>((resolve) => {
                    gsap.to(symbolView, {
                        y: targetY,
                        duration: 1.3, 
                        ease: 'elastic.out(1, 0.4)', 
                        delay: col * 0.08 + invertedRow * 0.06, 
                        onComplete: resolve
                    });
                });
                
                dropPromises.push(promise);
            }
            this.symbols.push(columnView);
        }

        await Promise.all(dropPromises);
    }

    public async playCascades(wins: WinResult[], nextGridData: number[][]): Promise<void> {
        const explodePromises: Promise<void>[] = [];

        wins.forEach(win => {
            win.positions.forEach(pos => {
                const symView = this.symbols[pos.col][pos.row];
                if (symView) {
                    const p = new Promise<void>(resolve => {
                        gsap.to(symView.scale, { 
                            x: 0, 
                            y: 0, 
                            duration: 0.3, 
                            ease: 'back.in(2)', 
                            onComplete: () => {
                                symView.destroy();
                                resolve();
                            }
                        });
                    });
                    explodePromises.push(p);
                    this.symbols[pos.col][pos.row] = null as any; 
                }
            });
        });

        await Promise.all(explodePromises);

        const { symbolSize, padding, rows } = GameConfig.grid;
        const dropPromises: Promise<void>[] = [];
        const newSymbolsArray: SymbolView[][] = [];

        for (let col = 0; col < nextGridData.length; col++) {
            const newColView: SymbolView[] = [];
            const oldColRemaining = this.symbols[col].filter(s => s !== null);

            for (let row = 0; row < nextGridData[col].length; row++) {
                const symbolId = nextGridData[col][row];
                const targetX = col * (symbolSize + padding);
                const targetY = row * (symbolSize + padding);

                const newCount = nextGridData[col].length - oldColRemaining.length;
                let symView: SymbolView;

                if (row < newCount) {
                    symView = new SymbolView(symbolId);
                    symView.x = targetX;
                    symView.y = -(newCount - row) * (symbolSize + padding);
                    this.symbolsContainer.addChild(symView);
                } else {
                    symView = oldColRemaining[row - newCount];
                }

                newColView.push(symView);

                if (symView.y !== targetY) {
                    const invertedRow = rows - 1 - row;
                    
                    const distance = Math.abs(targetY - symView.y);
                    const duration = Math.max(0.4, distance * 0.0008); 

                    const p = new Promise<void>(resolve => {
                        gsap.to(symView, { 
                            y: targetY, 
                            duration: duration, 
                            delay: invertedRow * 0.05, 
                            ease: 'elastic.out(1, 0.4)', 
                            onComplete: resolve 
                        });
                    });
                    dropPromises.push(p);
                }
            }
            newSymbolsArray.push(newColView);
        }

        this.symbols = newSymbolsArray;
        await Promise.all(dropPromises);
    }
}