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
      // var leader = data.data.leader;
      // var editors = data.data.editors;
      // var respeditor = data.data.respeditor;
      // var leader_dom = document.querySelector("#leader-container");
      // var editors_dom = document.querySelector("#editors-container");
      // var respeditor_dom = document.querySelector(
      //   "#respeditor-container"
      // );
      // var li = document.createElement("li");
      // li.classList.add("flex", "items-center", "mr-2");
      // li.innerText = leader;
      // leader_dom.appendChild(li);
      // editors.forEach((e) => {
      //   var li = document.createElement("li");
      //   li.classList.add("flex", "items-center", "mr-2");
      //   li.innerText = e;
      //   editors_dom.appendChild(li);
      // });
      // var li = document.createElement("li");
      // li.classList.add("flex", "items-center", "mr-2");
      // li.innerText = respeditor;
      // respeditor_dom.appendChild(li);
      document.querySelector("#page-2-subject").innerText =
        data.data.subject[0];
      document.querySelector("#page-3-subject").innerText =
        data.data.subject[1];
      document.querySelector("#page-4-subject").innerText =
        data.data.subject[2];
    } else {
      sendToast.error(data.message);
    }
  });