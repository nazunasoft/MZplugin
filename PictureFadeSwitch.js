/*:
 * @target MZ
 * @plugindesc ピクチャのフェード切り替えを実現するプラグイン
 * @author なｚな
 * @help
 * このプラグインを使用すると、表示中のピクチャを別のピクチャに
 * フェード効果で切り替えることができます。
 * 
 * @command PictureFadeSwitch
 * @text ピクチャフェード切り替え
 * @desc ピクチャをフェード効果で別のピクチャに切り替えます。
 * 
 * @arg targetPictureId
 * @text 切り替え対象ピクチャID
 * @desc 切り替える対象のピクチャID
 * @type number
 * @min 1
 * 
 * @arg dummyPictureId
 * @text ダミーピクチャID
 * @desc フェードに使用する前面のピクチャID
 * @type number
 * @min 1
 * @desc 切り替え対象より前面に表示するため、切り替え対象ピクチャIDより大きい値を指定してください
 * 
 * @arg newPicturePath
 * @text 切り替え先ピクチャのパス
 * @desc 切り替え先の画像ファイルパス
 * @type file
 * @dir img/pictures
 * 
 * @arg xPosition
 * @text X座標
 * @desc ピクチャの表示X座標
 * @type number
 * @min 0
 * @default 0
 * 
 * @arg yPosition
 * @text Y座標
 * @desc ピクチャの表示Y座標
 * @type number
 * @min 0
 * @default 0
 * 
 * @arg fadeDuration
 * @text フェード時間
 * @desc フェードにかける時間（フレーム数）
 * @type number
 * @min 1
 * @default 30
 * 
 * @arg waitForCompletion
 * @text 完了までウェイト
 * @desc フェード処理が完了するまでウェイトするかどうか
 * @type boolean
 * @on はい
 * @off いいえ
 * @default true
 * 
 * @license MIT
 * 
 * @help
 * プラグイン作者: なｚな
 * 
 * 概要:
 * 「ピクチャの表示」などで予め通常通り表示したピクチャIDに対し、フェードで切り替えをします。
 *
 * 使い方:
 * 「プラグインコマンド」から、各パラメータを指定して実行してください。
 * 
 * 
 * 利用規約:
 *   MITライセンスです。
 *   https://licenses.opensource.jp/MIT/MIT.html
 *   作者に無断で改変、再配布が可能で、
 *   利用形態（商用、18禁利用等）についても制限はありません。
 */

(() => {
    const pluginName = "PictureFadeSwitch";

    PluginManager.registerCommand(pluginName, "PictureFadeSwitch", args => {
        const targetPictureId = Number(args.targetPictureId);
        const dummyPictureId = Number(args.dummyPictureId);
        const newPicturePath = args.newPicturePath;
        const xPosition = Number(args.xPosition);
        const yPosition = Number(args.yPosition);
        const fadeDuration = Number(args.fadeDuration);
        const waitForCompletion = args.waitForCompletion === "true";

        // 前面に新しいピクチャを表示（透明度0で開始）
        $gameScreen.showPicture(dummyPictureId, newPicturePath, 0, xPosition, yPosition, 100, 100, 0, 0);

        // ピクチャの移動処理 (フェードイン)
        $gameScreen.movePicture(dummyPictureId, 0, xPosition, yPosition, 100, 100, 255, 0, fadeDuration);

        if (waitForCompletion) {
            // ウェイトを行う場合
            $gameMap._interpreter.wait(fadeDuration);
        }

        // フェードイン完了後にピクチャを切り替える
        setTimeout(() => {
            // 切り替え対象のピクチャを新しいピクチャに切り替え
            $gameScreen.showPicture(targetPictureId, newPicturePath, 0, xPosition, yPosition, 100, 100, 255, 0);

            // ダミーピクチャを消去
            $gameScreen.erasePicture(dummyPictureId);
        }, fadeDuration * 16.67);  // 1フレーム = 16.67ms
    });
})();
