processPublishButton = () => {
  document.querySelector("#file-upload").addEventListener("change", (event) => {
    var filename = event.target.files[0].name;
    document.querySelector("#filename-show").innerText = filename;
  });
  document.querySelector("#publish-issue").addEventListener("click", () => {
    var file = document.querySelector("#file-upload").files[0];
    if (file == null) {
      sendToast.error("请先选择文件！");
      return;
    }
    var formData = new FormData();
    formData.append("pdf", file);
    axios
      .post(`/api/issues/publish/${window.issue_id}`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((result) => {
        var data = result.data;
        console.log(data);
        if (data.code === 200) {
          sendToast.success("发布成功！");
          setTimeout(() => {
            location.reload();
          }, 1000);
        } else {
          sendToast.error(data.message);
        }
      });
  });
};
var token = Cookies.get("token");
axios
  .get(`/api/issues/info/${window.issue_id}`, {
    headers: {
      Authorization: token,
    },
  })
  .then((result) => {
    var data = result.data;
    console.log(data);
    if (data.code === 200) {
      if (data.data.ispublished) {
        document.querySelector("#dashboard-container").classList.add("hidden");
        // document.querySelector("#cooperator-container").classList.add("hidden");
        document.querySelector("#operation-button-bar").classList.add("hidden");
        document
          .querySelector("[data-with-permission='issues.publish']")
          .remove();
        var userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes("mobi") || userAgent.includes("android")) {
          var pdfdiv = document.createElement("div");
          pdfdiv.classList.add(
            "bg-white",
            "rounded-lg",
            "border",
            "shadow",
            "p-10",
            "mb-3"
          );
          var button = document.createElement("button");
          button.classList.add(
            "px-3",
            "py-1.5",
            "rounded",
            "bg-indigo-600",
            "text-white",
            "hover:bg-indigo-500"
          );
          button.innerText = "下载 PDF";
          button.addEventListener("click", () => {
            window.open(`/api/issues/getpdf/${window.issue_id}`);
          });
          pdfdiv.appendChild(button);
          document.querySelector("#release-pdf-show").appendChild(pdfdiv);
        } else {
          var pdfiframe = document.createElement("iframe");
          pdfiframe.src = `/api/issues/getpdf/${window.issue_id}`;
          pdfiframe.classList.add(
            "mb-5",
            "w-full",
            "h-[65vh]",
            "shadow",
            "rounded"
          );
          document.querySelector("#release-pdf-show").appendChild(pdfiframe);
        }
      } else {
        document.querySelector("#release-pdf-show").remove();
        processPublishButton();
      }
    } else {
      sendToast.error(data.message);
    }
  });
