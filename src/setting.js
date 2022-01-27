"use strict";
var CanvasWrapper = require("./canvas_wrapper");
var Setting = /** @class */ (function () {
    function Setting() {
    }
    // mmからmakepdf単位系への変換
    Setting.mm2pt = function (mm) {
        return mm * Setting.MM2PT;
    };
    Setting.mm2px = function (mm) {
        return mm * Setting.MM2PX;
    };
    // 変換係数
    Setting.MM2PX = 4;
    Setting.MM2PT = 1 / 0.35278;
    // ナンバープレートの大きさ
    Setting.PLATE_WIDTH_MM = 330;
    Setting.PLATE_HEIGHT_MM = 165;
    // キャンバスのサイズ
    Setting.CANVAS_SIZE = {
        width: Setting.mm2px(Setting.PLATE_WIDTH_MM),
        height: Setting.mm2px(Setting.PLATE_HEIGHT_MM)
    };
    // 配色
    Setting.NORMAL_CAR = 0;
    Setting.NORMAL_COMPANY_CAR = 1;
    Setting.KEI_CAR = 2;
    Setting.KEI_COMPANY_CAR = 3;
    Setting.BG_COLOR = [
        "rgb(255,255,255)",
        "rgb(12,69,29)",
        "yellow",
        "rgb(0,0,0)"
    ];
    Setting.FRONT_COLOR = [
        "rgb(12,69,29)",
        "rgb(255,255,255)",
        "rgb(0,0,0)",
        "yellow"
    ];
    // 描画設定
    Setting.drawSetting = {
        "hiragana": {
            position: {
                x: Setting.mm2px(20),
                y: Setting.mm2px(90)
            },
            size: {
                width: Setting.mm2px(40),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "kanji1-1": {
            position: {
                x: Setting.mm2px(105),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(40),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "kanji2-1": {
            position: {
                x: Setting.mm2px(170 - 90),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(40),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "kanji2-2": {
            position: {
                x: Setting.mm2px(170 - 45),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(40),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "kanji3-1": {
            position: {
                x: Setting.mm2px(170 - 95),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(30),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.FIXED_HEIGHT
        },
        "kanji3-2": {
            position: {
                x: Setting.mm2px(170 - 60),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(30),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.FIXED_HEIGHT
        },
        "kanji3-3": {
            position: {
                x: Setting.mm2px(170 - 25),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(30),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.FIXED_HEIGHT
        },
        "kanji4-1": {
            position: {
                x: Setting.mm2px(170 - 95),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.FIXED_HEIGHT
        },
        "kanji4-2": {
            position: {
                x: Setting.mm2px(170 - 70),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.FIXED_HEIGHT
        },
        "kanji4-3": {
            position: {
                x: Setting.mm2px(170 - 45),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.FIXED_HEIGHT
        },
        "kanji4-4": {
            position: {
                x: Setting.mm2px(170 - 20),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.FIXED_HEIGHT
        },
        "large_number1": {
            position: {
                x: Setting.mm2px(75),
                y: Setting.mm2px(70)
            },
            size: {
                width: Setting.mm2px(40),
                height: Setting.mm2px(80)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "large_number2": {
            position: {
                x: Setting.mm2px(125),
                y: Setting.mm2px(70)
            },
            size: {
                width: Setting.mm2px(40),
                height: Setting.mm2px(80)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "large_number3": {
            position: {
                x: Setting.mm2px(210),
                y: Setting.mm2px(70)
            },
            size: {
                width: Setting.mm2px(40),
                height: Setting.mm2px(80)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "large_number4": {
            position: {
                x: Setting.mm2px(265),
                y: Setting.mm2px(70)
            },
            size: {
                width: Setting.mm2px(40),
                height: Setting.mm2px(80)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "small_number3-1": {
            position: {
                x: Setting.mm2px(Setting.PLATE_WIDTH_MM / 2 + 13),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "small_number3-2": {
            position: {
                x: Setting.mm2px(Setting.PLATE_WIDTH_MM / 2 + 38),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "small_number3-3": {
            position: {
                x: Setting.mm2px(Setting.PLATE_WIDTH_MM / 2 + 63),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "small_number2-1": {
            position: {
                x: Setting.mm2px(Setting.PLATE_WIDTH_MM / 2 + 10),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(30),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "small_number2-2": {
            position: {
                x: Setting.mm2px(Setting.PLATE_WIDTH_MM / 2 + 50),
                y: Setting.mm2px(15)
            },
            size: {
                width: Setting.mm2px(30),
                height: Setting.mm2px(40)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "bolt1": {
            position: {
                x: Setting.mm2px(60),
                y: Setting.mm2px(28)
            },
            size: {
                width: Setting.mm2px(10),
                height: Setting.mm2px(10)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "bolt1_large": {
            position: {
                x: Setting.mm2px(60),
                y: Setting.mm2px(28)
            },
            size: {
                width: Setting.mm2px(22),
                height: Setting.mm2px(22)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        },
        "bolt2": {
            position: {
                x: Setting.mm2px(Setting.PLATE_WIDTH_MM - 60),
                y: Setting.mm2px(28)
            },
            size: {
                width: Setting.mm2px(10),
                height: Setting.mm2px(10)
            },
            tr_option: CanvasWrapper.KEEP_ASPECT
        }
    };
    return Setting;
}());
module.exports = Setting;
//# sourceMappingURL=setting.js.map