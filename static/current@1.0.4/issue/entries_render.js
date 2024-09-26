var token = Cookies.get("token");
axios
  .get(`/api/entries/listissue/${window.issue_id}`, {
    headers: {
      Authorization: token,
    },
  })
  .then((result) => {
    var data = result.data;
    console.log(data);
    if (data.code === 200) {
      // Render statical data
      var statical = data.data.count;
      var created_total = 0;
      var reviewed_total = 0;
      var selected_total = 0;
      for (let i = 0; i < statical.length; i++) {
        var dom = document.querySelector(`[data-statical-render="${i + 1}"]`);
        var pending_dom = document.createElement("span");
        pending_dom.classList.add(
          "h-5",
          "w-2",
          "rounded",
          "shadow",
          "bg-gray-300",
          "mr-1"
        );
        var created_dom = document.createElement("span");
        created_dom.classList.add(
          "h-5",
          "w-2",
          "rounded",
          "shadow",
          "bg-green-200",
          "mr-1"
        );
        var reviewed_dom = document.createElement("span");
        reviewed_dom.classList.add(
          "h-5",
          "w-2",
          "rounded",
          "shadow",
          "bg-green-500",
          "mr-1"
        );
        var selected_dom = document.createElement("span");
        selected_dom.classList.add(
          "h-5",
          "w-2",
          "rounded",
          "shadow",
          "bg-blue-600",
          "mr-1"
        );
        for (let j = 0; j < statical[i].selected; j++) {
          dom.appendChild(selected_dom.cloneNode());
        }
        for (let j = 0; j < statical[i].reviewed; j++) {
          dom.appendChild(reviewed_dom.cloneNode());
        }
        for (let j = 0; j < statical[i].created; j++) {
          dom.appendChild(created_dom.cloneNode());
        }
        for (let j = 0; j < statical[i].pending; j++) {
          dom.appendChild(pending_dom.cloneNode());
        }
        created_total += statical[i].created;
        reviewed_total += statical[i].reviewed;
        selected_total += statical[i].selected;
      }
      document.querySelector("#created-total").innerText = created_total;
      document.querySelector("#reviewed-total").innerText = reviewed_total;
      document.querySelector("#selected-total").innerText = selected_total;
      // Render entries
      var entries = data.data.list;
      var icon_type = {
        created: "icon-ic_fluent_circle_32_regular text-blue-400",
        reviewed: "icon-ic_fluent_checkmark_circle_32_regular text-green-400",
        selected: "icon-ic_fluent_merge_24_regular text-blue-600",
      };
      var page_dom = [
        document.querySelector("#page-1-container"),
        document.querySelector("#page-2-container"),
        document.querySelector("#page-3-container"),
        document.querySelector("#page-4-container"),
      ];
      entries.forEach((entry) => {
        var entry_template = `
              <div class="mr-3">
                <i
                  class="${icon_type[entry.status]} text-xl"
                ></i>
              </div>
              <div class="flex-1 flex-col">
                <h2 class="font-bold text-lg">${entry.title}</h2>
                <p><span class="font-bold">来源：</span>${entry.origin}</p>
                <p><span class="font-bold">词数：</span>${entry.wordcount}</p>
                <p><span class="font-bold">描述：</span></p>
                <p>${entry.description}</p>
                <p><span class="font-bold">选稿人：</span>${entry.selector}</p>
                <p><span class="font-bold">审稿人：</span>${entry.reviewer}</p>
              </div>
              <div data-with-permission="entries.review.${
                window.issue_id
              }" class="hidden">
                <button
                  data-href="/api/entries/getasset/${entry.uuid}"
                  class="px-3 py-1.5 rounded hover:bg-gray-100"
                >
                  下载
                </button>
                <button
                  data-with-permission="entries.remove.${window.issue_id}"
                  data-remove-uuid="${entry.uuid}"
                  class="hidden px-3 py-1.5 rounded hover:bg-gray-100"
                >
                  删除
                </button>
                <button
                  data-review-uuid="${entry.uuid}"
                  class="px-3 py-1.5 rounded hover:bg-gray-100"
                >
                  审稿
                </button>
              </div>
              <div data-with-permission="entries.select.${
                window.issue_id
              }" class="hidden">
                <button
                  data-select-uuid="${entry.uuid}"
                  class="px-3 py-1.5 rounded hover:bg-gray-100"
                >
                  选录
                </button>
              </div>
              `;
        var entryItem = document.createElement("div");
        entryItem.innerHTML = entry_template;
        entryItem.classList.add(
          "flex",
          "flex-col",
          "lg:flex-row",
          "flex-nowrap",
          "bg-white",
          "rounded-lg",
          "border",
          "shadow",
          "mb-3",
          "p-5",
          "w-full"
        );
        if (entry.status === "created" || entry.status === "pending") {
          entryItem.querySelector("[data-select-uuid]").classList.add("hidden");
        } else if (entry.status === "reviewed") {
          entryItem.querySelector("[data-review-uuid]").innerText = "重新审核";
        } else if (entry.status === "selected") {
          entryItem.querySelector("[data-review-uuid]").classList.add("hidden");
          entryItem.querySelector("[data-select-uuid]").innerText = "取消选录";
        }
        page_dom[entry.page - 1].appendChild(entryItem);
      });
      processDataHref();
      processPermission();
      processRemoveButton();
      processReviewButton();
      processSelectButton();
    } else {
      sendToast.error(data.message);
    }
  });
