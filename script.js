$(document).ready(function() {
    $('a[href^="#"]').click(function(event) {
        var id = $(this).attr("href");
        var target = $(id).offset().top;
        $('html, body').animate({scrollTop: target}, 500);
        event.preventDefault();
    });

    function getTargetTop(elem) {
        var id = elem.attr("href");
        var offset = 60;
        return $(id).offset().top - offset;
    }

    var $window = $(window);
    var sections = $('a[href^="#"]');

    $window.scroll(function(e) {
        isSelected($window.scrollTop());
    });

    function isSelected(scrolledTo) {
        var threshold = 100;

        sections.each(function() {
            var section = $(this);
            var target = getTargetTop(section);

            if (scrolledTo > target - threshold && scrolledTo < target + threshold) {
                sections.removeClass("active");
                section.addClass("active");
            }
        });
    }
});
