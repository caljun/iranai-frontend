document.addEventListener("DOMContentLoaded", async function () {
    const list = document.getElementById("notificationList");
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("ログインが必要です");
      window.location.href = "login.html";
      return;
    }
  
    try {
      const res = await fetch("https://iranai-backend.onrender.com/notifications/me", {
        headers: { Authorization: token },
        credentials: "include"
      });
  
      if (!res.ok) {
        alert("通知の取得に失敗しました");
        return;
      }
  
      const notifications = await res.json();
  
      if (notifications.length === 0) {
        list.innerHTML = "<li>通知はまだありません。</li>";
        return;
      }
  
      notifications.forEach(n => {
        const li = document.createElement("li");
        li.classList.add("notification-item");
  
        const icon = n.type === "コメント" ? "💬" : "❤️";
        const dateStr = new Date(n.createdAt).toLocaleString();
  
        li.innerHTML = `
          <span class="notification-icon">${icon}</span>
          <span class="notification-text">${n.message}（${dateStr}）</span>
        `;
  
        // 投稿ページへリンク（postIdがあるときのみ）
        if (n.postId) {
          li.addEventListener("click", () => {
            window.location.href = `post.html?id=${n.postId}`;
          });
        }
  
        list.appendChild(li);
      });
    } catch (err) {
      console.error("通知取得エラー:", err);
      alert("サーバーエラーが発生しました");
    }
  });
  