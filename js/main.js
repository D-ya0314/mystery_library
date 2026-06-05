"use strict";

/*---------- ハンバーガーメニュー ----------*/
const hamburger = document.querySelector(".js_hamburger");
const navigation = document.querySelector(".js_nav");
const body = document.querySelector(".js_body");
let dwmkbn = 0;

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("is-active");
  navigation.classList.toggle("is-active");
  // body.classList.toggle("is-active");
  if (body.classList.contains("is-active")) {
    enableScroll();
  } else {
    disableScroll();
  }
  if (dwmkbn === 0) {
    dwmkbn = 1;
  } else {
    dwmkbn = 0;
  }
});

// PC幅でナビゲーションをクリックしても"is-active"がつかないようにします
navigation.addEventListener("click", () => {
  if (window.innerWidth < 1080) {
    hamburger.classList.toggle("is-active");
    navigation.classList.toggle("is-active");
    // body.classList.toggle("is-active");
    if (body.classList.contains("is-active")) {
      enableScroll();
    } else {
      disableScroll();
    }
  }
});

// スマホ（ハンバーガーメニューをクリック）→PC→スマホに画面幅が変更されたとき、強制的に"is-active"を外す
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1080) {
    hamburger.classList.remove("is-active");
    navigation.classList.remove("is-active");
    body.classList.remove("is-active");
  }
});

/*---------- スライドによるヘッダの表示 ----------*/
let lastScrollY = window.scrollY;
let threshold = 100; // 500px 上から以上スクロールしたら反応
let timeout;
let isFooterVisible = false;
const footer = document.querySelector(".l_footer");
const header = document.querySelector(".js_header");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  // フッターが見えていたらスクロール判定はしない
  if (isFooterVisible) return;

  clearTimeout(timeout); // 既存のタイマーをリセット

  if (currentScrollY > lastScrollY && currentScrollY > threshold) {
    header.classList.remove("is-active");
  } else {
    header.classList.remove("is-active");
  }

  lastScrollY = currentScrollY;

  // スクロールが止まったら 1 秒後にヘッダーを非表示
  timeout = setTimeout(() => {
    // スクロールされていない場合は表示
    if (lastScrollY === 0) return;
    // ドロワーメニューが開かれている場合は表示
    if (dwmkbn === 1) return;
    header.classList.add("is-active");
  }, 1000);
});

// フッターの可視状態を監視
const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log("フッターが見えた！ヘッダーを隠す");
        isFooterVisible = true;
        header.classList.add("is-active");
      } else {
        console.log("フッターが見えなくなった！スクロール判定を再開");
        isFooterVisible = false;
      }
    });
  },
  {
    root: null, // ビューポート（画面）基準
    threshold: 0.2, // 10% 見えたら発動
  },
);

observer.observe(footer);

let scrollY;

function disableScroll() {
  scrollY = window.scrollY;

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  body.style.paddingRight = `${scrollbarWidth}px`;
  body.style.top = `-${scrollY}px`;
  body.classList.add("is-active");
}

function enableScroll() {
  body.style.paddingRight = "";
  body.style.top = "";
  window.scrollTo(0, scrollY);
  body.classList.remove("is-active");
}

// safariかを判別
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Chromeかを判別
function isChrome() {
  return (
    /chrome/i.test(navigator.userAgent) &&
    !/edge|edg|opr|opera/i.test(navigator.userAgent)
  );
}

// 状態変数
let currentPuzzle = 99;
let inputMode = "alphabet"; // alphabet, number, hiragana
let currentKey = null;
let pressCount = 0;
let pressTimeout;
let cursor = 0;
let callcounter = 0;
let hintCount = 0;
let input = "";
const result = document.getElementById("result");

/*---------- 幕開け ----------*/
function start(n) {
  document.querySelector(".start").classList.add("is-disable");
  document.querySelector(".js_body").classList.remove("is-active");
  // document.getElementById("don-sound").play();
  currentPuzzle = 0;

  // setTimeout(() => {
  document.getElementById("intro-overlay").style.display = "none";
  // document.getElementById("inPark").classList.add("is-active");
  // if (n === "o") {
  //   setTimeout(() => {
  //     document.getElementById("phoneCall").play();
  //     document.getElementById("phoneVibe").play();
  //   }, 3000);
  // }
  // if (n === "d") {
  //   document.getElementById("lock").play();
  // }

  // }, 2000); // 2秒後に切り替え
}

