// drawing.js

/**
 * ブロックを1マス描画するための共通関数
 * @param {CanvasRenderingContext2D} ctx - 描画対象のCanvasコンテキスト
 * @param {number} x - 描画先のX座標
 * @param {number} y - 描画先のY座標
 * @param {string} color - ブロックの色
 * @param {number} typeId - ブロックの種類を識別するID
 * @param {number} timer - アニメーション用のタイマー
 * @param {boolean} isColorEater - カラーイーターのフラグ
 */
function drawBlock(ctx, x, y, color, typeId, timer = 0, isColorEater = false) {
    if (y < 0) return;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);

    // --- ブロックの種類に応じた装飾 ---

    if (typeId === BOMB_ID) {
        // 10x10のドットとして描画する
        const s = 1 / 10;

        // 1. 本体の描画
        ctx.fillStyle = '#212121';
        ctx.fillRect(x + s * 2, y + s, s * 6, s * 9);
        ctx.fillRect(x + s, y + s * 2, s * 8, s * 8);
        ctx.fillRect(x, y + s * 3, s * 10, s * 6);
        // ハイライト
        ctx.fillStyle = '#757575';
        ctx.fillRect(x + s * 2, y + s * 3, s * 3, s);
        ctx.fillRect(x + s * 2, y + s * 4, s, s * 2);

        // 2. 導火線の描画
        ctx.fillStyle = '#A1887F';
        ctx.fillRect(x + s * 6, y + s * 2, s, s);
        ctx.fillRect(x + s * 7, y + s, s, s * 2);

        // 3. 火花のアニメーション描画
        if (Math.floor(timer / 6) % 2 === 0) {
            ctx.fillStyle = '#FFEB3B';
            ctx.fillRect(x + s * 8, y + s, s, s);
            ctx.fillRect(x + s * 7, y, s, s * 2);
            ctx.fillRect(x + s * 9, y, s, s * 2);
            ctx.fillRect(x + s * 8, y, s, s);
        } else {
            ctx.fillStyle = '#FFC107';
            ctx.fillRect(x + s * 8, y, s, s);
            ctx.fillRect(x + s * 7, y + s, s, s);
            ctx.fillRect(x + s * 9, y + s, s, s);
            ctx.fillStyle = '#FF9800';
            ctx.fillRect(x + s * 8, y - s, s, s);
        }
        
        return;
    }
    
    if (typeId === GARBAGE_ID) {
        return;
    }

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★ ネオン描画ロジック
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

    // --- Step 1: ネオンの輝きを加える設定（これだけです） ---
    ctx.shadowColor = color;
    ctx.shadowBlur = 12; // この数値で光の広がりを調整できます

    // --- Step 2: 以下は、一番最初に評価いただいた立体ブロックの描画ロジックそのものです ---
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);                  // 本体
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // ハイライト
    ctx.fillRect(x, y, 1, 0.1);
    ctx.fillRect(x, y, 0.1, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';    // シェード
    ctx.fillRect(x, y + 0.9, 1, 0.1);
    ctx.fillRect(x + 0.9, y, 0.1, 1);
    
    // --- Step 3: 他の描画に影響が出ないよう、最後に必ずリセットします ---
    ctx.shadowBlur = 0;

    // ★追加：カラーイーターの場合、特別なアイコンを重ねて描画
    if (isColorEater) {
        ctx.save(); // 現在の描画状態を保存
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // フォントサイズはブロックサイズに合わせて調整が必要な場合があります
        // 現在のスケール(BLOCK_SIZE)を考慮して、1ブロック分の大きさに合わせます
        ctx.font = '0.7px sans-serif'; // 1pxだと大きすぎるので調整
        ctx.shadowBlur = 0; // アイコンには影をつけない
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // 少し明るい色で
        ctx.fillText('🌀', x + 0.5, y + 0.55); // ブロックの中央に描画 (Y座標を少し調整)
        ctx.restore(); // 描画状態を元に戻す
    }
}