/*:
 * @target MZ
 * @plugindesc [v1.0.1] 変数(X,Y,拡大率％)を使って画面ズームを実行/解除するプラグイン
 * @author Helen
 *
 * @help
 * ■概要
 * プラグイン設定で指定した 3つの変数に
 *  (1) X / Y / 拡大率(％)
 *  (2) その変数値で $gameScreen.setZoom(x,y,scale)
 *  (3) ズーム解除 (0,0,1.0)
 * を行うプラグインコマンドを提供します。
 *
 * ■拡大率の扱い
 * 拡大率は「％」で管理します。
 *
 * 例：
 *   100 → 1.0倍
 *   150 → 1.5倍
 *   200 → 2.0倍
 *
 * ■コマンド
 * 1) SetZoomVars : 指定変数へ X/Y/Scale％ を格納
 * 2) ApplyZoomVars : 変数値でズームを適用
 * 3) CancelZoom : ズーム解除
 *
 * @param varX
 * @text X座標 変数番号
 * @type variable
 * @default 1
 *
 * @param varY
 * @text Y座標 変数番号
 * @type variable
 * @default 2
 *
 * @param varScale
 * @text 拡大率(％) 変数番号
 * @type variable
 * @default 3
 *
 * @command SetZoomVars
 * @text 変数にズーム値を格納
 * @desc 指定した3変数に X/Y/拡大率(％) を格納します
 *
 * @arg x
 * @text X座標
 * @type number
 * @default 0
 *
 * @arg y
 * @text Y座標
 * @type number
 * @default 0
 *
 * @arg scale
 * @text 拡大率(％)
 * @desc 例: 100=等倍 / 150=1.5倍
 * @type number
 * @default 100
 *
 * @command ApplyZoomVars
 * @text 変数の値でズーム実行
 * @desc 変数(X/Y/拡大率％)から読み取り setZoom(x,y,scale) を実行します
 *
 * @command CancelZoom
 * @text ズーム解除
 * @desc $gameScreen.setZoom(0,0,1.0) を実行します
 */

(() => {
  "use strict";

  const PLUGIN_NAME = "Helen_ScreenZoomVars";
  const params = PluginManager.parameters(PLUGIN_NAME);

  const VAR_X = Number(params.varX || 0);
  const VAR_Y = Number(params.varY || 0);
  const VAR_S = Number(params.varScale || 0); // scale %

  function setVar(id, value) {
    if (id > 0) $gameVariables.setValue(id, value);
  }

  function getVar(id) {
    if (id <= 0) return 0;
    const v = Number($gameVariables.value(id));
    return Number.isFinite(v) ? v : 0;
  }

  // ① 変数に値を格納
  PluginManager.registerCommand(PLUGIN_NAME, "SetZoomVars", args => {
    const x = Number(args.x || 0);
    const y = Number(args.y || 0);
    const scale = Number(args.scale || 100);

    setVar(VAR_X, Number.isFinite(x) ? x : 0);
    setVar(VAR_Y, Number.isFinite(y) ? y : 0);
    setVar(VAR_S, Number.isFinite(scale) ? scale : 100);
  });

  // ② 変数の値でズーム実行
  PluginManager.registerCommand(PLUGIN_NAME, "ApplyZoomVars", () => {
    const x = getVar(VAR_X);
    const y = getVar(VAR_Y);
    const scalePercent = getVar(VAR_S);

    const scale = scalePercent > 0 ? scalePercent / 100 : 1.0;

    $gameScreen.setZoom(x, y, scale);
  });

  // ③ ズーム解除
  PluginManager.registerCommand(PLUGIN_NAME, "CancelZoom", () => {
    $gameScreen.setZoom(0, 0, 1.0);
  });
})();
