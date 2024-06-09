var processPermission = () => {
  var token = Cookies.get("token");
  axios
    .get("/api/clients/permissions", {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      var data = result.data;
      console.log(data);
      if (data.code == 200) {
        var permissions = data.data;
        if (permissions.includes("*")) {
          document
            .querySelectorAll("[data-with-permission]")
            .forEach((item) => {
              item.classList.remove("hidden");
            });
        } else {
          document
            .querySelectorAll("[data-with-permission]")
            .forEach((item) => {
              var permList = item.getAttribute("data-with-permission").split(".");
              if (permissions.includes(permList.join("."))) {
                item.classList.remove("hidden");
              } else {
                for (var i = 1; i < permList.length; i++) {
                  var perm = permList.slice(0, i).join(".") + ".*";
                  console.log(perm);
                  if (permissions.includes(perm)) {
                    item.classList.remove("hidden");
                  }
                }
              }
              
            });
        }
      }
    });
};

var processDataHref = () => {
  document.querySelectorAll("[data-href]").forEach((item) => {
    item.classList.add("cursor-pointer");
    item.addEventListener("click", (e) => {
      e.preventDefault();
      var href = item.getAttribute("data-href");
      window.location.href = href;
    });
  });
};

var verifyUser = (onsuccess = ( userdetail ) => {}) => {
  var token = Cookies.get("token");
  if (token != undefined) {
    axios
      .get("/api/clients/status", {
        headers: {
          Authorization: token,
        },
      })
      .then((result) => {
        var data = result.data;
        console.log(data);
        if (data.code == 200) {
          var username = data.data.username;
          document.querySelectorAll("#username").forEach((item) => {
            item.innerText = username;
          });
          document.querySelectorAll(".login-hidden").forEach((item) => {
            item.classList.add("hidden");
          });
          document.querySelectorAll(".login-show").forEach((item) => {
            item.classList.remove("hidden");
          });
          processPermission();
          onsuccess(data.data);
        } else {
          token = undefined;
          Cookies.remove("token");
          sendToast.warning("登录状态异常，请重新登录。");
          if (window.location.pathname != "/") {
            window.location.href = "/";
          }
        }
      });
  } else {
    if (window.location.pathname != "/") {
      window.location.href = "/";
    }
    document.querySelector("#no-login-box").classList.remove("hidden");
    return undefined;
  }
};

var regLogoutButton = () => {
  var token = Cookies.get("token");
  document.getElementById("logout").addEventListener("click", (e) => {
    e.preventDefault();
    Cookies.remove("token");
    axios.get("/api/clients/logout", {
      headers: {
        Authorization: token,
      },
    });
    window.location.reload();
  });
};
