$(document).ready(function () {
    // ナビゲーションバー1のリンクを取得
    const navbarLinks = document.querySelectorAll('.navbar-nav .nav-link');
    // ナビゲーションバー2のリンクを取得
    const listLinks = document.querySelectorAll('.list-unstyled .load-page');

    // クリックイベントリスナーの設定
    navbarLinks.forEach(link => {
        link.addEventListener('click', function() {
            // 現在のactiveクラスを削除
            navbarLinks.forEach(navLink => navLink.classList.remove('active'));
            listLinks.forEach(listLink => listLink.classList.remove('active'));

            // クリックされたリンクにactiveクラスを追加
            this.classList.add('active');
        });
    });

    listLinks.forEach(link => {
        link.addEventListener('click', function() {
            // 現在のactiveクラスを削除
            listLinks.forEach(listLink => listLink.classList.remove('active'));
            navbarLinks.forEach(navLink => navLink.classList.remove('active'));

            // クリックされたリンクにactiveクラスを追加
            this.classList.add('active');
        });
    });

    // ページが読み込まれたときに、URLに対応するリンクにactiveクラスを付ける
    const currentUrl = window.location.href.split('?')[0]; // クエリパラメータを除去

    navbarLinks.forEach(navLink => {
        if (navLink.href === currentUrl) {
            navLink.classList.add('active');
        }
    });

    listLinks.forEach(listLink => {
        if (listLink.href === currentUrl) {
            // 対応するnavbarLinkにもactiveクラスを付ける
            navbarLinks.forEach(navLink => {
                if (navLink.href === currentUrl) {
                    navLink.classList.add('active');
                }
            });
        }
    });

    //----
    const btnScrollTop = document.getElementById("btnScrollTop");

    window.addEventListener("scroll", function () {
        if (window.scrollY > 100) {
            btnScrollTop.classList.add("show");
        } else {
            btnScrollTop.classList.remove("show");
        }

        // Calculate the scale based on scroll position
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const scrollFraction = window.scrollY / maxScroll;
        const scale = Math.min(Math.max(scrollFraction, 0.5), 1); // Scale between 0.5 and 1

        // Apply the scale to the button
        btnScrollTop.style.width = `${50 * scale}px`;
        btnScrollTop.style.height = `${50 * scale}px`;
        btnScrollTop.style.borderWidth = `${2 * scale}px`;
    });

    btnScrollTop.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
    ///
    const links = document.querySelectorAll('.load-page');

    links.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const url = this.getAttribute('href');
            loadPageIntoIframe(url);
        });
    });
    //----
    $('.btn-img-save').click(function() {
        // ボタンに関連付けられたkey属性を取得
        var key = $(this).data('key');
        
        // 保存したいdiv要素を選択
        var divToCapture = $('#' + key)[0];
        
        // div要素をCanvasに変換
        html2canvas(divToCapture).then(function(canvas) {
            // Canvasを画像として保存
            var image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            var link = document.createElement('a');
            link.setAttribute('download', 'capturedImage.png');
            link.setAttribute('href', image);
            link.click();
        });
    });
    // URLから願望のIDを取得
    var urlParams = new URLSearchParams(window.location.search);
    var wishId = urlParams.get('wish');
    if (wishId) {
        // 願望のIDがある場合は、その願望のみを表示
        var wish = JSON.parse(localStorage.getItem(wishId));
        if (wish) {
            displayWish(wishId, wish);
        } else {
            // アラートメッセージを表示
            $('#alertMessage').fadeIn();
        }
        return;
    }

    $('#wishModal').on('hide.bs.modal', function (e) {
        // モーダルが表示されるときにフォームのエラーステートをリセットする
        $('#wishForm').removeClass('was-validated');
    });

    // 願望のIDがない場合は、通常の処理を実行
    $('#submitWish').on('click', function () {
        // フォームのバリデーションチェック
        if ($('#wishForm')[0].checkValidity()) {
            var nickname = $('#nickname').val();
            var content = $('#content').val();
            var lifecycle = $('#lifecycle').val();
            var now = new Date();
            var deleteAt = new Date(now.getTime() + lifecycle * 60 * 60 * 1000);
            var wish = { nickname: nickname, content: content, deleteAt: deleteAt };
            localStorage.setItem(now.getTime(), JSON.stringify(wish));
            displayWish(now.getTime(), wish);
            $('#wishForm')[0].reset();
            $('#wishModal').modal('hide');
        } else {
            // フォームがバリデーションエラーの場合は、フォームのスタイルを変更してユーザーにエラーを通知する
            $('#wishForm').addClass('was-validated');
        }
    });


    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var wish = JSON.parse(localStorage.getItem(key));
        if (new Date(wish.deleteAt) > new Date()) {
            displayWish(key, wish);
        } else {
            localStorage.removeItem(key);
        }
    }

    setInterval(function () {
        var now = new Date();
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            var wish = JSON.parse(localStorage.getItem(key));
            if (new Date(wish.deleteAt) < now) {
                localStorage.removeItem(key);
                $('#' + key).remove();
            }
        }
    }, 1000);

    //----
    
