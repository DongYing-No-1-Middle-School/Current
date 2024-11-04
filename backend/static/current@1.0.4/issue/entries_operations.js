window.review_uuid = null;
var review_files = document.querySelector("#review-files");
review_files.addEventListener("change", (event) => {
  if (review_files.files.length === 0) {
    return;
  }
  if (window.review_uuid == null) {
    sendToast.error("Client error: review_uuid is null.");
    return;
  }
  var uuid = window.review_uuid;
  var file = event.target.files[0];
  var formData = new FormData();
  formData.append("file", file);
  sendToast.info("正在上传文件...");
  axios
    .post(`/api/entries/review/${uuid}`, formData, {
      headers: {
        Authorization: token,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((result) => {
      var data = result.data;
      console.log(data);
      if (data.code === 200) {
        sendToast.success("审核文件上传成功！");
        event.target.files = null;
        setTimeout(() => {
          location.reload();
        }, 1000);
      } else {
        event.target.files = null;
        sendToast.error(data.message);
      }
    });
});
var processRemoveButton = () => {
  document.querySelectorAll("[data-remove-uuid]").forEach((e) => {
    e.addEventListener("click", (event) => {
      var uuid = event.target.getAttribute("data-remove-uuid");
      window.remove_uuid = uuid;
      openDialog(
        `<p>确认要删除此稿件？</p><p class="font-bold">注意：此操作不可恢复！</p>`,
        [
          {
            text: "确认删除",
            onclick: () => {
              axios
                .post(
                  `/api/entries/remove/${uuid}`,
                  {},
                  {
                    headers: {
                      Authorization: token,
                    },
                  }
                )
                .then((result) => {
                  var data = result.data;
                  console.log(data);
                  if (data.code === 200) {
                    sendToast.success("稿件删除成功！");
                    setTimeout(() => {
                      location.reload();
                    }, 1000);
                  } else {
                    sendToast.error(data.message);
                  }
                });
              hideDialogElement();
            },
          },
          {
            text: "取消",
            onclick: () => {
              hideDialogElement();
            },
          },
        ],
        (allowClose = false)
      );
    });
  });
};
var processReviewButton = () => {
  document.querySelectorAll("[data-review-uuid]").forEach((e) => {
    e.addEventListener("click", (event) => {
      var uuid = event.target.getAttribute("data-review-uuid");
      var review_files = document.querySelector("#review-files");
      window.review_uuid = uuid;
      review_files.files = null;
      sendToast.info("请选择审核并修改过后的文件，并上传。");
      review_files.click();
    });
  });
};
var processSelectButton = () => {
  document.querySelectorAll("[data-select-uuid]").forEach((e) => {
    e.addEventListener("click", (event) => {
      var uuid = event.target.getAttribute("data-select-uuid");
      axios
        .post(
          `/api/entries/select/${uuid}`,
          {},
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then((result) => {
          var data = result.data;
          console.log(data);
          if (data.code === 200) {
            if (data.data.status === "selected") {
              sendToast.success("选录成功！");
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else if (data.data.status === "reviewed") {
              sendToast.success("取消选录成功！");
              setTimeout(() => {
                location.reload();
              }, 1000);
            }
          } else {
            sendToast.error(data.message);
          }
        });
    });
  });
};
