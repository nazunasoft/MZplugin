/*:
 * @target MZ
 * @plugindesc [v1.0.2] 変数(X,Y,拡大率％)で画面ズームを実行/解除
 * @author なｚな
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
 * @arg x
 * @type number
 * @default 0
 * @arg y
 * @type number
 * @default 0
 * @arg scale
 * @text 拡大率(％)
 * @type number
 * @default 100
 *
 * @command ApplyZoomVars
 * @text 変数の値でズーム実行
 *
 * @command CancelZoom
 * @text ズーム解除
 */

(() => {
  "use strict";

  // ★保存したファイル名をそのままプラグイン名として使う
  const PLUGIN_NAME = (document.currentScript?.src.match(/([^/]+)\.js$/) || [null, ""])[1];

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

  PluginManager.registerCommand(PLUGIN_NAME, "SetZoomVars", args => {
    const x = Number(args.x || 0);
    const y = Number(args.y || 0);
    const scale = Number(args.scale || 100);

    setVar(VAR_X, Number.isFinite(x) ? x : 0);
    setVar(VAR_Y, Number.isFinite(y) ? y : 0);
    setVar(VAR_S, Number.isFinite(scale) ? scale : 100);
  });

  PluginManager.registerCommand(PLUGIN_NAME, "ApplyZoomVars", () => {
    const x = getVar(VAR_X);
    const y = getVar(VAR_Y);
    const scalePercent = getVar(VAR_S);

    const scale = scalePercent > 0 ? scalePercent / 100 : 1.0;
    $gameScreen.setZoom(x, y, scale);
  });

  PluginManager.registerCommand(PLUGIN_NAME, "CancelZoom", () => {
    $gameScreen.setZoom(0, 0, 1.0);
  });
})();