function displayWish(key, wish) {
    var newWish = $('<div>', { id: key, class: 'col wish' }).append(
        $('<div>', { class: 'card shadow-sm' }).append(
            $('<div>', { class: 'progress' }).append(
                $('<div>', {
                    class: 'progress-bar progress-bar-striped progress-bar-animated w-100',
                    role: 'progressbar',
                }).attr('id', 'progress-' + key)
            ),
            $('<div>', { class: 'card-body d-flex flex-column justify-content-between' }).append(
                $('<div>').append(
                    $('<h5>', { class: 'card-title' }).text(wish.nickname),
                    $('<p>', { class: 'card-text' }).text(wish.content),
                    $('<p>', { class: 'card-text' }).append(
                        $('<small>', { class: 'text-muted float-end' }).text('終了日時: ' + new Date(wish.deleteAt).toLocaleString())
                    )
                ),
                $('<div class="mt-2 mb-0">').append(
                    $('<button>', {
                        class: 'btn btn-sm btn-light btn-share me-2',
                        'data-key': key,
                        'data-flg': 1
                    }).html('<i class="bi bi-instagram btn-instagram "></i>'),
                    $('<button>', {
                        class: 'btn btn-sm btn-light btn-share me-2',
                        'data-key': key,
                        'data-flg': 2
                    }).html('<i class="bi bi-facebook btn-facebook "></i>'),
                    $('<button>', {
                        class: 'btn btn-sm btn-light btn-share me-2',
                        'data-key': key,
                        'data-flg': 3
                    }).html('<i class="bi bi-twitter btn-twitter "></i>'),
                    $('<button>', {
                        class: 'btn btn-sm btn-outline-primary btn-share btn-img-save me-2',
                        'data-key': key,
                        'data-flg': 4
                    }).html('<i class="bi bi-save"></i>'),
                    $('<button>', {
                        class: 'btn btn-sm btn-outline-primary btn-share me-2',
                        'data-key': key,
                        'data-flg': 0
                    }).html('<i class="bi bi-link-45deg"></i>'),                    
                    $('<button>', {
                        class: 'btn btn-sm btn-outline-danger btn-delete float-end',
                        'data-key': key
                    }).html('<i class="bi bi-trash"></i>')
                )
            )
        )
    );

    var wishes = $('#wishList').children().get();
    wishes.push(newWish.get(0));

    wishes.sort(function (a, b) {
        var aDate = new Date($(a).find('.text-muted').text().replace('終了日時: ', ''));
        var bDate = new Date($(b).find('.text-muted').text().replace('終了日時: ', ''));
        return aDate - bDate;
    });

    $('#wishList').empty().append(wishes);

    $('#wishList .wish').each(function (index) {
        var animationSpeed = '4.5s';
        $(this).find('.progress-bar').removeClass('bg-danger bg-warning').text("");
        if (index === 0) {
            $(this).find('.progress-bar').addClass('bg-danger').text("一番早く消えます!");
            animationSpeed = '1s';
        } else if (index === 1) {
            $(this).find('.progress-bar').addClass('bg-warning').text("");
            animationSpeed = '2s';
        }
        $(this).find('.card').css('animation-duration', animationSpeed);
    });

    updateProgressBar(key, wish);

    $('.btn-share').off('click').on('click', function () {
        var kbn = $(this).data('flg');
        if (kbn === 0) {
            var key = $(this).data('key');
            var link = generateShareLink(key);
            copyToClipboard(link);
            var tooltip = new bootstrap.Tooltip(this, {
                title: "Link copied!",
                trigger: "manual",
                placement: "bottom"
            });
            tooltip.show();
            setTimeout(function () {
                tooltip.hide();
            }, 3000);
        } else if (kbn === 1) {//instagram   

        } else if (kbn === 2) {//fb

        } else if (kbn === 3) {//tw

        }
    });

    $('.btn-delete').off('click').on('click', function () {
        var key = $(this).data('key');
        if (confirm("願いメッセージを本当に削除しますか？")) {
            deleteWish(key);
        }
    });
}

function updateProgressBar(key, wish) {
    var intervalId = setInterval(function () {
        var now = new Date();
        var deleteAt = new Date(wish.deleteAt);
        var totalTime = deleteAt - new Date(parseInt(key));
        var remainingTime = deleteAt - now;
        var progress = (remainingTime / totalTime) * 100;
        $('#progress-' + key).css('width', progress + '%');
        if (remainingTime <= 0) {
            clearInterval(intervalId);
        }
    }, 1000);
}

// 共有リンクを生成する関数を更新
function generateShareLink(key) {
    var baseUrl = window.location.href.split('?')[0];
    return baseUrl + '?wish=' + key; // 願望のIDをURLパラメータとして追加
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function deleteWish(key) {
    localStorage.removeItem(key);
    $('#' + key).remove();
}
///
function loadPageIntoIframe(url) {
    // wishListを非表示にする
    document.getElementById('wishList').style.display = 'none';

    // 既存のiframeを削除する
    const existingIframe = document.getElementById('dynamicIframe');
    if (existingIframe) {
        existingIframe.remove();
    }

    // iframeを作成する
    const iframe = document.createElement('iframe');
    iframe.id = 'dynamicIframe';
    iframe.style.width = '100%';
    iframe.style.height = '560px'; // 初期高さを設定、必要に応じて調整
    iframe.style.border = 'none';

    // iframeのsrcに直接ファイルパスを設定
    iframe.src = url;

    // iframeをwishListの前に挿入する
    const wishList = document.getElementById('wishList');
    wishList.parentNode.insertBefore(iframe, wishList);
}

});
