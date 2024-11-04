window.addEventListener("load", () => {
    let dialog_shadow = document.createElement("div");
    dialog_shadow.id = "dialog-shadow";
    dialog_shadow.classList.add("dialog-hidden");
    document.body.appendChild(dialog_shadow);
    let dialog_main = document.createElement("div");
    dialog_main.id = "dialog-main";
    dialog_main.classList.add("dialog-hidden");
    dialog_shadow.appendChild(dialog_main);
    let dialog_content = document.createElement("div");
    dialog_content.id = "dialog-content";
    dialog_main.appendChild(dialog_content);
    let dialog_text_area = document.createElement("div");
    dialog_text_area.id = "dialog-text-area";
    dialog_content.appendChild(dialog_text_area);
    let dialog_buttons_area = document.createElement("div");
    dialog_buttons_area.id = "dialog-buttons-area";
    dialog_content.appendChild(dialog_buttons_area);
});

let showDialogElement = () => {
  document.body.style.overflow = "hidden";
  document
    .querySelector("#dialog-shadow")
    .classList.remove("animated-fade-out");
  document.querySelector("#dialog-main").classList.remove("animated-scale-out");
  document.querySelector("#dialog-shadow").classList.add("animated-fade-in");
  document.querySelector("#dialog-main").classList.add("animated-scale-in");
  document.querySelector("#dialog-shadow").classList.remove("dialog-hidden");
  document.querySelector("#dialog-main").classList.remove("dialog-hidden");
  document.querySelector("#dialog-shadow").classList.add("dialog-show");
  document.querySelector("#dialog-main").classList.add("dialog-show");
};
let hideDialogElement = () => {
  document.body.style.overflow = "auto";
  document.querySelector("#dialog-shadow").classList.remove("animated-fade-in");
  document.querySelector("#dialog-main").classList.remove("animated-scale-in");
  document.querySelector("#dialog-shadow").classList.add("animated-fade-out");
  document.querySelector("#dialog-main").classList.add("animated-scale-out");
  document.querySelector("#dialog-shadow").classList.remove("dialog-show");
  document.querySelector("#dialog-main").classList.remove("dialog-show");
  setTimeout(() => {
    document.querySelector("#dialog-shadow").classList.add("dialog-hidden");
    document.querySelector("#dialog-main").classList.add("dialog-hidden");
  }, 480);
};

let openDialog = (innerHTML, buttons = [], allowClose = true) => {
    document.querySelector("#dialog-text-area").innerHTML = innerHTML;
    document.querySelector("#dialog-buttons-area").innerHTML = "";
    if(buttons.length > 0){
        buttons.forEach(bdata => {
            let button = document.createElement("button");
            button.classList.add("operation-button");
            button.innerHTML = bdata.text;
            if(bdata.onclick != undefined){
                button.onclick = bdata.onclick;
            }
            document.querySelector("#dialog-buttons-area").appendChild(button);
        });
    }
    if(allowClose){
        let button = document.createElement("button");
        button.classList.add("operation-button");
        button.innerHTML = "关闭";
        button.onclick = hideDialogElement;
        document.querySelector("#dialog-buttons-area").appendChild(button);
    }
    showDialogElement();
}