// 謎と答え
const puzzles = [
  {
    question:
      '<p>待ってる間の暇つぶしにどうぞ</p><p>32 7 16 8 = GeNSO</p> <p>3 35 18 39 = ?</p><p>ネットで調べてOK！<br>入力は小文字・半角</p> <input type=\'text\' id=\'answer\' class=\'m_answer\' placeholder=\'答えを入力\' /> <button class=\'m_btn\' id=\'solveBtn\' onclick="submitAnswer()"> 回答 </button> <p id=\'result\'class class=\'m_question_p\'></p><button class="m_btn" onclick="openModal(\'memo1\')"">表面を見る</button><button class="m_btn" onclick="openhint()">ヒント</button><p id="result" class="m_question_p"></p><div class="js_hint" id="hintMemo1"><p class="m_question_p">GeNSO...ゲンソ？</p> </div><div class="js_hint" id="hintMemo2"><p class="m_question_p">あ！もしかして元素記号の周期表かな！？※次のヒントは答えです</p> </div></div><div class="js_hint" id="hintMemo3"><p class="m_question_p">3はLi、35はBr、18はAr、39はY、だからlibraryが答えだ！</p> </div>',
    answer: "library",
  },
  {
    question:
      "<p class=\"m_question_p\">本を配架したら、上から、一桁目の箇所の文字を読んでね！<br>※ひらがな入力</p> <input type='text' id='answer' class='m_answer' placeholder='答えを入力' /> <button class='m_btn' id='solveBtn' onclick=\"submitAnswer()\"> 回答 </button> <p id='result'class class='m_question_p'></p>",
    answer: "はいか",
  },
  {
    question:
      '<p class="m_question_p">司書を目指す場合は、分類のルールを覚えておいてね。</p><div class="l_container-bunrui"><div><p class="m_red">147</p><div class="l_bunrui m_shikaku"><p class="m_quesiton_p">オブスターの心理学</p><p class="m_quesiton_p">魔おんなの心境</p><p class="m_quesiton_p">おとこ心のはじ</p></div></div><p class="m_question_p">=</p><div><p class="m_blue">417</p><div class="l_bunrui m_shikaku"><p class="m_quesiton_p">ガリレオのサイコロ</p><p class="m_quesiton_p">なんども一緒・確率</p><p class="m_quesiton_p">パスカル達のじろん</p></div></div></div><p>答え：<span class="m_red">23</span><span class="m_blue">4</span>い</p><p class="m_question_p"><br>※ひらがな入力</p> <input type=\'text\' id=\'answer\' class=\'m_answer\' placeholder=\'答えを入力\' /> <button class=\'m_btn\' id=\'solveBtn\' onclick="submitAnswer()"> 回答 </button> <p id=\'result\'class class=\'m_question_p\'></p>',
    answer: "ぶんるい",
  },
  {
    question:
      "<p class=\"m_question_p\">最近リファレンスは、AIを使われたり使われなかったり...</p><p class=\"m_question_p\">Aの本：「〇〇き」料理本<br>Bの本：有名な「〇〇〇〇」屋さん100選<br>Cの本：「〇〇〇き」のコツ</p><p class=\"m_question_p\">てりやきふぁんあててくれす<br>１１１２ ２ ４４４３３３５<br>※ひらがな入力</p><input type='text' id='answer' class='m_answer' placeholder='答えを入力' /> <button class='m_btn' id='solveBtn' onclick=\"submitAnswer()\"> 回答 </button> <p id='result'class class='m_question_p'></p>",
    answer: "りふぁれんす",
  },
  {
    question:
      "<div class=\"l_img-box\"><img src=\"img/shuuri_nazo.png\" alt=\"\" class=\"m_img\" width=\"500\" height=\"500\"/></div><p class=\"m_question_p\">「この本を修理して～。できたらP.7の問題の答えを教えてね！」<br>※漢字入力</p> <input type='text' id='answer' class='m_answer' placeholder='答えを入力' /> <button class='m_btn' id='solveBtn' onclick=\"submitAnswer()\"> 回答 </button> <p id='result'class class='m_question_p'></p>",
    answer: "修理",
  },
];

