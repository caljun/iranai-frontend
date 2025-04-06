document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.querySelector(".gallery");
    const profileUrl = document.getElementById("profileUrl");
    const userUrl = document.getElementById("userUrl");
    const profileIcon = document.getElementById("profileIcon");
    const profileImageUpload = document.getElementById("profileImageUpload");
    const fabBtn = document.getElementById("fabAddPost");
  
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(location.search);
    const otherUser = urlParams.get("user");
    let posts = [];
  
    // 投稿一覧の描画
    function renderPosts(posts) {
      gallery.innerHTML = "";
      posts.forEach((post) => {
        const postBox = document.createElement("div");
        postBox.classList.add("post-box");
        postBox.innerHTML = `<img src="${post.image}" alt="投稿画像">`;
        postBox.querySelector("img").addEventListener("click", () => {
          window.location.href = `post.html?id=${post._id}`;
        });
        gallery.appendChild(postBox);
      });
    }
  
    // 他人プロフィール時のUI制御
    function hideMyProfileElements() {
      if (fabBtn) fabBtn.style.display = "none";
      if (profileUrl) profileUrl.style.display = "none";
      if (profileIcon) profileIcon.style.pointerEvents = "none";
      if (profileImageUpload) profileImageUpload.style.display = "none";
    }
  
    // 投稿取得（自分 or 他人）
    async function fetchPosts() {
      try {
        let res;
        if (otherUser) {
          res = await fetch(`https://iranai-backend.onrender.com/posts/user/${otherUser}`);
        } else {
          res = await fetch("https://iranai-backend.onrender.com/posts/me", {
            headers: { Authorization: token },
            credentials: "include"
          });
        }
  
        posts = await res.json();
        renderPosts(posts);
  
        if (otherUser) hideMyProfileElements();
      } catch (err) {
        console.error("投稿取得エラー:", err);
      }
    }
  
    // 投稿追加
    window.addPost = function (name, image, category, reason) {
        if (!name || !image || !category || !reason) {
          alert("全ての項目を入力してください！");
          return;
        }
      
        fetch("https://iranai-backend.onrender.com/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify({ name, image, category, reason }),
          credentials: "include"
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.post) {
              fetchPosts(); // 投稿後に再取得
            } else {
              alert("投稿に失敗しました");
            }
          })
          .catch((err) => {
            console.error("投稿エラー:", err);
            alert("サーバーエラーが発生しました");
          });
      };
      
  
    // プロフィールURL表示（自分のみ）
    const storedUserUrl = localStorage.getItem("userUrl");
    if (storedUserUrl && !otherUser) {
      profileUrl.style.display = "block";
      userUrl.textContent = storedUserUrl;
      userUrl.href = storedUserUrl;
      userUrl.target = "_blank";
    }
  
    // プロフィール画像の読み込み
    const savedImage = localStorage.getItem("profileImage");
    if (profileIcon && savedImage && token) {
      profileIcon.src = savedImage;
    }
  
    // プロフィール画像のアップロード
    if (profileIcon && profileImageUpload) {
      profileIcon.addEventListener("click", () => profileImageUpload.click());
      profileIcon.addEventListener("touchstart", () => profileImageUpload.click());
  
      profileImageUpload.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            profileIcon.src = e.target.result;
            localStorage.setItem("profileImage", e.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  
    // モーダル起動（投稿追加）
    if (fabBtn) {
      fabBtn.addEventListener("click", () => {
        if (window.openModal) {
          window.openModal();
        } else {
          alert("モーダルが開けませんでした");
        }
      });
  
      fabBtn.addEventListener("touchstart", () => {
        if (window.openModal) {
          window.openModal();
        }
      });
    }
    // ≡ メニュー開閉処理（＋閉じる処理も追加）
    const menuIcon = document.getElementById("menuIcon");
    const sideMenu = document.getElementById("sideMenu");

    if (menuIcon && sideMenu) {
    // 開閉トグル
    menuIcon.addEventListener("click", function () {
       sideMenu.classList.toggle("open");
     });

    // メニュー内リンクを押したらメニューを閉じる
    const menuLinks = sideMenu.querySelectorAll("a");
    menuLinks.forEach(link => {
       link.addEventListener("click", () => {
       sideMenu.classList.remove("open");
       });
     });

    // メニュー外をクリックしたら閉じる
    document.addEventListener("click", function (e) {
        if (
        sideMenu.classList.contains("open") &&
        !sideMenu.contains(e.target) &&
        e.target !== menuIcon
          ) {
        sideMenu.classList.remove("open");
        }
       });
     }

  
    // ログアウト処理
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        localStorage.clear();
        window.location.href = "login.html"; // 遷移先がなければ変更可能
      });
    }
  
    // 初期表示
    if (token) {
      fetchPosts(); // 自分の投稿一覧を取得して表示
    } else {
      gallery.innerHTML = "";         // 投稿一覧は空
      hideMyProfileElements();        // URL表示・編集系を非表示
      fabBtn.style.display = "block"; // ＋ボタンは表示しておく
    }
  });
  