// piece.js

class Piece {
    constructor(ctx) {
        this.ctx = ctx;
        this.isColorEater = false;
        this.spawn();
    }

    spawn() {
        this.isColorEater = false; // スポーン時にフラグをリセット

        const rand = Math.random();
        // 通常ミノの種類数 (例: I,J,L,O,S,T,Z の7種類)
        // SHAPES.length は、空、通常ミノ7種、ボム、おじゃまを含めた全体の長さ
        // ここでは「通常ミノが何種類あるか」を計算
        const normalTetrominoTypeCount = SHAPES.length - 1 - 2; // 全体(10) - 空(1) - ボム(1) - おじゃま(1) = 7
                                                               // ※SHAPES[0]が空、SHAPES[BOMB_ID]がボム、SHAPES[GARBAGE_ID]がおじゃま
                                                               // もしSHAPES[GARBAGE_ID]がミノ形状を持たないなら、-2で正しい。
                                                               // 現在のSHAPES[9]は[]なので、実質的な特殊形状はボムのみ。
                                                               // SHAPES.length - 1(空) - 1(ボムIDの形状) - 1(おじゃまIDの形状は無いが、IDとしては存在する) = 7

        if (rand < COLOR_EATER_CHANCE) {
            // カラーイーターを生成
            this.isColorEater = true;
            // 食べる色を通常ミノの色 (ID: 1～7) からランダムに決定
            this.typeId = this.randomizeTetrominoType(normalTetrominoTypeCount);
            this.shape = [[1]]; // ★重要：カラーイーターは必ず1x1の形状
            this.color = COLORS[this.typeId];
        } else if (rand < COLOR_EATER_CHANCE + BOMB_CHANCE) {
            // ボムを生成
            this.typeId = BOMB_ID;
            this.shape = SHAPES[this.typeId]; // ボムの形状 (例: SHAPES[8] は [[8]])
            this.color = COLORS[this.typeId];
        } else {
            // 通常のテトリミノを生成
            this.typeId = this.randomizeTetrominoType(normalTetrominoTypeCount);
            this.shape = SHAPES[this.typeId]; // 通常ミノの形状 (例: SHAPES[1]～SHAPES[7])
            this.color = COLORS[this.typeId];
        }
        
        // ブロックを中央上部に配置
        // this.shape[0].length は、ミノの幅を取得
        this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }

    // 1 から noOfTypes までのランダムな整数を返すヘルパー関数
    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes) + 1;
    }
    
    // ★ drawメソッドも、前回の修正が正しく反映されているかご確認ください ★
    draw(timer) {
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    // typeId を渡す (これがカラーイーターの「食べる色」にもなる)
                    drawBlock(this.ctx, this.x + x, this.y + y, this.color, this.typeId, timer, this.isColorEater);
                }
            });
        });
    }
    
    rotate() {
        if (this.typeId === BOMB_ID || this.isColorEater) {
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