function openQuestion() {
  document.getElementById("qP").innerHTML = puzzles[currentPuzzle].question;
  document.getElementById("answer").value = "";
  document.getElementById("result").textContent = "";
}

/*-------- モーダル表示 ---------*/
const modalText = {
  memo1:
    "<div id='qP'><p>配架：請求記号順に書架へ並べること<br>分類：資料を主題ごとに分類すること<br>リファレンス：利用者の「調べたい」「本を探してほしい」という疑問に対し、情報や資料を探し出すお手伝いをするサービスのこと<br>修復：利用や経年劣化で損傷した本や資料を、可能な限り元の姿に近づけて直すこと</p><button class='m_btn' onclick=\"openQuestion()\">裏面を見る</button></div>",
  memo1ura: "",
  memo2: '<div id="qP"></div>',
  memo3: '<div id="qP"></div>',
  memo4: '<div id="qP"></div>',
  memo5: '<div id="qP"></div>',
};

function openModal(modalId) {
  document.getElementById(modalId + "P").innerHTML = modalText[modalId];
  document.getElementById(modalId).classList.remove("is-disable");
}

document.querySelectorAll(".m_close-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest(".l_modal").classList.add("is-disable");
  });
});

// DOM

// 表示更新

// 現在日付の取得
function getNowDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 回答
function submitAnswer() {
  if (input === "") {
    input = document.getElementById("answer").value.trim().toLowerCase();
  }
  const guess = input;
  const result = document.getElementById("result");
  if (guess === puzzles[currentPuzzle].answer) {
    // 謎進行処理
    if (currentPuzzle === 0) {
      document.getElementById("memo1P").innerHTML = "";
      currentPuzzle++;
      input = "";
      // 次のセクションへ
      document.getElementById("section1").classList.remove("is-active");
      document.getElementById("section2").classList.add("is-active");
      hintCount = 0;
    } else if (currentPuzzle === 1) {
      document.getElementById("memo2P").innerHTML = "";
      currentPuzzle++;
      input = "";
      // 次のセクションへ
      document.getElementById("section2").classList.remove("is-active");
      document.getElementById("section3").classList.add("is-active");
      hintCount = 0;
    } else if (currentPuzzle === 2) {
      document.getElementById("memo3P").innerHTML = "";
      currentPuzzle++;
      input = "";
      // 次のセクションへ
      document.getElementById("section3").classList.remove("is-active");
      document.getElementById("section4").classList.add("is-active");
      hintCount = 0;
    } else if (currentPuzzle === 3) {
      document.getElementById("memo4P").innerHTML = "";
      currentPuzzle++;
      input = "";
      // 次のセクションへ
      document.getElementById("section4").classList.remove("is-active");
      document.getElementById("section5").classList.add("is-active");
      hintCount = 0;
    } else if (currentPuzzle === 4) {
      document.getElementById("memo5P").innerHTML = "";
      currentPuzzle++;
      input = "";
      // 次のセクションへ
      document.getElementById("section5").classList.remove("is-active");
      document.getElementById("goodEnd").classList.add("is-active");
      hintCount = 0;
    }
  } else {
    result.textContent = ".";
    setTimeout(() => {
      input = "";
      result.textContent = "違うみたい...";
    }, 50);
    setTimeout(() => {
      document.getElementById("bubuu").play();
    }, 400);
  }
}

