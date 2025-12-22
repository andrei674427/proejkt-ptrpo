(function () {
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user && user.role === "admin";

    const currentPage = location.pathname.split("/").pop();

    // 🔒 ЖЁСТКАЯ ЗАЩИТА АДМИНКИ
    if (currentPage === "admin.html" && !isAdmin) {
        alert("Доступ запрещён. Только для администратора.");
        location.replace("index.html");
        return;
    }

    // 👁️ СКРЫВАЕМ АДМИН-ЭЛЕМЕНТЫ
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".admin-only").forEach(el => {
            if (!isAdmin) el.style.display = "none";
        });
    });
})();
