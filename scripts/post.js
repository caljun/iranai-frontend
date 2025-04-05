// scripts/post.js

const postId = new URLSearchParams(location.search).get("id");
const token = localStorage.getItem("token");
let postOwnerEmail = "";

async function fetchPost() {
  try {
    const res = await fetch(`https://iranai-backend.onrender.com/posts/${postId}`, {
      method: "GET",
      headers: {
        Authorization: token
      },
      credentials: "include"
    });
    if (!res.ok) {
      alert("投稿の取得に失敗しました");
      return;
    }

    const post = await res.json();
    postOwnerEmail = post.email;

    document.getElementById("detailImage").src = post.image;
    document.getElementById("postCaption").textContent = post.name;
    document.getElementById("postCategory").textContent = post.category;
    document.getElementById("postReason").textContent = post.reason;

    const currentEmail = localStorage.getItem("email");
    if (post.email === currentEmail) {
      const deleteBtn = document.getElementById("deletePostBtn");
      deleteBtn.style.display = "block";
      deleteBtn.addEventListener("click", async () => {
        const confirmDelete = confirm("本当に削除しますか？");
        if (!confirmDelete) return;

        const delRes = await fetch(`https://iranai-backend.onrender.com/posts/${postId}`, {
          method: "DELETE",
          headers: { Authorization: token },
          credentials: "include"
        });

        if (delRes.ok) {
          alert("削除しました");
          window.location.href = "profile.html";
        } else {
          alert("削除に失敗しました");
        }
      });
    }
  } catch (err) {
    console.error("投稿取得エラー:", err);
    alert("サーバーエラーが発生しました");
  }
}

fetchPost();

// いいねボタン（♡ ⇄ ♥）
const likeBtn = document.querySelector(".like-btn");
let liked = false;

likeBtn.addEventListener("click", () => {
  liked = !liked;
  likeBtn.textContent = liked ? "❤" : "♡";

  const myEmail = localStorage.getItem("email");
  if (liked && postOwnerEmail !== myEmail) {
    fetch("https://iranai-backend.onrender.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        toEmail: postOwnerEmail,
        postId: postId,
        type: "いいね"
      }),
      credentials: "include"
    }).catch(err => console.error("いいね通知送信エラー:", err));
  }
});

// コメント処理
const commentInput = document.getElementById("commentInput");
const commentList = document.getElementById("commentList");
const submitComment = document.getElementById("submitComment");

async function fetchComments() {
  try {
    const res = await fetch(`https://iranai-backend.onrender.com/posts/${postId}/comments`);
    if (!res.ok) {
      console.error("コメント取得エラー:", res.statusText);
      return;
    }
    const comments = await res.json();
    renderComments(comments);
  } catch (err) {
    console.error("コメント取得エラー:", err);
  }
}

function renderComments(comments) {
  commentList.innerHTML = "";
  comments.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.text}（${c.email}）`;
    commentList.appendChild(li);
  });
}

submitComment.addEventListener("click", async () => {
  const comment = commentInput.value.trim();
  if (comment === "") return;

  try {
    const res = await fetch(`https://iranai-backend.onrender.com/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ text: comment }),
      credentials: "include"
    });

    if (res.ok) {
      commentInput.value = "";
      fetchComments();
    } else {
      alert("コメント投稿に失敗しました");
    }
  } catch (err) {
    alert("コメント送信エラー");
    console.error(err);
  }
});

fetchComments();

