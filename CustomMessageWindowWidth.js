/*:
 * @target MZ
 * @plugindesc v1.0.0  特定のスイッチがONのときにメッセージウィンドウの幅と位置を変更する
 * @author なｚな
 *
 * @param Switch ID
 * @type switch
 * @desc 幅と位置を変更するかどうかを判定するスイッチのID
 * @default 1
 *
 * @param Custom Width
 * @type number
 * @desc スイッチONのときのメッセージウィンドウの幅（ピクセル単位）
 * @default 600
 *
 * @param Alignment
 * @type select
 * @option left
 * @option center
 * @option right
 * @desc メッセージウィンドウの表示位置
 * @default center
 * 
 * @license MIT
 * 
 * @help
 * プラグイン作者: なｚな
 * 
 * 概要:
 * 特定のスイッチがONのときにメッセージウィンドウの幅と位置を変更し、邪魔にならないようにします。
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
    const pluginName = document.currentScript.src.match(/([^\/]+)\.js$/)[1];
    const parameters = PluginManager.parameters(pluginName);
    const switchId = Number(parameters['Switch ID'] || 1);
    const customWidth = Number(parameters['Custom Width'] || 400);
    const alignment = String(parameters['Alignment'] || 'center').toLowerCase();

    const _Window_Message_windowWidth = Window_Message.prototype.windowWidth;
    Window_Message.prototype.windowWidth = function() {
        if ($gameSwitches.value(switchId)) {
            return customWidth;
        } else {
            return _Window_Message_windowWidth.call(this);
        }
    };

    const _Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function() {
        _Window_Message_updatePlacement.call(this);
        if ($gameSwitches.value(switchId)) {
            switch (alignment) {
                case 'left':
                    this.x = 0;
                    break;
                case 'center':
                    this.x = (Graphics.boxWidth - this.width) / 2;
                    break;
                case 'right':
                    this.x = Graphics.boxWidth - this.width;
                    break;
            }
        }
    };
})();
