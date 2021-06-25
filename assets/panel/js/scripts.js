// var nowTemp = new Date();
// var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

// var checkin = $('#check-in-date').datepicker({
//     onRender: function(date) {
//         return date.valueOf() < now.valueOf() ? 'disabled' : '';
//     }
// }).on('changeDate', function(ev) {
//     if (ev.date.valueOf() > checkout.date.valueOf()) {
//         var newDate = new Date(ev.date)
//         newDate.setDate(newDate.getDate() + 1);
//         checkout.setValue(newDate);
//     }
//     checkin.hide();
//     $('#check-out-date')[0].focus();
// }).data('datepicker');
// var checkout = $('#check-out-date').datepicker({
//     onRender: function(date) {
//         return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
//     }
// }).on('changeDate', function(ev) {
//     checkout.hide();
// }).data('datepicker');

function printInvoice(element) {
    let restorePage = document.body.innerHTML;
    let printContent = document.getElementById(element).innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = restorePage;
}