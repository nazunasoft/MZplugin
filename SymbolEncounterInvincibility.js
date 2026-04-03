//=============================================================================
// SymbolEncounterInvincibility.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc 敵から逃げた後やプラグインコマンドでの呼び出しで、主人公を一定時間無敵（イベント接触無効）にし点滅させます。
 * @author Antigravity
 *
 * @param InvincibleSeconds
 * @text 無敵時間（秒）
 * @desc 逃走成功時の無敵の秒数です。
 * @type number
 * @decimals 1
 * @default 3.0
 *
 * @param AutoTriggerOnEscape
 * @text 逃走時の自動発動
 * @desc バトルから逃走した時に自動で無敵状態にするかどうか。逃げてマップに戻った直後から有効になります。
 * @type boolean
 * @on 発動する
 * @off 発動しない
 * @default true
 *
 * @param BlockEventTouch
 * @text イベントからの接触を無効化
 * @desc 無敵中、トリガーが「イベントから接触」のイベントの起動を無効にします。
 * @type boolean
 * @default true
 *
 * @param BlockPlayerTouch
 * @text プレイヤーからの接触を無効化
 * @desc 無敵中、トリガーが「プレイヤーから接触」のイベント起動も無効にするか。
 * @type boolean
 * @default true
 *
 * @param BlinkInterval
 * @text 点滅間隔（フレーム）
 * @desc 無敵中のキャラクターの点滅速度（フレーム数）。1秒＝60フレーム。
 * @type number
 * @default 4
 *
 * @param TransparentOpacity
 * @text 点滅時の透明度
 * @desc 無敵中の基本の透明度（0〜255）。255は不透明、0は完全な透明。
 * @type number
 * @max 255
 * @min 0
 * @default 128
 *
 * @command startInvincibility
 * @text 無敵状態の開始
 * @desc 指定した秒数だけ無敵状態を開始します。（コモンイベント等から呼び出せます）
 *
 * @arg seconds
 * @text 秒数
 * @desc 無敵状態にする秒数。
 * @type number
 * @decimals 1
 * @default 3.0
 *
 * @command endInvincibility
 * @text 無敵状態の解除
 * @desc 即座に無敵状態を解除します。
 *
 * @help
 * シンボルエンカウント採用のゲームで、逃走後にすぐに敵と接触して再び戦闘に
 * なってしまうのを防ぐためのプラグインです。
 *
 * 戦闘から逃走成功すると、自動的に指定秒数だけ無敵状態になります。
 * （無敵中は設定によって「イベントから接触」「プレイヤーから接触」の
 * トリガーが起動しなくなります）
 * 
 * プレイヤーからの接触無効をオンにすると、逃走直後にプレイヤーが
 * うっかり敵の方向にキーを入力してしまっても戦闘を回避できます。
 * 宝箱などの「決定ボタン」のイベントは無敵中でも通常通り調べられます。
 *
 * 分かりやすいように、無敵期間中は主人公キャラ（およびフォロワー）の
 * 透明度を少し上げて細かく点滅アニメーションを行います。
 *
 * コモンイベントなどで自由に使いたい時のため、プラグインコマンドから
 * 任意のタイミングで無敵状態を開始・解除することも可能です。
 */

(() => {
    "use strict";

    const pluginName = "SymbolEncounterInvincibility";
    const parameters = PluginManager.parameters(pluginName);
    
    // パラメータの取得
    const invincibleSeconds = Number(parameters['InvincibleSeconds'] || 3.0);
    const autoTriggerOnEscape = parameters['AutoTriggerOnEscape'] !== "false";
    const blockEventTouch = parameters['BlockEventTouch'] !== "false";
    const blockPlayerTouch = parameters['BlockPlayerTouch'] !== "false";
    const blinkInterval = Number(parameters['BlinkInterval'] || 4);
    const transparentOpacity = Number(parameters['TransparentOpacity'] || 128);

    //=============================================================================
    // PluginManager
    //=============================================================================
    PluginManager.registerCommand(pluginName, "startInvincibility", args => {
        const seconds = Number(args.seconds || 3.0);
        $gamePlayer.startInvincibility(seconds * 60);
    });

    PluginManager.registerCommand(pluginName, "endInvincibility", args => {
        $gamePlayer.clearInvincibility();
    });

    //=============================================================================
    // BattleManager
    //=============================================================================
    const _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        // result === 1 は「逃走」
        if (result === 1 && autoTriggerOnEscape) {
            $gamePlayer.startInvincibility(invincibleSeconds * 60);
        }
        _BattleManager_endBattle.call(this, result);
    };

    //=============================================================================
    // Game_Player
    //=============================================================================
    const _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _Game_Player_initMembers.call(this);
        this._invincibilityFrames = 0;
    };

    Game_Player.prototype.startInvincibility = function(frames) {
        this._invincibilityFrames = Math.floor(frames);
    };

    Game_Player.prototype.clearInvincibility = function() {
        this._invincibilityFrames = 0;
    };

    Game_Player.prototype.isInvincible = function() {
        return this._invincibilityFrames > 0;
    };

    const _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);
        if (sceneActive && this._invincibilityFrames > 0) {
            this._invincibilityFrames--;
        }
    };

    //=============================================================================
    // Game_Event
    //=============================================================================
    // 接触イベントの起動を防ぐ
    const _Game_Event_start = Game_Event.prototype.start;
    Game_Event.prototype.start = function() {
        if ($gamePlayer.isInvincible()) {
            if (blockPlayerTouch && this._trigger === 1) return; // プレイヤーからの接触
            if (blockEventTouch && this._trigger === 2) return;  // イベントからの接触
        }
        _Game_Event_start.call(this);
    };

    //=============================================================================
    // Sprite_Character
    //=============================================================================
    // 無敵状態中の点滅処理
    const _Sprite_Character_updateOther = Sprite_Character.prototype.updateOther;
    Sprite_Character.prototype.updateOther = function() {
        _Sprite_Character_updateOther.call(this);
        
        // 主人公キャラとフォロワーに点滅エフェクトを適用
        if (this._character === $gamePlayer || (this._character && this._character instanceof Game_Follower)) {
            if ($gamePlayer.isInvincible()) {
                const time = $gamePlayer._invincibilityFrames;
                // blinkIntervalフレームごとに透明度を切り替える
                if (Math.floor(time / blinkInterval) % 2 === 0) {
                    this.opacity = transparentOpacity;
                } else {
                    this.opacity = 255;
                }
            }
        }
    };

})();
