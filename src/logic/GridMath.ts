import { GameConfig } from '../config/GameConfig';

export class GridMath {
    // Количество базовых символов (ID от 0 до 9)
    private static readonly REGULAR_SYMBOLS_COUNT = 10;

    // --- НАСТРОЙКИ ВЕРОЯТНОСТЕЙ ---
    // Шанс выпадения скаттера на каждую ячейку (для сетки 6x5 дает адекватный триггер 4+ скаттеров)
    private static readonly SCATTER_CHANCE = 0.025; // 2.5%

    // Шанс выпадения множителя (ID 11):
    // В бонусной игре снижен до 3.5% (ранее было 10-15%), чтобы иксовки были редкими и ценными
    private static readonly MULTIPLIER_CHANCE_BONUS = 0.035; // 3.5% в фриспинах
    private static readonly MULTIPLIER_CHANCE_BASE = 0.005;  // 0.5% в обычном спине

    /**
     * Генерация начальной матрицы 6x5 (по колонкам)
     * @param isBonus Флаг бонусной игры (по умолчанию false)
     */
    public static generateInitialGrid(isBonus: boolean = false): number[][] {
        const { columns, rows } = GameConfig.grid;
        const grid: number[][] = [];

        for (let col = 0; col < columns; col++) {
            const column: number[] = [];
            for (let row = 0; row < rows; row++) {
                column.push(this.getRandomSymbol(isBonus));
            }
            grid.push(column);
        }

        return grid;
    }

    /**
     * Получение случайного символа с учетом шансов специальных иконок
     */
    public static getRandomSymbol(isBonus: boolean = false): number {
        const roll = Math.random();

        // 1. Проверка выпадения множителя (сундука)
        const multiChance = isBonus ? this.MULTIPLIER_CHANCE_BONUS : this.MULTIPLIER_CHANCE_BASE;
        if (roll < multiChance) {
            return GameConfig.multiplierId; // 11
        }

        // 2. Проверка выпадения скаттера (в фриспинах скаттеры тоже могут выпадать для ретриггера)
        if (roll < multiChance + this.SCATTER_CHANCE) {
            return GameConfig.scatterId; // 10
        }

        // 3. Обычный символ (от 0 до 9)
        return this.getRandomRegularSymbol();
    }

    /**
     * Случайный обычный символ без скаттеров и множителей
     */
    public static getRandomRegularSymbol(): number {
        return Math.floor(Math.random() * this.REGULAR_SYMBOLS_COUNT);
    }
}