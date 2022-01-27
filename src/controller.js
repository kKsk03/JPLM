"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var NumberPlate = require("./number_plate");
var Setting = require("./setting");
var NumberPlateObserver = require("./number_plate_observer");
var PDFMake = __importStar(require("pdfmake/build/pdfmake"));
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        var _this = 
        // 基底クラスのコンストラクタ
        _super.call(this) || this;
        // キャンパス要素を取得
        var canvas = document.getElementById("plate-view");
        _this.numberPlate = new NumberPlate(canvas);
        _this.numberPlate.init(_this.load.bind(_this));
        // オブザーバー登録
        _this.numberPlate.registObserver(_this);
        return _this;
    }
    // 読み込み時処理
    Controller.prototype.load = function () {
        this.numberPlate.drawAll();
        // スケール一覧追加
        var INIT_SCALE_NUM = 24;
        var scaleInput = document.getElementById("scale");
        for (var number = 10; number <= 90; number++) {
            // オプション生成
            var option = document.createElement('option');
            option.textContent = "1/" + number.toString();
            option.value = number.toString();
            // 初期選択
            if (INIT_SCALE_NUM == number) {
                option.selected = true;
            }
            scaleInput.appendChild(option);
        }
        //===================================
        // イベント登録
        //===================================
        // ひらがな
        var hiraganaInput = document.getElementById("hiragana");
        hiraganaInput.oninput = this.changeHiragana.bind(this);
        // 運輸支局
        var kanjiInput = document.getElementById("kanji");
        kanjiInput.oninput = this.changeKanji.bind(this);
        // 普通自動車/軽自動車
        var normalCarInput = document.getElementById("normal-car");
        normalCarInput.onclick = this.changeCarType.bind(this);
        var keiCarInput = document.getElementById("kei-car");
        keiCarInput.onclick = this.changeCarType.bind(this);
        // 自家用車/社用車
        var homeUseInput = document.getElementById("home-use");
        homeUseInput.onclick = this.changeIsCompany.bind(this);
        var companyUseInput = document.getElementById("company-use");
        companyUseInput.onclick = this.changeIsCompany.bind(this);
        // 分類番号
        for (var i = 1; i <= NumberPlate.SMALL_NUMBER_COUNT; i++) {
            var input = document.getElementById("small_number" + i.toString());
            input.oninput = this.changeSmallNumber.bind(this);
        }
        // 一連指定番号
        for (var i = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
            var input = document.getElementById("large_number" + i.toString());
            input.oninput = this.changeLargeNumber.bind(this);
        }
        // pdf関連
        var printButton = document.getElementById("download-button");
        printButton.onclick = this.savePDF.bind(this);
        //ローディング画面非表示
        var loadingDiv = document.getElementById("loading");
        loadingDiv.classList.toggle('is-show');
    };
    //===================================
    // NumberPlateObserver
    //===================================
    Controller.prototype.onChangeLargeNumber = function (largeNumberList) {
        // 一連指定番号
        for (var i = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
            var input = document.getElementById("large_number" + i.toString());
            for (var j = 0; j < input.options.length; j++) {
                if (input.options[j].value == largeNumberList[i - 1]) {
                    input.options[j].selected = true;
                }
                else {
                    input.options[j].selected = false;
                }
            }
        }
    };
    //===================================
    // View変更時のCallback関数
    //===================================
    // ひらがな変更時callback関数
    Controller.prototype.changeHiragana = function () {
        var hiragana_input = document.getElementById("hiragana");
        var text = hiragana_input.value;
        this.numberPlate.setHiragana(text);
    };
    // 運輸支局変更時callback関数
    Controller.prototype.changeKanji = function () {
        var kanjiInput = document.getElementById("kanji");
        var text = kanjiInput.value;
        this.numberPlate.setKanji(text);
    };
    // 一連指定番号変更時callback関数
    Controller.prototype.changeLargeNumber = function () {
        var largeNumberList = [];
        for (var i = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
            var input = document.getElementById("large_number" + i.toString());
            largeNumberList.push(input.value);
        }
        this.numberPlate.setLargeNumber(largeNumberList);
    };
    // 分類番号変更時callback関数
    Controller.prototype.changeSmallNumber = function () {
        var smallNumberList = [];
        for (var i = 1; i <= NumberPlate.SMALL_NUMBER_COUNT; i++) {
            var input = document.getElementById("small_number" + i.toString());
            smallNumberList.push(input.value);
        }
        this.numberPlate.setSmallNumber(smallNumberList);
    };
    // 普通自動車/軽自動車変更時callback関数
    Controller.prototype.changeCarType = function () {
        var carTypeInput = document.getElementById("normal-car");
        if (carTypeInput.checked) {
            this.numberPlate.setCarType(NumberPlate.NORMAL_CAR);
        }
        else {
            this.numberPlate.setCarType(NumberPlate.KEI_CAR);
        }
    };
    // 自家用車/社用車変更時callback関数
    Controller.prototype.changeIsCompany = function () {
        var carTypeInput = document.getElementById("home-use");
        if (carTypeInput.checked) {
            this.numberPlate.setIsCompany(false);
        }
        else {
            this.numberPlate.setIsCompany(true);
        }
    };
    //===================================
    // PdfMake関連
    //===================================
    // pdfを表示する
    Controller.prototype.savePDF = function () {
        var docDefinition = this.createDocDefinition();
        PDFMake.createPdf(docDefinition).open();
    };
    // pdfを印刷する
    // @note iOS版Safariで動作せず。
    Controller.prototype.printPDF = function () {
        var docDefinition = this.createDocDefinition();
        PDFMake.createPdf(docDefinition).print();
    };
    //createDocDefinition(): PDFMake.TDocumentDefinitions {
    Controller.prototype.createDocDefinition = function () {
        //===================================
        // 各種寸法作成
        //===================================
        // スケール取得
        var scaleInput = document.getElementById("scale");
        var scale_text = scaleInput.value;
        // 描画するプレートのサイズを計算
        var scale = 1 / Number(scale_text);
        var plateWidth = Setting.mm2pt(Setting.PLATE_WIDTH_MM * scale);
        // 各種マージン
        var plateMargin = Setting.mm2pt(10);
        var pageMargin = Setting.mm2pt(20);
        // ナンバープレート画像取得
        var small_base64 = this.numberPlate.toDataURL();
        this.numberPlate.setIsLarge(true);
        var large_base64 = this.numberPlate.toDataURL();
        this.numberPlate.setIsLarge(false);
        // pdf設定
        var docDefinition = {
            pageSize: "A4",
            pageMargins: pageMargin,
            content: [
                {
                    columns: [
                        {
                            image: small_base64,
                            width: plateWidth,
                        },
                        {
                            text: "",
                            width: plateMargin
                        },
                        {
                            image: large_base64,
                            width: plateWidth
                        },
                        {
                            text: "",
                            width: plateMargin
                        },
                        {
                            image: small_base64,
                            width: plateWidth,
                        },
                        {
                            text: "",
                            width: plateMargin
                        },
                        {
                            image: large_base64,
                            width: plateWidth,
                        }
                    ]
                }
            ]
        };
        return docDefinition;
    };
    return Controller;
}(NumberPlateObserver));
module.exports = Controller;
//# sourceMappingURL=controller.js.map