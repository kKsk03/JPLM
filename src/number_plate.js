"use strict";
var CanvasWrapper = require("./canvas_wrapper");
var FontType = require("./FontType");
var Setting = require("./setting");
var NumberPlate = /** @class */ (function () {
    function NumberPlate(canvas) {
        // 書き込み情報
        this.smallNumberList = ["3", "0", "0"];
        this.largeNumberList = [
            { number: "1", is_dot: false },
            { number: "2", is_dot: false },
            { number: "3", is_dot: false },
            { number: "4", is_dot: false }
        ];
        this.hiragana = "さ";
        this.kanji = "横浜";
        this.carType = NumberPlate.NORMAL_CAR;
        this.isCompany = false;
        // 留め具のサイズ
        this.isLargeBolt = false;
        // オブザーバー一覧
        this.obserber_list = [];
        this.canvas = new CanvasWrapper(canvas);
        this.canvas.setSize(Setting.CANVAS_SIZE);
    }
    NumberPlate.prototype.registObserver = function (observer) {
        this.obserber_list.push(observer);
    };
    // 初期化
    NumberPlate.prototype.init = function (callback) {
        this.canvas.init(callback);
    };
    NumberPlate.prototype.toDataURL = function () {
        return this.canvas.toDataURL();
    };
    // セッター
    NumberPlate.prototype.setCarType = function (car_type) {
        this.carType = car_type;
        this.drawAll();
    };
    NumberPlate.prototype.setIsCompany = function (is_company) {
        this.isCompany = is_company;
        this.drawAll();
    };
    NumberPlate.prototype.setIsLarge = function (isLargeBolt) {
        this.isLargeBolt = isLargeBolt;
        this.drawAll();
    };
    NumberPlate.prototype.setHiragana = function (hiragana) {
        var _this = this;
        this.hiragana = hiragana.slice(0, 1);
        this.hiragana = hiragana;
        // オブザーバーへ変更を通知
        this.obserber_list.forEach(function (observer) {
            observer.onChangeHiragana(_this.hiragana);
        });
        this.drawAll();
    };
    NumberPlate.prototype.setKanji = function (kanji) {
        var _this = this;
        this.kanji = kanji;
        // オブザーバーへ変更を通知
        this.obserber_list.forEach(function (observer) {
            observer.onChagneKanji(_this.kanji);
        });
        this.drawAll();
    };
    NumberPlate.prototype.setSmallNumber = function (smallNumberList) {
        var _this = this;
        if (smallNumberList.length != NumberPlate.SMALL_NUMBER_COUNT) {
            return;
        }
        for (var i = 0; i < NumberPlate.SMALL_NUMBER_COUNT; i++) {
            var number_char = " ";
            if (CanvasWrapper.isNumber(smallNumberList[i])) {
                number_char = smallNumberList[i];
            }
            this.smallNumberList[i] = number_char;
        }
        // オブザーバーへ変更を通知
        this.obserber_list.forEach(function (observer) {
            observer.onChangeSmallNumber(_this.smallNumberList);
        });
        this.drawAll();
    };
    NumberPlate.prototype.setLargeNumber = function (largeNumberList) {
        if (largeNumberList.length != NumberPlate.LARGE_NUMBER_COUNT) {
            return;
        }
        // 数値判定用正規表現
        var reg = /[0-9]/;
        var dot_char = "・";
        // 数字以外の入力はドットに置換
        for (var i = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            if (!reg.test(largeNumberList[i])) {
                largeNumberList[i] = dot_char;
            }
        }
        // 値の格納
        for (var i = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            if (largeNumberList[i] != dot_char) {
                this.largeNumberList[i].number = largeNumberList[i];
            }
        }
        // ドットの処理
        // 変更されたインデックスを取得
        var change_index = -1;
        for (var i = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            var is_dot = largeNumberList[i] == dot_char;
            if (is_dot != this.largeNumberList[i].is_dot) {
                change_index = i;
            }
            this.largeNumberList[i].is_dot = is_dot;
        }
        // ドットの修正
        if (change_index == -1) {
        }
        // 数値→ドットの変更の場合、変更点より左側もすべてドットに変更
        else if (this.largeNumberList[change_index].is_dot == true) {
            for (var i = 0; i < change_index; i++) {
                this.largeNumberList[i].is_dot = this.largeNumberList[change_index].is_dot;
            }
        }
        // ドット→数値の変更の場合、変更点よりも右側をすべてドットに変更
        else {
            for (var i = change_index; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
                this.largeNumberList[i].is_dot = this.largeNumberList[change_index].is_dot;
            }
        }
        // オブザーバーへ変更を通知
        var changedLargeNumberList = [];
        for (var i = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            if (this.largeNumberList[i].is_dot) {
                changedLargeNumberList.push(dot_char);
            }
            else {
                changedLargeNumberList.push(this.largeNumberList[i].number);
            }
        }
        this.obserber_list.forEach(function (observer) {
            observer.onChangeLargeNumber(changedLargeNumberList);
        });
        this.drawAll();
    };
    // 描画
    NumberPlate.prototype.drawHiragana = function () {
        var drawSetting = Setting.drawSetting["hiragana"];
        this.canvas.drawChar(this.hiragana, drawSetting.size, drawSetting.position, this.getColor(), CanvasWrapper.KEEP_ASPECT, FontType.SELF);
    };
    NumberPlate.prototype.drawKanji = function () {
        var kanjiList = this.kanji.split("");
        var wordCount = Math.min(kanjiList.length, 4);
        for (var i = 0; i < wordCount; i++) {
            var setting_key = "kanji" + wordCount.toString() + "-" + (i + 1).toString();
            var drawSetting = Setting.drawSetting[setting_key];
            this.canvas.drawChar(kanjiList[i], drawSetting.size, drawSetting.position, this.getColor(), drawSetting.tr_option);
        }
    };
    NumberPlate.prototype.drawLargeNumber = function () {
        var isDrawHyphen = true;
        for (var i = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            var setting_key = "large_number" + (i + 1).toString();
            var drawSetting = Setting.drawSetting[setting_key];
            if (this.largeNumberList[i].is_dot) {
                this.canvas.drawChar("・", drawSetting.size, drawSetting.position, this.getColor());
            }
            else {
                this.canvas.drawChar(this.largeNumberList[i].number, drawSetting.size, drawSetting.position, this.getColor());
            }
            if (this.largeNumberList[i].is_dot) {
                isDrawHyphen = false;
            }
        }
        if (isDrawHyphen) {
            this.drawHyphen();
        }
    };
    NumberPlate.prototype.drawSmallNumber = function () {
        var drawSmallNumberList = [];
        for (var i = 0; i < NumberPlate.SMALL_NUMBER_COUNT; i++) {
            if (this.smallNumberList[i] != " ") {
                drawSmallNumberList.push(this.smallNumberList[i]);
            }
        }
        for (var i = 0; i < drawSmallNumberList.length; i++) {
            var setting_key = "small_number" + drawSmallNumberList.length + "-" + (i + 1).toString();
            var drawSetting = Setting.drawSetting[setting_key];
            this.canvas.drawChar(drawSmallNumberList[i], drawSetting.size, drawSetting.position, this.getColor());
        }
    };
    // ハイフンの描写
    NumberPlate.prototype.drawHyphen = function () {
        var drawSetting = {
            position: {
                x: Setting.mm2px(177.5),
                y: Setting.mm2px(104),
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(12)
            }
        };
        this.canvas.drawRect(drawSetting.size, drawSetting.position, this.getColor());
    };
    NumberPlate.prototype.drawBolt = function () {
        var drawSetting1 = this.isLargeBolt ? Setting.drawSetting["bolt1_large"] : Setting.drawSetting["bolt1"];
        var drawSetting2 = Setting.drawSetting["bolt2"];
        this.canvas.drawCircle(drawSetting1.size, drawSetting1.position, "#9a9e9d");
        this.canvas.drawCircle(drawSetting2.size, drawSetting2.position, "#9a9e9d");
    };
    // 色取得
    NumberPlate.prototype.getColor = function () {
        if (this.isCompany) {
            if (this.carType == NumberPlate.NORMAL_CAR) {
                return Setting.FRONT_COLOR[Setting.NORMAL_COMPANY_CAR];
            }
            else if (this.carType == NumberPlate.KEI_CAR) {
                return Setting.FRONT_COLOR[Setting.KEI_COMPANY_CAR];
            }
        }
        if (this.carType == NumberPlate.NORMAL_CAR) {
            return Setting.FRONT_COLOR[Setting.NORMAL_CAR];
        }
        else if (this.carType == NumberPlate.KEI_CAR) {
            return Setting.FRONT_COLOR[Setting.KEI_CAR];
        }
        return Setting.FRONT_COLOR[Setting.NORMAL_CAR];
    };
    // 背景色取得
    NumberPlate.prototype.getBgColor = function () {
        if (this.isCompany) {
            if (this.carType == NumberPlate.NORMAL_CAR) {
                return Setting.BG_COLOR[Setting.NORMAL_COMPANY_CAR];
            }
            else if (this.carType == NumberPlate.KEI_CAR) {
                return Setting.BG_COLOR[Setting.KEI_COMPANY_CAR];
            }
        }
        if (this.carType == NumberPlate.NORMAL_CAR) {
            return Setting.BG_COLOR[Setting.NORMAL_CAR];
        }
        else if (this.carType == NumberPlate.KEI_CAR) {
            return Setting.BG_COLOR[Setting.KEI_CAR];
        }
        return Setting.BG_COLOR[Setting.NORMAL_CAR];
    };
    // すべて塗りつぶす
    NumberPlate.prototype.deleteAll = function () {
        this.canvas.drawRect(Setting.CANVAS_SIZE, { x: 0, y: 0 }, this.getBgColor());
    };
    // 描写する
    NumberPlate.prototype.drawAll = function () {
        this.deleteAll();
        this.drawKanji();
        this.drawHiragana();
        this.drawSmallNumber();
        this.drawLargeNumber();
        this.drawBolt();
    };
    NumberPlate.SMALL_NUMBER_COUNT = 3;
    NumberPlate.LARGE_NUMBER_COUNT = 4;
    NumberPlate.NORMAL_CAR = 0;
    NumberPlate.KEI_CAR = 1;
    return NumberPlate;
}());
module.exports = NumberPlate;
//# sourceMappingURL=number_plate.js.map