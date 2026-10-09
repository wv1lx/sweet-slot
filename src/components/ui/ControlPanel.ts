import { Container, Sprite, Texture, Text, TextStyle, Graphics } from 'pixi.js';

export class ControlPanel extends Container {
    private balanceText: Text;
    private betText: Text;
    private winText: Text;
    
    public spinButton: Sprite;
    public plusButton: Sprite;
    public minusButton: Sprite;
    public autoButton: Sprite;
    public infoButton: Sprite;
    public settingsButton: Sprite;

    constructor(screenWidth: number, screenHeight: number) {
        super();

        const panelHeight = 90;
        const panelY = screenHeight - panelHeight;

        // 1. Полупрозрачная темная подложка панели
        const bg = new Graphics()
            .rect(0, 0, screenWidth, panelHeight)
            .fill({ color: 0x000000, alpha: 0.85 });
        this.addChild(bg);
        
        this.y = panelY;

        // 2. Стили текстов (аккуратный минимализм)
        const labelStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 13,
            fontWeight: 'bold',
            fill: 0xffd700
        });

        const valueStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fontWeight: 'bold',
            fill: 0xffffff
        });

        const winLabelStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 15,
            fontWeight: 'bold',
            fill: 0xffd700
        });

        const winValueStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 26,
            fontWeight: 'bold',
            fill: 0xffffff
        });

        // Левый блок: Настройки, Инфо, Баланс и Ставка
        this.settingsButton = this.createButton('settings', 25, panelHeight / 2 - 20, 40, 40);
        this.infoButton = this.createButton('info', 75, panelHeight / 2 - 20, 40, 40);

        const creditLabel = new Text({ text: 'CREDIT', style: labelStyle });
        creditLabel.x = 135;
        creditLabel.y = 22;
        this.addChild(creditLabel);

        this.balanceText = new Text({ text: '$10,000.00', style: valueStyle });
        this.balanceText.x = 135;
        this.balanceText.y = 42;
        this.addChild(this.balanceText);

        const betLabel = new Text({ text: 'BET', style: labelStyle });
        betLabel.x = 280;
        betLabel.y = 22;
        this.addChild(betLabel);

        this.betText = new Text({ text: '$1.00', style: valueStyle });
        this.betText.x = 280;
        this.betText.y = 42;
        this.addChild(this.betText);

        // Центральный блок: Выигрыш (WIN)
        const winContainer = new Container();
        winContainer.x = screenWidth / 2 - 120;
        winContainer.y = 15;

        const winLabel = new Text({ text: 'WIN', style: winLabelStyle });
        winLabel.anchor.set(0.5, 0);
        winLabel.x = 120;
        winLabel.y = 0;
        winContainer.addChild(winLabel);

        this.winText = new Text({ text: '$0.00', style: winValueStyle });
        this.winText.anchor.set(0.5, 0);
        this.winText.x = 120;
        this.winText.y = 22;
        winContainer.addChild(this.winText);

        this.addChild(winContainer);

        // Правый блок: Минус, Спин, Плюс, Авто
        const rightStartX = screenWidth - 310;

        this.minusButton = this.createButton('minus', rightStartX, panelHeight / 2 - 22, 45, 45);
        this.spinButton = this.createButton('spin', rightStartX + 60, panelHeight / 2 - 32, 65, 65);
        this.plusButton = this.createButton('plus', rightStartX + 140, panelHeight / 2 - 22, 45, 45);
        this.autoButton = this.createButton('auto', rightStartX + 200, panelHeight / 2 - 22, 45, 45);
    }

    private createButton(textureName: string, x: number, y: number, width: number, height: number): Sprite {
        const sprite = new Sprite(Texture.from(textureName));
        sprite.x = x;
        sprite.y = y;
        sprite.width = width;
        sprite.height = height;
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';

        // Интерактив при нажатии (легкое уменьшение)
        sprite.on('pointerdown', () => sprite.scale.set(0.92));
        sprite.on('pointerup', () => sprite.scale.set(1.0));
        sprite.on('pointerupoutside', () => sprite.scale.set(1.0));

        this.addChild(sprite);
        return sprite;
    }

    public updateBalance(balance: number): void {
        this.balanceText.text = `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    public updateBet(bet: number): void {
        this.betText.text = `$${bet.toFixed(2)}`;
    }

    public updateWin(win: number): void {
        this.winText.text = `$${win.toFixed(2)}`;
    }
}