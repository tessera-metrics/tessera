$(document).on('click', 'ul.ds-dashboard-sort-menu li', function(e) {
  var column = e.target.getAttribute('data-ds-sort-col')
  var order = e.target.getAttribute('data-ds-sort-order')
  console.log("Sort by " + column + ", " + order)
  var url = URI(window.location)
  if (column) {
    url.setQuery('sort', column)
  }
  if (order) {
    url.setQuery('order', order)
  }
  window.location = url.href()
});
