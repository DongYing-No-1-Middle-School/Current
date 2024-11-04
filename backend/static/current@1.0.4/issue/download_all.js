async function downloadAllEntries(entries) {
  const zip = new JSZip();

  for (let entry of entries) {
    const entryFolder = zip.folder(entry.title);
    const response = await axios.get(`/api/entries/getasset/${entry.uuid}`, {
      responseType: "blob",
    });
    entryFolder.file(`${entry.filename}`, response.data, {
      binary: true,
    });
  }

  zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(blob, `第 ${window.issue_id} 期的所有稿件 - Current.zip`);
    sendToast.success("所有稿件下载成功！");
  });
}
document.querySelector("button#download-all").addEventListener("click", () => {
  sendToast.info("正在下载所有稿件，请稍后...");
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
        var entries = data.data.list;
        downloadAllEntries(entries);
      } else {
        sendToast.error(data.message);
      }
    });
});
