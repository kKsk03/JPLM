"use strict";
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
var WebfontLoader = __importStar(require("webfontloader"));
var FontType = require("./FontType");
// コンストラクタで与えらえたcanvasに描画する
var CanvasWrapper = /** @class */ (function () {
    function CanvasWrapper(canvas) {
        //Webフォントの名前
        this.hiraganaFontName = 'Hiragana';
        this.kanjiFontName = 'Kanji';
        this.hiraganaCSS = '/css/hiragana.css';
        this.kanjiCSS = '/css/kanji.css';
        // 画像データ
        this.numberImg = {};
        this.IMAGE_FILE_NAME_LIST = [
            "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "・"
        ];
        this.canvas = canvas;
    }
    ;
    // 初期化
    CanvasWrapper.prototype.init = function (callback) {
        var load_num = this.IMAGE_FILE_NAME_LIST.length + 1;
        var func = function () {
            load_num = load_num - 1;
            if (load_num == 0) {
                callback();
            }
        };
        // Webフォントの読み込み
        WebfontLoader.load({
            custom: {
                families: [this.hiraganaFontName, this.kanjiFontName],
                urls: [this.hiraganaCSS, this.kanjiCSS]
            },
            active: func,
            inactive: this.toDataURL.bind(this),
        });
        // 画像の読み込み
        for (var i = 0; i < this.IMAGE_FILE_NAME_LIST.length; i++) {
            var fileName = this.IMAGE_FILE_NAME_LIST[i];
            var filePath = "img/" + fileName + ".png";
            this.numberImg[fileName] = new Image();
            this.numberImg[fileName].src = filePath;
            this.numberImg[fileName].onload = func;
        }
    };
    // canvasの画像をDataURL形式の文字列として返す
    CanvasWrapper.prototype.toDataURL = function () {
        return this.canvas.toDataURL();
    };
    // キャンバスのサイズを設定する
    CanvasWrapper.prototype.setSize = function (size) {
        this.canvas.width = size.width;
        this.canvas.height = size.height;
    };
    // 円を描画する
    CanvasWrapper.prototype.drawCircle = function (size, position, color) {
        if (!this.canvas.getContext) {
            return;
        }
        var context = this.canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.beginPath();
        context.arc(position.x, position.y, size.width / 2, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
        context.fillStyle = color;
        context.fill();
    };
    // 矩形を描画する
    CanvasWrapper.prototype.drawRect = function (size, position, color) {
        if (!this.canvas.getContext) {
            return;
        }
        var context = this.canvas.getContext('2d');
        if (!context) {
            return;
        }
        // 現在の文字を消す
        context.fillStyle = color;
        context.fillRect(position.x, position.y, size.width, size.height);
    };
    // 1文字を指定されたサイズ・位置・色で描画する
    // 数字に関しては画像データ(number_img)を利用して描画する
    CanvasWrapper.prototype.drawChar = function (char, size, position, color, trOption, fontType) {
        if (trOption === void 0) { trOption = CanvasWrapper.KEEP_ASPECT; }
        if (fontType === void 0) { fontType = FontType.SANS_SELF; }
        // 一文字に制限
        char = char.slice(0, 1);
        if (this.canDrawImage(char)) {
            this.drawNumberChar(char, size, position, color);
        }
        else {
            this.drawJpChar(char, size, position, color, trOption, fontType);
        }
    };
    // 引数に与えられた文字が数値文字であるかを返す。
    CanvasWrapper.isNumber = function (char) {
        var reg = /[0-9]/;
        return reg.test(char);
    };
    // 引数に与えられた文字の画像が用意されている場合true
    CanvasWrapper.prototype.canDrawImage = function (char) {
        if (this.IMAGE_FILE_NAME_LIST.indexOf(char) == -1) {
            return false;
        }
        return true;
    };
    // 指定された数字一文字を指定されたサイズ・位置・色で描画する
    CanvasWrapper.prototype.drawNumberChar = function (char, size, position, color) {
        if (!this.canvas.getContext) {
            return;
        }
        // 画像取得
        var img = this.numberImg[char];
        // colorで塗りつぶされた文字の作成
        var memCanvas = document.createElement("canvas");
        memCanvas.width = img.naturalWidth;
        memCanvas.height = img.naturalHeight;
        var mem_context = memCanvas.getContext('2d');
        if (!mem_context) {
            return;
        }
        // 一度すべてcolorで塗りつぶす
        mem_context.fillStyle = color;
        mem_context.fillRect(0, 0, memCanvas.width, memCanvas.height);
        // 画像ファイルでマスキング
        mem_context.globalCompositeOperation = 'destination-in';
        mem_context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        // 作成した文字を描写
        var context = this.canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.drawImage(memCanvas, position.x, position.y, size.width, size.height);
    };
    // 1文字を指定されたサイズ・位置・色で描画する
    CanvasWrapper.prototype.drawJpChar = function (char, size, position, color, trOption, fontType) {
        if (trOption === void 0) { trOption = CanvasWrapper.KEEP_ASPECT; }
        if (fontType === void 0) { fontType = FontType.SANS_SELF; }
        var MEM_CANVAS_HEIGHT = 500;
        var MEM_CANVAS_WIDTH = 500;
        // 文字画像データ作成用キャンパス作成
        var memCanvas = document.createElement("canvas");
        memCanvas.height = MEM_CANVAS_HEIGHT;
        memCanvas.width = MEM_CANVAS_WIDTH;
        // 文字の描写
        var context = memCanvas.getContext('2d');
        if (!context) {
            return;
        }
        context.fillStyle = "rgba(0, 0, 0, 0)";
        context.fillRect(0, 0, MEM_CANVAS_WIDTH, MEM_CANVAS_HEIGHT);
        context.fillStyle = color;
        if (fontType == FontType.SELF) {
            context.font = "300px " + this.hiraganaFontName;
        }
        else {
            context.font = "300px " + this.kanjiFontName;
        }
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillText(char, 0, 0);
        // 文字を覆う座標を取得
        var pixels = context.getImageData(0, 0, MEM_CANVAS_WIDTH, MEM_CANVAS_HEIGHT);
        var data = pixels.data;
        var left = MEM_CANVAS_WIDTH;
        var right = 0;
        var top = MEM_CANVAS_HEIGHT;
        var bottom = 0;
        for (var i = 0, len = data.length; i < len; i += 4) {
            var r = data[i], g = data[i + 1], b = data[i + 2], alpha = data[i + 3];
            if (alpha > 0) {
                var col = Math.floor((i / 4) % memCanvas.width);
                var row = Math.floor((i / 4) / memCanvas.width);
                if (left > col)
                    left = col;
                if (right < col)
                    right = col;
                if (top > row)
                    top = row;
                if (bottom < row)
                    bottom = row;
            }
        }
        var charSize = { width: right - left + 1, height: bottom - top + 1 };
        if (charSize.width / size.width < charSize.height / size.height) {
            if (trOption === CanvasWrapper.KEEP_ASPECT || trOption == CanvasWrapper.FIXED_HEIGHT) {
                var new_w = charSize.height * size.width / size.height;
                left -= Math.ceil((new_w - charSize.width) / 2);
                right += Math.ceil((new_w - charSize.width) / 2);
                charSize.width = right - left + 1;
            }
        }
        else {
            if (trOption === CanvasWrapper.KEEP_ASPECT || trOption == CanvasWrapper.FIXED_WIDTH) {
                var new_h = charSize.width * size.height / size.width;
                top -= Math.ceil((new_h - charSize.height) / 2);
                bottom += Math.ceil((new_h - charSize.height) / 2);
                charSize.height = bottom - top + 1;
            }
        }
        // 描写
        if (!this.canvas.getContext) {
            return;
        }
        var canvasContext = this.canvas.getContext('2d');
        if (!canvasContext) {
            return;
        }
        canvasContext.drawImage(memCanvas, left, top, charSize.width, charSize.height, position.x, position.y, size.width, size.height);
    };
    // tr_option
    CanvasWrapper.FIXED = 0;
    CanvasWrapper.FIXED_WIDTH = 1;
    CanvasWrapper.FIXED_HEIGHT = 2;
    CanvasWrapper.KEEP_ASPECT = 3;
    return CanvasWrapper;
}());
module.exports = CanvasWrapper;
//# sourceMappingURL=canvas_wrapper.js.map