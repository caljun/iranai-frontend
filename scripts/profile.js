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
        res = await fetch(`https://iranai-backend.onrender.com/posts/user-email/${otherUser}`);
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

  // ✅ サーバーからプロフィール画像を取得
  if (!otherUser && token && profileIcon) {
    fetch("https://iranai-backend.onrender.com/user/profile-image", {
      method: "GET",
      headers: {
        Authorization: token
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.profileImage) {
          profileIcon.src = data.profileImage;
          localStorage.setItem("profileImage", data.profileImage); // 任意キャッシュ
        }
      })
      .catch(err => {
        console.error("プロフィール画像取得エラー:", err);
      });
  }

  // プロフィール画像の読み込み
  const savedImage = localStorage.getItem("profileImage");
  if (profileIcon && savedImage && token) {
    profileIcon.src = savedImage;
  }

  // プロフィール画像のアップロード
  if (profileIcon && profileImageUpload && token) {
    let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  
    const triggerFileInput = () => profileImageUpload.click();
  
    // スマホ or タブレット
    if (isTouchDevice) {
      profileIcon.addEventListener("touchstart", triggerFileInput);
    } else {
      // PC
      profileIcon.addEventListener("click", triggerFileInput);
    }
  
    profileImageUpload.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const base64Image = e.target.result;
          profileIcon.src = e.target.result;
          localStorage.setItem("profileImage", base64Image);

          fetch("https://iranai-backend.onrender.com/user/profile-image", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: token
            },
            body: JSON.stringify({ image: base64Image })
          })
            .then(res => res.json())
            .then(data => {
                console.log("プロフィール画像保存完了:" , data);
              })
              .catch(err => {
                console.error("プロフィール画像保存エラー:", err);
              });
        };
        reader.readAsDataURL(file);
        profileImageUpload.value = "";
      }
    });
  } else {
    if (profileIcon) {
      profileIcon.style.pointerEvents = "none";
      profileIcon.style.opacity = "0.5";
      profileIcon.title = "変更できません";
    }
  }  

  // 投稿モーダル起動
  if (fabBtn && token) {
    fabBtn.style.display = "block";
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

  // ≡ メニュー開閉処理
  const menuIcon = document.getElementById("menuIcon");
  const sideMenu = document.getElementById("sideMenu");

  if (menuIcon && sideMenu) {
    menuIcon.addEventListener("click", function () {
      sideMenu.classList.toggle("open");
    });

    const menuLinks = sideMenu.querySelectorAll("a");
    menuLinks.forEach(link => {
      link.addEventListener("click", () => {
        sideMenu.classList.remove("open");
      });
    });

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

  // ログアウト
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // ✅ アカウント作成スライドパネル起動
  const openRegister = document.getElementById("openRegisterFromMenu");
  if (openRegister) {
    openRegister.addEventListener("click", () => {
      document.getElementById("registerPanel").classList.add("open");
      document.body.classList.add("panel-open");
    });
  }

  const closeSlide = document.querySelector(".close-slide");
  if (closeSlide) {
    closeSlide.addEventListener("click", () => {
      document.getElementById("registerPanel").classList.remove("open");
      document.body.classList.remove("panel-open");
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      const username = email.split("@")[0];

      try {
        const res = await fetch("https://iranai-backend.onrender.com/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include"
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", username);
          localStorage.setItem("email", email);
          const encodedEmail = encodeURIComponent(email);
          const userUrl = `https://iranai-frontend.onrender.com/index.html?user=${encodedEmail}`;
          localStorage.setItem("userUrl", userUrl);

          document.getElementById("registerPanel").classList.remove("open");
          alert("登録が完了しました！");
          location.reload();
        } else {
          alert(data.error || "登録に失敗しました");
        }
      } catch (err) {
        alert("サーバーエラー");
        console.error(err);
      }
    });
  }

  const openLogin = document.getElementById("loginBtn");
if (openLogin) {
  openLogin.addEventListener("click", () => {
    document.getElementById("loginPanel").classList.add("open");
    document.body.classList.add("panel-open");
  });
}

const closeLoginSlide = document.querySelector(".close-slide-login");
if (closeLoginSlide) {
  closeLoginSlide.addEventListener("click", () => {
    document.getElementById("loginPanel").classList.remove("open");
    document.body.classList.remove("panel-open");
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const username = email.split("@")[0];

    try {
      const res = await fetch("https://iranai-backend.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        const encodedEmail = encodeURIComponent(email);
        const userUrl = `https://iranai-frontend.onrender.com/index.html?user=${encodedEmail}`;
        localStorage.setItem("userUrl", userUrl);

        document.getElementById("loginPanel").classList.remove("open");
        alert("ログインに成功しました！");
        location.reload();
      } else {
        alert(data.error || "ログインに失敗しました");
      }
    } catch (err) {
      alert("サーバーエラーが発生しました");
      console.error(err);
    }
  });
}

  // 初期表示処理
  if (otherUser) {
    fetchPosts();
  } else if (token) {
    fetchPosts();
  } else {
    gallery.innerHTML = "";
    hideMyProfileElements();
  }
}); 