// ヒント
function openhint() {
  if (currentPuzzle === 99) {
    const hint1 = document.getElementById("hintExample1");
    const hint2 = document.getElementById("hintExample2");
    const hint3 = document.getElementById("hintExample3");
    if (hintCount === 0) {
      hint1.classList.toggle("is-active");
      hintCount = 1;
    } else if (hintCount === 1) {
      hint2.classList.toggle("is-active");
      hintCount = 2;
    } else if (hintCount === 2) {
      hint3.classList.toggle("is-active");
      hintCount = 3;
    } else if (hintCount === 3) {
      hint1.classList.toggle("is-active");
      hint2.classList.toggle("is-active");
      hint3.classList.toggle("is-active");
      hintCount = 0;
    }
  } else if (currentPuzzle === 0) {
    const hint1 = document.getElementById("hintMemo1");
    const hint2 = document.getElementById("hintMemo2");
    const hint3 = document.getElementById("hintMemo3");
    if (hintCount === 0) {
      hint1.classList.toggle("is-active");
      hintCount = 1;
    } else if (hintCount === 1) {
      hint2.classList.toggle("is-active");
      hintCount = 2;
    } else if (hintCount === 2) {
      hint3.classList.toggle("is-active");
      hintCount = 3;
    } else if (hintCount === 3) {
      hint1.classList.toggle("is-active");
      hint2.classList.toggle("is-active");
      hint3.classList.toggle("is-active");
      hintCount = 0;
    }
  } else if (currentPuzzle === 1) {
    const hint1 = document.getElementById("hintHaika1");
    const hint2 = document.getElementById("hintHaika2");
    const hint3 = document.getElementById("hintHaika3");
    if (hintCount === 0) {
      hint1.classList.toggle("is-active");
      hintCount = 1;
    } else if (hintCount === 1) {
      hint2.classList.toggle("is-active");
      hintCount = 2;
    } else if (hintCount === 2) {
      hint3.classList.toggle("is-active");
      hintCount = 3;
    } else if (hintCount === 3) {
      hint1.classList.toggle("is-active");
      hint2.classList.toggle("is-active");
      hint3.classList.toggle("is-active");
      hintCount = 0;
    }
  } else if (currentPuzzle === 2) {
    const hint1 = document.getElementById("bunrui1");
    const hint2 = document.getElementById("bunrui2");
    const hint3 = document.getElementById("bunrui3");
    const hint4 = document.getElementById("bunrui4");
    const hint5 = document.getElementById("bunrui5");
    if (hintCount === 0) {
      hint1.classList.toggle("is-active");
      hintCount = 1;
    } else if (hintCount === 1) {
      hint2.classList.toggle("is-active");
      hintCount = 2;
    } else if (hintCount === 2) {
      hint3.classList.toggle("is-active");
      hintCount = 3;
    } else if (hintCount === 3) {
      hint4.classList.toggle("is-active");
      hintCount = 4;
    } else if (hintCount === 4) {
      hint5.classList.toggle("is-active");
      hintCount = 5;
    } else if (hintCount === 5) {
      hint1.classList.toggle("is-active");
      hint2.classList.toggle("is-active");
      hint3.classList.toggle("is-active");
      hint4.classList.toggle("is-active");
      hint5.classList.toggle("is-active");
      hintCount = 0;
    }
  } else if (currentPuzzle === 3) {
    const hint1 = document.getElementById("reference1");
    const hint2 = document.getElementById("reference2");
    const hint3 = document.getElementById("reference3");
    const hint4 = document.getElementById("reference4");
    const hint5 = document.getElementById("reference5");
    if (hintCount === 0) {
      hint1.classList.toggle("is-active");
      hintCount = 1;
    } else if (hintCount === 1) {
      hint2.classList.toggle("is-active");
      hintCount = 2;
    } else if (hintCount === 2) {
      hint3.classList.toggle("is-active");
      hintCount = 3;
    } else if (hintCount === 3) {
      hint4.classList.toggle("is-active");
      hintCount = 4;
    } else if (hintCount === 4) {
      hint5.classList.toggle("is-active");
      hintCount = 5;
    } else if (hintCount === 5) {
      hint1.classList.toggle("is-active");
      hint2.classList.toggle("is-active");
      hint3.classList.toggle("is-active");
      hint4.classList.toggle("is-active");
      hint5.classList.toggle("is-active");
      hintCount = 0;
    }
  } else if (currentPuzzle === 4) {
    const hint1 = document.getElementById("shuri1");
    const hint2 = document.getElementById("shuri2");
    const hint3 = document.getElementById("shuri3");
    const hint4 = document.getElementById("shuri4");
    const hint5 = document.getElementById("shuri5");
    if (hintCount === 0) {
      hint1.classList.toggle("is-active");
      hintCount = 1;
    } else if (hintCount === 1) {
      hint2.classList.toggle("is-active");
      hintCount = 2;
    } else if (hintCount === 2) {
      hint3.classList.toggle("is-active");
      hintCount = 3;
    } else if (hintCount === 3) {
      hint4.classList.toggle("is-active");
      hintCount = 4;
    } else if (hintCount === 4) {
      hint5.classList.toggle("is-active");
      hintCount = 5;
    } else if (hintCount === 5) {
      hint1.classList.toggle("is-active");
      hint2.classList.toggle("is-active");
      hint3.classList.toggle("is-active");
      hint4.classList.toggle("is-active");
      hint5.classList.toggle("is-active");
      hintCount = 0;
    }
  }
}

