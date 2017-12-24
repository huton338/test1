window.onload = function () {

    const can = $("canvas")[0];
    const ctx = can.getContext("2d");
    let get_array = [];
    let length;
    let memo_num = 0;
    let memo_data;
    let array = [];
    let del_array = [];
    var count = 0;
    let obj = {};
    const zero = 0;
    let filepath;
    let x, y;
    let oldX, oldY; //終了点のY座標を保存
    let flag = false; //マウスが押されてるか押されてないかを判定する変数
    let url;

    if (localStorage.getItem("memo_num")) {
        memo_num = localStorage.getItem("memo_num");
    }

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyC1eM3mFxMuUGgRXJU313-kNL8ev087R5E",
        authDomain: "test1-webapp.firebaseapp.com",
        databaseURL: "https://test1-webapp.firebaseio.com",
        projectId: "test1-webapp",
        storageBucket: "",
        messagingSenderId: "811900183092"
    };
    firebase.initializeApp(config);
    var firebase_dir = firebase.database().ref("user/")

    $("main").slideDown(3000);



    //メモ新規追加追加ファンクション
    let save_func = function save() {

        const value = $("#new_text_area").val();
        const memo_title = $("#new_text_title").val();
        obj = {
            "text": value,
            "title": memo_title
        };
        let memo_json = JSON.stringify(obj);
        push_obj = {
            "memo": memo_json,
            "memo_index": "aa"
        }
        memo_num = localStorage.getItem("memo_num");
        memo_num++
        //削除済み番号があるか判定
        if (localStorage.getItem("del_num")) {
            del_array = JSON.parse(localStorage.getItem("del_num"));
            let add_num = del_array[0];
            del_array.shift();
            if (del_array.length == 0) {
                localStorage.removeItem("del_num");
            } else {
                localStorage.setItem("del_num", JSON.stringify(del_array));
            }
            firebase.database().ref("user/" + "memo" + add_num).set(push_obj);
        } else {
            firebase.database().ref("user/" + "memo" + memo_num).set(push_obj);
        }
        $("#new_text_title").val("");
        $("#new_text_area").val("");
        $(".saved_memo").html("");
        getobj();
        localStorage.setItem("memo_num", memo_num);
        alert("saveしました");
    };

    //メモ削除ファンクション
    function remove() {
        let del_wait;
        if (localStorage.getItem("delete_wait")) {
            del_wait = localStorage.getItem("delete_wait");
        }
        firebase.database().ref("user/memo" + del_wait).remove();
        localStorage.setItem("memo_num", memo_num);
        localStorage.removeItem("delete_wait");
    };


    //1.Saveクリックイベント
    $("#save").on("click", save_func);

    //2.clear クリックイベント
    $("#clear").on("click", function () {
        $("#text_area").val("");
        firebase_dir.remove();
        localStorage.removeItem("memo_num");
        localStorage.removeItem("del_num");
        $(".saved_memo").html("");
        getobj();
        memo_num = 0;
        alert("clearしました");
    });

    // 3.ページ読み込み：保存データ取得表示
    // DBからオブジェクトの取得
    function getobj() {
        count = 0;
        var dfd = $.Deferred();
        firebase_dir.on("child_added", function (data) {
            var v = data.val();
            var k = data.key;
            console.log(data, v, k);
            memo_data = JSON.parse(v.memo);
            console.log(memo_data.title);
            console.log(memo_data.text);
            let index = v.memo_index;
            length = v.memo_len;
            count++;
            $(".saved_memo").append('<div class="layout" id="memo' + count + '"><button id="' + count + '"class="delete">×</button><input type="text" name="" class="title keep_title" id="title' + count + '" value="' + memo_data.title + '"><textarea class="text keep_text" id="text' + count + '">' + memo_data.text + '</textarea></div>');
            dfd.resolve();
        });
        dfd.done(function () {
            //削除処理
            $(document).on("click", ".delete", function (e) {
                $("#memo" + e.target.id).html("");
                //メモ合計数-１
                localStorage.setItem("memo_num", localStorage.getItem("memo_num") - 1);
                //DB削除
                firebase.database().ref("user/memo" + e.target.id).remove();
                //削除済みメモ番号配列に格納
                if (localStorage.getItem("del_num")) {
                    del_array = JSON.parse(localStorage.getItem("del_num"));
                    del_array.push(e.target.id);
                    console.log(del_array);
                    localStorage.setItem("del_num", JSON.stringify(del_array))

                } else {
                    del_array.push(e.target.id);
                    localStorage.setItem("del_num", JSON.stringify(del_array));
                }
            });　　 //更新処理 
            KeyPress();
        });
    };
    getobj();

    //Enter+Alt共通関数
    function KeyPress() {
        let value;
        let memo_title;

        //titleでEnter+Altを押すとtextへ移動
        $(".title").keydown(function (e) {
            if (e.keyCode == 13) {
                $(this).next().focus();
                return false;
            }
        });
        //textでEnter+Altを押すと更新
        $(".text").keydown(function (e) {
            if (event.altKey) {
                if (e.keyCode == 13) {
                    let change_num = e.target.id.slice(4);
                    console.log(e.target.id);
                    memo_title = $("#title" + change_num).val();
                    value = $("#text" + change_num).val();
                    console.log(memo_title);
                    console.log(value);
                    obj = {
                        "text": value,
                        "title": memo_title
                    };
                    let memo_json = JSON.stringify(obj);
                    let updates = {};
                    updates["user/" + "memo" + change_num + "/memo"] = memo_json;
                    firebase.database().ref().update(updates);
                    alert("更新しました。");
                    return false;
                }
            }
        })
    };
    KeyPress();

    //Enter+Alt新規作成
    function newcreatekey() {
        $("#new_text_area").keydown(function (e) {
            if (event.altKey) {
                if (e.keyCode == 13) {
                    save_func();
                    return false;
                }
            }
        });
    };
    newcreatekey();

    // //画像からcanvas変換
    // function trans_getcontext(filepath) {
    //     var img = new Image();
    //     img.src = filepath;
    //     img.onload = function () {
    //         ctx.drawImage(img, 0, 0)
    //     }
    //     return ctx;
    // };

    //OCR:文字認識
    function ocr(ctx) {
        // (読み込む画像、言語) jpeg || png
        Tesseract
            .recognize(ctx, {
                lang: 'jpn'
            }) //exp: jpn, eng
            .progress(function (message) {
                // 進歩状況の表示
                console.log('progress', message)
            })
            // 結果のコールバック
            .then(function (result) {
                let text_keep = $("#new_text_area").val();
                console.log(result.text);
                if (text_keep == "") {
                    $("#new_text_area").val(result.text.replace(/\r?\n/g, ""));
                } else {
                    $("#new_text_area").val(text_keep + "\n" + result.text.replace(/\r?\n/g, ""));
                }
            });
    }


    //アップロードファイルボタン
    $("#inputfile").on("change", function () {
        let file_obj = $("#inputfile")[0].files[0];
        console.log(file_obj);
        let reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                let keep_width = can.width;
                let keep_height = can.height;
                can.width = img.width;
                can.height = img.height;
                ctx.drawImage(img, 0, 0);
                ocr(ctx);
                ctx.clearRect(0, 0, can.width, can.height);
                can.width = keep_width;
                can.height = keep_height;
            }
        };
        reader.readAsDataURL(file_obj);
    });



    //canvas登録ボタン
    $("#trans_canvas").on("click", function () {
        ocr(ctx);
        ctx.clearRect(0, 0, can.width, can.height);
    });
    //canvasクリアボタン
    $("#clear_canvas").on("click", function () {
        ctx.clearRect(0, 0, can.width, can.height);
    });



    //canvasモーダルウィンドウ
    $("#modal_open").on("click", function () {
        if ($("#modal_overlay")[0]) return false; //新しくモーダルウィンドウを起動しない [下とどちらか選択]
        //if($("#modal-overlay")[0]) $("#modal-overlay").remove() ;		//現在のモーダルウィンドウを削除して新しく起動する [上とどちらか選択]

        modalResize();
        //オーバーレイ用のHTMLコードを、[body]内の最後に生成する
        $("body").append('<div id="modal_overlay"></div>');

        //[$modal-overlay]をフェードインさせる
        $("#modal_overlay,.modal_class").fadeIn("slow");

        $("#trans_canvas,#close_canvas").click(function () {
            $("#modal_overlay,.modal_class").fadeOut("slow", function () {
                //挿入した<div id="modal-bg"></div>を削除
                $("#modal_overlay").remove();
            });
        });
    });

    //ウインドウの中央値更新
    $(window).resize(modalResize);
    //ウィンドウの中央値算出関数
    function modalResize() {

        var w = $(window).width();
        var h = $(window).height();

        var cw = $(".modal_class").outerWidth();
        var ch = $(".modal_class").outerHeight();

        //取得した値をcssに追加する
        $(".modal_class").css({
            "left": ((w - cw) / 2) + "px",
            "top": ((h - ch) / 2) + "px"
        });
    }


    //canvasの設定
    $(can).on("mousedown", function (e) {
        flag = true;
        oldX = e.offsetX;
        oldY = e.offsetY;
    });

    $(can).on("mouseup mouseout", function () {
        flag = false;
    });

    $(can).on("mousemove", function (e) {
        if (flag) {
            x = e.offsetX;
            y = e.offsetY;

            ctx.beginPath();
            ctx.moveTo(oldX, oldY);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();

            oldX = x;
            oldY = y;
        }
    });

    //自作画像文字変換
    $("#trans_canvas").on("click", function () {
        ocr(ctx);
    });
}