document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const username = email.split("@")[0]; // 仮のユーザー名

            try {
                const res = await fetch("https://iranai-backend.onrender.com/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                    credentials: "include"
                });

                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("token", data.token); // ← JWTを保存
                    localStorage.setItem("username", username);
                    const userUrl = `https://iranai-frontend.onrender.com/user/${username}`;
                    localStorage.setItem("userUrl", userUrl);

                    window.location.href = `profile.html?user=${username}`;
                } else {
                    alert(data.error || "登録に失敗しました");
                }
            } catch (err) {
                alert("サーバーに接続できませんでした");
            }
        });
    }
});
