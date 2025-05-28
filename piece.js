// piece.js

class Piece {
    constructor(ctx) {
        this.ctx = ctx;
        this.spawn();
    }

    // ★修正：一定確率でボムを生成するロジックを追加
    spawn() {
        // ボムを生成するか判定
        if (Math.random() < BOMB_CHANCE) {
            this.typeId = BOMB_ID;
        } else {
            // ★修正：通常ミノの抽選からボムとオジャマを確実に除外する
            // 抽選対象は7種類 (1から7)
            const tetrominoTypeCount = SHAPES.length - 1 - 2; // 全体 - 空 - ボム - オジャマ
            this.typeId = this.randomizeTetrominoType(tetrominoTypeCount);
        }
        
        this.shape = SHAPES[this.typeId];
        this.color = COLORS[this.typeId];
        this.x = 3;
        this.y = 0;
    }

    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes + 1);
    }
    
    // ★修正：共通の描画関数を呼び出すように変更
    draw(timer) {
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    // ★修正：drawBlockにtimerを渡す
                    drawBlock(this.ctx, this.x + x, this.y + y, this.color, value, timer);
                }
            });
        });
    }
    
    rotate() {
        // ★追加：ボムは回転しない
        if (this.typeId === BOMB_ID) {
            return;
        }
        const newShape = JSON.parse(JSON.stringify(this.shape));
        for (let y = 0; y < newShape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [newShape[x][y], newShape[y][x]] = [newShape[y][x], newShape[x][y]];
            }
        }
        newShape.forEach(row => row.reverse());
        this.shape = newShape;
    }
}