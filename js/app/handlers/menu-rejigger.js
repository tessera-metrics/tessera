  $(document).on('click', 'ul.ds-rejigger-menu li a', function(e) {
    var target = $(e.target).parent();
    var cols = target.attr('data-ds-cols');
    var section_type = target.attr('data-ds-section-type');

    var layout = ds.models.transform.SimpleGrid({
      section_type: section_type,
      columns: cols
    });

    ds.manager.apply_transform(layout)
    return false
  });
