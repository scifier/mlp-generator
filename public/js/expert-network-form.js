/* global document, postAjax */

(function main() {
  const jsonForm = document.getElementById('json-form');
  const postBtn = document.getElementById('post-btn');
  const textarea = document.getElementById('post-modal-textarea');
  const title = document.getElementById('post-modal-title');
  postBtn.addEventListener('click', () => {
    try {
      const fieldJSON = JSON.parse(jsonForm.value);
      const keys = Object.keys(fieldJSON);
      const msg = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = JSON.stringify(fieldJSON[key]);
        msg[key] = value;
      }
      postAjax('/api/networks', msg, (json) => {
        title.innerText = 'Your configuration was processed';
        textarea.value = json;
      });
    } catch (err) {
      title.innerText = 'Error occured';
      textarea.value = err.message;
    }
  });
}());

