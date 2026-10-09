export const GameConfig = {
    symbolses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 
    scatterId: 10,   // Золотая рыбка
    multiplierId: 11, // Сундук-множитель
    grid: {
        columns: 6,
        rows: 5,
        symbolSize: 100,
        padding: 25
    },
    symbols: {
        // Добавили 10 и 11 в общий пул типов, чтобы генератор задействовал их наравне с остальными
        types: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        scatterId: 10,
        multiplierId: 11
    }
};