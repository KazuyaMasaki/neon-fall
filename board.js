// board.js

class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.grid = this.getEmptyBoard();
    }

    getEmptyBoard() {
        return Array.from(
            { length: ROWS }, () => Array(COLS).fill(0)
        );
    }

    // ★修正：共通の描画関数を呼び出すように変更
    draw(timer) {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    // ★修正：drawBlockにtimerを渡す
                    drawBlock(this.ctx, x, y, COLORS[value], value, timer);
                }
            });
        });
    }

    isValid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                if (value > 0) {
                    let x = p.x + dx;
                    let y = p.y + dy;
                    if (y < 0) return true; // ★修正: 回転時に画面上部にはみ出すのを許容
                    return (
                        this.grid[y] && this.grid[y][x] === 0 &&
                        x >= 0 && x < COLS &&
                        y < ROWS
                    );
                }
                return true;
            });
        });
    }

    freeze(p) {
        p.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value > 0) {
                    // ★修正：盤面の上にはみ出した部分は固定しない
                    if (p.y + dy >= 0) {
                        this.grid[p.y + dy][p.x + dx] = value;
                    }
                }
            });
        });
    }

    // ★修正：消した行のY座標の配列を返すようにする
    clearLines() {
        const clearedRows = []; // 消した行のY座標を格納する配列

        this.grid.forEach((row, y) => {
            // 全てのセルが埋まっていたら
            if (row.every(value => value > 0)) {
                clearedRows.push(y); // 消した行のY座標を記録
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(0));
            }
        });
        
        // 消した行のY座標の配列を返す (例: [17, 16])
        // 何も消さなければ空の配列 [] が返る
        return clearedRows;
    }

    // ★修正：消したブロック数を返すように変更
    explode(x, y) {
        const radius = 1; // 3x3の範囲
        let destroyedCount = 0; // ★追加：消したブロックを数えるカウンター

        // 爆発範囲のブロックを消す
        for (let row = y - radius; row <= y + radius; row++) {
            for (let col = x - radius; col <= x + radius; col++) {
                // フィールドの範囲内かチェック
                if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
                    // ★追加：元々ブロックがあった場合のみカウント
                    if (this.grid[row][col] > 0) {
                        destroyedCount++;
                    }
                    this.grid[row][col] = 0;
                }
            }
        }
        
        // ★追加：消したブロックの数を返す
        return destroyedCount;
    }

    // ★追加：おじゃまブロックのラインを生成し、せり上がらせるメソッド
    addGarbageLine() {
        // 新しいおじゃまラインを作成（全ておじゃまブロックで埋める）
        const garbageLine = Array(COLS).fill(GARBAGE_ID);
        
        // ランダムな位置に1つだけ穴をあける
        const holePosition = Math.floor(Math.random() * COLS);
        garbageLine[holePosition] = 0;

        // 一番上の行を削除
        this.grid.shift();
        // 一番下の行に新しいおじゃまラインを追加
        this.grid.push(garbageLine);
    }

    eatConnectedBlocks(eaterX, eaterY, targetColorId) {
        let eatenCount = 0;
        const queue = [];
        const visited = Array.from(
            { length: ROWS }, () => Array(COLS).fill(false)
        );
        const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

        // カラーイーターの周囲4マスを最初の探索キューに入れる
        for (const [dx, dy] of directions) {
            const startX = eaterX + dx;
            const startY = eaterY + dy;

            if (
                startX >= 0 && startX < COLS &&
                startY >= 0 && startY < ROWS &&
                this.grid[startY][startX] === targetColorId && // 最初から色が一致しているか
                !visited[startY][startX]
            ) {
                queue.push([startX, startY]);
                visited[startY][startX] = true; // 最初にキューに入れるものも訪問済みに
            }
        }
        
        let head = 0;
        while(head < queue.length) {
            const [currentX, currentY] = queue[head++];

            // 現在のブロックを食べる
            if (this.grid[currentY][currentX] === targetColorId) { //念のため再確認
                this.grid[currentY][currentX] = 0;
                eatenCount++;
            }

            for (const [dx, dy] of directions) {
                const nextX = currentX + dx;
                const nextY = currentY + dy;

                if (
                    nextX >= 0 && nextX < COLS &&
                    nextY >= 0 && nextY < ROWS &&
                    !visited[nextY][nextX] &&
                    this.grid[nextY][nextX] === targetColorId
                ) {
                    visited[nextY][nextX] = true;
                    queue.push([nextX, nextY]);
                }
            }
        }
        return eatenCount;
    }
}