// 謎をとばすボタン処理
function passQuestion() {
  input = puzzles[currentPuzzle].answer;
  submitAnswer();
}

// 前の謎に戻るボタン処理
function buckQuestion() {
  if (currentPuzzle === 1) {
    document.getElementById("memo1").classList.add("is-disable");
    document.getElementById("memo2P").innerHTML = "";
    currentPuzzle--;
    input = "";
    // 前のセクションへ
    document.getElementById("section2").classList.remove("is-active");
    document.getElementById("section1").classList.add("is-active");
    hintCount = 0;
  } else if (currentPuzzle === 2) {
    document.getElementById("memo2").classList.add("is-disable");
    document.getElementById("memo3P").innerHTML = "";
    currentPuzzle--;
    input = "";
    // 次のセクションへ
    document.getElementById("section3").classList.remove("is-active");
    document.getElementById("section2").classList.add("is-active");
    hintCount = 0;
  } else if (currentPuzzle === 3) {
    document.getElementById("memo3").classList.add("is-disable");
    document.getElementById("memo4P").innerHTML = "";
    currentPuzzle--;
    input = "";
    // 次のセクションへ
    document.getElementById("section4").classList.remove("is-active");
    document.getElementById("section3").classList.add("is-active");
    hintCount = 0;
  } else if (currentPuzzle === 4) {
    document.getElementById("memo4").classList.add("is-disable");
    document.getElementById("memo5P").innerHTML = "";
    currentPuzzle--;
    input = "";
    // 次のセクションへ
    document.getElementById("section5").classList.remove("is-active");
    document.getElementById("section4").classList.add("is-active");
    hintCount = 0;
  }
}

const booksData = [
  { title: "物はここにある", num: "114" },
  { title: "環境工学とコウガイ", num: "519" },
  { title: "タプコプ", num: "211" },
  { title: "はれの見分け", num: "451" },
  { title: "初心けいえい術", num: "315" },
  { title: "みんなのかちく", num: "645" },
];

const slots = document.querySelectorAll(".m_slot");
const outside = document.getElementById("outside");

let dragged = null;

// 本生成
booksData.forEach((data, index) => {
  const book = document.createElement("div");
  book.className = "m_book";
  book.draggable = true;

  book.innerHTML = `
    <div class="book-title">${data.title}</div>
    <div class="book-num">${data.num}</div>
  `;

  book.addEventListener("dragstart", () => {
    dragged = book;
  });
  // 初期配置
  if (index === 0) {
    slots[2].appendChild(book); // 上段1マス目
  } else if (index === 5) {
    slots[4].appendChild(book); // 下段2マス目
  } else {
    outside.appendChild(book); // 残りは外
  }
});

// スロット処理
slots.forEach((slot) => {
  slot.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  slot.addEventListener("drop", (e) => {
    e.preventDefault();

    if (!dragged) return;

    // すでに本がある場合は入れ替え
    if (slot.firstChild) {
      outside.appendChild(slot.firstChild);
    }

    slot.appendChild(dragged);
  });
});

// 外に戻す
outside.addEventListener("dragover", (e) => {
  e.preventDefault();
});

outside.addEventListener("drop", (e) => {
  e.preventDefault();

  if (dragged) {
    outside.appendChild(dragged);
  }
});
