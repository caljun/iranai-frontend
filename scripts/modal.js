document.addEventListener("DOMContentLoaded", function () {
    let modal = document.getElementById("postModal");
  
    // **モーダルが存在しない場合は自動生成**
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "postModal";
      modal.style.display = "none";
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-btn">&times;</span>
          <h2>投稿を追加</h2>
          <input type="text" id="postName" placeholder="名前">
          <input type="file" id="postImage" accept="image/*">
          <select id="postCategory">
            <option value="使わん">使わん</option>
            <option value="飽きた">飽きた</option>
            <option value="壊れた">壊れた</option>
          </select>
          <input type="text" id="postReason" placeholder="いらない理由（30文字以内）" maxlength="30">
          <button id="submitPost">投稿する</button>
        </div>
      `;
      document.body.appendChild(modal);
    }
  
    const closeBtn = modal.querySelector(".close-btn");
    const submitPostBtn = modal.querySelector("#submitPost");
  
    // **モーダルを開く関数（グローバル登録）**
    window.openModal = function () {
      modal.style.display = "block";
    };
  
    // **モーダルを閉じる**
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });
  
    // **投稿ボタンを押したら投稿を追加**
    submitPostBtn.addEventListener("click", addPostHandler);
    submitPostBtn.addEventListener("touchstart", addPostHandler);
  
    // **投稿処理を関数化**
    function addPostHandler() {
      const name = document.getElementById("postName").value.trim();
      const category = document.getElementById("postCategory").value;
      const reason = document.getElementById("postReason").value.trim();
      const imageInput = document.getElementById("postImage");
  
      if (!name || !category || !reason || imageInput.files.length === 0) {
        alert("全ての項目を入力してください");
        return;
      }
  
      if (reason.length > 30) {
        alert("いらない理由は30文字以内で入力してください");
        return;
      }
  
      const reader = new FileReader();
      reader.onload = async function (e) {
        const image = e.target.result;
        const token = localStorage.getItem("token");
  
        try {
          const res = await fetch("http://localhost:3000/posts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": token
            },
            body: JSON.stringify({ name, image, category, reason })
          });
  
          const data = await res.json();
  
          if (res.ok) {
            alert("投稿が完了しました");
            modal.style.display = "none";
            document.getElementById("postName").value = "";
            document.getElementById("postReason").value = "";
            const oldInput = document.getElementById("postImage");
            const newInput = oldInput.cloneNode(true);
            oldInput.parentNode.replaceChild(newInput, oldInput);
          } else {
            alert(data.message || "投稿に失敗しました");
          }
        } catch (err) {
          alert("サーバーエラーが発生しました");
          console.error(err);
        }
      };
  
      reader.readAsDataURL(imageInput.files[0]);
    }
  
    // **スマホ対応: モーダルの外をタップしたら閉じる**
    window.addEventListener("touchstart", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  });
  