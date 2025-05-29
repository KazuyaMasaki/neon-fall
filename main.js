// main.js

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

let particles = []; // ★パーティクルを管理する配列
// ★追加：描画アニメーション用のタイマー
let animationTimer = 0;

ctx.canvas.width = COLS * BLOCK_SIZE;
ctx.canvas.height = ROWS * BLOCK_SIZE;
ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

let board = new Board(ctx);
let piece = new Piece(ctx);

// ★修正：score変数をグローバルで管理
let score = 0;
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;
// ★追加：おじゃまブロック用タイマー
let garbageCounter = 0;

let isGameOver = false;
let animationId;

// ★追加：スコアを更新する関数
function addScore(linesCount) {
    if (linesCount > 0) {
        // ★修正：引数をライン数に変更
        score += POINTS[linesCount] || 0;
        scoreElement.textContent = score;
    }
}

// ★追加：ブロックが着地した際の共通処理を関数化
function handleLanding() {
    if (piece.isColorEater) { // ★追加：カラーイーターの処理を先頭に
        // カラーイーター自身も消えるので、盤面には固定しない
        // カラーイーターの位置と、その「食べる色」のIDを渡す
        const eatenCount = board.eatConnectedBlocks(piece.x, piece.y, piece.typeId);

        if (eatenCount > 0) {
            score += eatenCount * POINTS_PER_EATEN_BLOCK;
            scoreElement.textContent = score;
            // ここでカラーイーター専用のパーティクルエフェクトを出しても良い
            for(let i = 0; i < eatenCount * 2; i++) { // 消した数に応じてパーティクル
                particles.push({
                    x: piece.x + 0.5 + (Math.random() - 0.5) * 2, // 少し広範囲に
                    y: piece.y + 0.5 + (Math.random() - 0.5) * 2,
                    vx: (Math.random() - 0.5) * 0.1,
                    vy: (Math.random() - 0.5) * 0.1,
                    life: 20 + Math.random() * 20,
                    size: Math.random() * 0.2 + 0.1,
                    color: piece.color, // 食べた色でパーティクル
                    gravity: 0
                });
            }
        }
    // ★追加：着地したのがボムブロックか判定
    } else if (piece.typeId === BOMB_ID) {
        const bombX = piece.x + 0.5; // ブロックの中心X
        const bombY = piece.y + 0.5; // ブロックの中心Y

        // 消したブロックの数を受け取る
        const destroyedCount = board.explode(piece.x, piece.y);
        
        // ★追加：消したブロックがあればスコアを加算
        if (destroyedCount > 0) {
            const bombScore = destroyedCount * 10;
            score += bombScore;
            scoreElement.textContent = score; // 画面のスコアを更新
        }
        
        // ★ここから修正：パーティクルを生成
        const particleCount = 30; // 飛び散るパーティクルの数
        const gravity = 0.01;   // 重力

        for (let i = 0; i < particleCount; i++) {
            // 飛び散る角度と強さをランダムに決める
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.15 + 0.05;

            particles.push({
                x: bombX,
                y: bombY,
                vx: Math.cos(angle) * speed, // X方向の速度
                vy: Math.sin(angle) * speed, // Y方向の速度
                life: 30 + Math.random() * 30, // 寿命
                size: Math.random() * 0.3 + 0.1,
                color: ['yellow', 'orange', 'white'][Math.floor(Math.random() * 3)],
                gravity: gravity
            });
        }
    } else {
        // 通常のブロックなら盤面に固定
        board.freeze(piece);
        // ★修正：clearLinesからY座標の配列を受け取る
        const clearedLinesY = board.clearLines();
        
        // ★追加：消えたラインがあれば、そこからエフェクトを発生させる
        if (clearedLinesY.length > 0) {
            // スコアを加算 (配列の長さが消したライン数になる)
            addScore(clearedLinesY.length);

            // 消えた各行に対してパーティクルを生成
            clearedLinesY.forEach(y => {
                // 1ラインにつき10個のパーティクルを生成
                for (let x = 0; x < COLS; x++) {
                    particles.push({
                        x: x + 0.5, // 各ブロックの中心から
                        y: y + 0.5,
                        vx: (Math.random() - 0.5) * 0.05, // 左右に少しだけランダムに動く
                        vy: -(Math.random() * 0.15 + 0.05), // ゆっくり上に昇る
                        life: 40 + Math.random() * 30, // 少し長めの寿命
                        size: Math.random() * 0.2 + 0.1,
                        color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`, // 半透明の白
                        gravity: -0.001 // ★マイナスの重力でふわっと感を演出
                    });
                }
            });
        }
    }

    // 新しいピースを生成
    piece.spawn();
    if (!board.isValid(piece)) {
        isGameOver = true;
    }
}

// ★パーティクルを描画するための新しい関数
function drawParticles() {
    particles.forEach(p => {
        // 徐々に透明にする
        ctx.globalAlpha = p.life / 60; // 60フレームで完全に消える
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // 小さな円として描画
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 透明度を元に戻す
        ctx.globalAlpha = 1.0;
    });
}

function gameLoop(time = 0) {
    if (isGameOver) {
        drawGameOver();
        cancelAnimationFrame(animationId);
        return;
    }

    // ★追加：アニメーションタイマーをインクリメント
    animationTimer++;

    const deltaTime = time - lastTime;
    lastTime = time;

    // 自動落下タイマー
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        piece.y++;
        if (!board.isValid(piece)) {
            piece.y--;
            // ★修正：着地処理を呼び出す
            handleLanding();
        }
        dropCounter = 0;
    }

    // ★追加：おじゃまブロック出現タイマー
    garbageCounter += deltaTime;
    if (garbageCounter > GARBAGE_INTERVAL) {
        board.addGarbageLine();
        garbageCounter = 0; // カウンターをリセット

        // せり上がりでミノが壁に埋まった場合の救済措置
        if (!board.isValid(piece)) {
            piece.y--;
        }
    }

    // ★ここから修正：パーティクルの状態を更新
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        
        // 物理演算
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity; // 重力でY方向の速度を加速

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function draw() {
    // ★修正：クリアする範囲を、スケール後の座標系（盤面のマス数）に合わせる
    ctx.clearRect(0, 0, COLS, ROWS); // 描画前にクリア
    // ★修正：board.drawとpiece.drawにanimationTimerを渡す
    board.draw(animationTimer);
    piece.draw(animationTimer);

    // ★追加：エフェクトを描画
    drawParticles();
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // ★修正：フォントサイズを調整
    ctx.font = '1px "Press Start 2P"'; 
    ctx.fillStyle = '#ff4136'; // 赤色に変更
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', COLS / 2, ROWS / 2);
}

document.addEventListener('keydown', event => {
    if (isGameOver) return;
    
    if ([KEY.UP, KEY.DOWN, KEY.SPACE].includes(event.key)) {
        event.preventDefault();
    }
    
    switch (event.key) {
        case KEY.LEFT:
            piece.x--;
            if (!board.isValid(piece)) {
                piece.x++; // 元に戻す
            }
            break;
        case KEY.RIGHT:
            piece.x++;
            if (!board.isValid(piece)) {
                piece.x--; // 元に戻す
            }
            break;
        case KEY.DOWN:
            piece.y++;
            if (!board.isValid(piece)) {
                piece.y--; // 元に戻す
            }
            break;
        case KEY.UP:
            piece.rotate();
            if (!board.isValid(piece)) {
                // 壁などに衝突したら3回逆回転して元に戻す
                piece.rotate();
                piece.rotate();
                piece.rotate();
            }
            break;

        case KEY.SPACE:
            while (board.isValid(piece)) {
                piece.y++;
            }
            piece.y--;
            // ★修正：handleLandingを呼び出すことで、エフェクトも共通化
            handleLanding();
            break;
    }
    draw();
});

// ゲーム開始
gameLoop();