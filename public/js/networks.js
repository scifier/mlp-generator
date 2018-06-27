/* global document, deleteAjax, $ */

(function main() {
  $('#data-table').DataTable({
    pageLength: 10,
    processing: true,
    pagingType: 'full_numbers',
    orderMulti: 'true',
    responsive: true,
    order: [
      [9, 'desc'], // logged at
      [10, 'desc'], // status
      [8, 'asc'], // id
    ],
    // language: {'search': 'Cauta:'},
  });
  // $('#data-table')
  // .removeClass('display')
  // .addClass('table table-striped table-bordered table-condensed');
  // $.fn.dataTable.ext.classes.sPageButton = 'button primary_button';
  // $.fn.dataTable.ext.classes.sPageButton = 'button button-primary';

  $('#delete-modal').on('show.bs.modal', (event) => {
    const deleteBtn = $(event.relatedTarget);
    const networkId = deleteBtn.data('id');
    const title = document.getElementById('delete-modal-title');
    const text = document.getElementById('confirmation-text');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    title.innerText = `Delete Network ${networkId}`;
    text.innerText = `Are you sure you want to delete Network ${networkId}?`;
    function deleteNetwork() {
      deleteAjax(`/api/network/${networkId}`, (json) => {
        document.getElementById('response-modal-title').innerText = JSON.parse(json).message;
      });
    }
    confirmBtn.addEventListener('click', deleteNetwork, false);
    cancelBtn.addEventListener('click', () => {
      confirmBtn.removeEventListener('click', deleteNetwork);
    });
    $('#delete-modal').on('hidden.bs.modal', () => {
      confirmBtn.removeEventListener('click', deleteNetwork);
    });
  });
}());
