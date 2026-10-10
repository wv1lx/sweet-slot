import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { SymbolView } from './SymbolView';
import { GameConfig } from '../../config/GameConfig';
import type { WinResult } from '../../logic/MatchLogic';
import gsap from 'gsap';

export class GridView extends Container {
    private symbols: SymbolView[][] = [];
    private symbolsContainer: Container;
    private effectsContainer: Container;

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

        this.effectsContainer = new Container();
        this.addChild(this.effectsContainer);
    }

    public async renderGrid(gridData: number[][]): Promise<void> {
        this.symbolsContainer.removeChildren();
        this.effectsContainer.removeChildren();
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

    public async playCascades(
        wins: WinResult[], 
        nextGridData: number[][], 
        winAmounts: number[] = []
    ): Promise<void> {
        const { symbolSize, padding, rows } = GameConfig.grid;

        // 1. Замедление и подсветка сыгравших символов с показом суммы
        const highlightPromises: Promise<void>[] = [];

        wins.forEach((win, index) => {
            let sumX = 0;
            let sumY = 0;
            let count = 0;

            win.positions.forEach(pos => {
                const symView = this.symbols[pos.col]?.[pos.row];
                if (symView) {
                    sumX += symView.x;
                    sumY += symView.y;
                    count++;

                    const p = new Promise<void>(resolve => {
                        gsap.to(symView.scale, {
                            x: 1.16,
                            y: 1.16,
                            duration: 0.38,
                            yoyo: true,
                            repeat: 1,
                            ease: 'power1.inOut',
                            onComplete: () => {
                                symView.scale.set(1);
                                resolve();
                            }
                        });
                    });
                    highlightPromises.push(p);
                }
            });

            const amount = winAmounts[index] || 0;
            if (amount > 0 && count > 0) {
                const centerX = (sumX / count) + symbolSize / 2;
                const centerY = (sumY / count) + symbolSize / 2;
                this.spawnWinText(centerX, centerY, amount);
            }
        });

        await Promise.all(highlightPromises);
        await new Promise(res => setTimeout(res, 450));

        // 2. Взрыв сыгравших символов
        const explodePromises: Promise<void>[] = [];

        wins.forEach(win => {
            win.positions.forEach(pos => {
                const symView = this.symbols[pos.col]?.[pos.row];
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
        await new Promise(res => setTimeout(res, 120));

        // 3. Каскадное падение новых и оставшихся символов
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

    private spawnWinText(x: number, y: number, amount: number): void {
        const textStyle = new TextStyle({
            fontFamily: 'Changa One',
            fontSize: 28,
            fill: 0xffea00,
            stroke: { color: 0x000000, width: 4.5 }
        });

        const winLabel = new Text({
            text: `+$${amount.toFixed(2)}`,
            style: textStyle
        });

        winLabel.anchor.set(0.5, 0.5);
        winLabel.x = x;
        winLabel.y = y;
        winLabel.scale.set(0.4);
        winLabel.alpha = 0;
        this.effectsContainer.addChild(winLabel);

        gsap.timeline()
            .to(winLabel, {
                alpha: 1,
                y: y - 22,
                scale: 1.15,
                duration: 0.35,
                ease: 'back.out(2)'
            })
            .to(winLabel, {
                y: y - 48,
                alpha: 0,
                duration: 0.45,
                delay: 0.5,
                ease: 'power1.in',
                onComplete: () => winLabel.destroy()
            });
    }

    public async highlightScatters(positions: { col: number; row: number }[]): Promise<void> {
        const promises: Promise<void>[] = [];

        positions.forEach(pos => {
            const sym = this.symbols[pos.col]?.[pos.row];
            if (sym) {
                const p = new Promise<void>(resolve => {
                    gsap.timeline({ onComplete: resolve })
                        .to(sym.scale, { x: 1.25, y: 1.25, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' })
                        .to(sym.scale, { x: 1, y: 1, duration: 0.15 });
                });
                promises.push(p);
            }
        });

        await Promise.all(promises);
    }

    // Анимация сундуков при срабатывании умножения
    public async highlightMultipliers(): Promise<void> {
        const promises: Promise<void>[] = [];

        for (let col = 0; col < this.symbols.length; col++) {
            for (let row = 0; row < this.symbols[col].length; row++) {
                const symView = this.symbols[col][row];
                if (symView && symView.symbolId === GameConfig.multiplierId) {
                    const p = new Promise<void>(resolve => {
                        gsap.timeline({ onComplete: resolve })
                            .to(symView.scale, { x: 1.35, y: 1.35, duration: 0.3, yoyo: true, repeat: 2, ease: 'sine.inOut' })
                            .to(symView.scale, { x: 1, y: 1, duration: 0.15 });
                    });
                    promises.push(p);
                }
            }
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }

    // Подсчет суммы всех видимых на поле множителей
    public getActiveMultipliers(): number {
        let totalMulti = 0;
        for (let col = 0; col < this.symbols.length; col++) {
            for (let row = 0; row < this.symbols[col].length; row++) {
                const symView = this.symbols[col][row];
                if (symView && symView.symbolId === GameConfig.multiplierId) {
                    const val = (symView as any).multiValue || (symView as any).value || 2;
                    totalMulti += val;
                }
            }
        }
        return totalMulti;
    }
}