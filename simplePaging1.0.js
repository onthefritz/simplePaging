(function($) {

    $.fn.extend({
        paging: function(options) {
            var defaults = {
                data: {},
                contentHolder: '',
                template: '',
                errorTemplate: '',
                informationToShow: [],
                informationToRefineBy: [],
                perPage: 10,
                pageLengths: [5, 10, 20, 30, 40, 50],
                startPage: 1,
                pagesToShow: 5,
                showOptions: true,
                showSearch: true,
                alwaysShowPager: true,
            };

            var doNotChange = {
                currentPage: defaults.startPage,
                totalPages: 0,
                currentData: options.data,
                refine: '',
            };

            options = $.extend(defaults, options);
            options = $.extend(doNotChange, options);

            options.totalPages = Math.ceil(options.currentData.length / options.perPage);

            //console.log(options);

            setupPager($(this).attr('id'), options)
        }
    });

    function setupPager(pager, options) {
        var totalPages = options.totalPages;

        createPaging(pager, options.currentData.length, options.perPage, options.pageLengths, options.showOptions, options.showSearch, options.refine);
        showProperPaging(pager, options.startPage, options.totalPages, options.pagesToShow);
        $('#' + options.contentHolder).html(template(pager, options.template, options.currentData, options.startPage, options.perPage, options.alwaysShowPager, options.informationToShow, options.errorTemplate));

        $('#' + pager).on('click', '.page, .last-page, .first-page, .next-pages, .prev-pages', function(e) {
            var newPage = parseInt($(this).data('value'));
            var perPage = parseInt($('#' + pager + ' .perPage').val());
            $('#' + pager + ' .page.current').removeClass('current');
            $('#' + pager + ' .page[data-value="' + newPage + '"]').addClass('current');

            showProperPaging(pager, newPage, options.totalPages, options.pagesToShow);
            $('#' + options.contentHolder).html(template(pager, options.template, options.currentData, newPage, perPage, options.alwaysShowPager, options.informationToShow, options.errorTemplate));
            options.currentPage = newPage;

            $('#' + pager).trigger("pagingChange");
        });

        $('#' + pager).on('click', '.next-page', function(e) {
            var newPage = options.currentPage + 1;
            var perPage = parseInt($('#' + pager + ' .perPage').val());
            $('#' + pager + ' .page.current').removeClass('current');
            $('#' + pager + ' .page[data-value="' + newPage + '"]').addClass('current');

            showProperPaging(pager, newPage, options.totalPages, options.pagesToShow);
            $('#' + options.contentHolder).html(template(pager, options.template, options.currentData, newPage, perPage, options.alwaysShowPager, options.informationToShow, options.errorTemplate));
            options.currentPage = newPage;

            $('#' + pager).trigger("pagingChange");
        });

        $('#' + pager).on('click', '.prev-page', function(e) {
            var newPage = options.currentPage - 1;
            var perPage = parseInt($('#' + pager + ' .perPage').val());
            $('#' + pager + ' .page.current').removeClass('current');
            $('#' + pager + ' .page[data-value="' + newPage + '"]').addClass('current');

            showProperPaging(pager, newPage, options.totalPages, options.pagesToShow);
            $('#' + options.contentHolder).html(template(pager, options.template, options.currentData, newPage, perPage, options.alwaysShowPager, options.informationToShow, options.errorTemplate));
            options.currentPage = newPage;

            $('#' + pager).trigger("pagingChange");
        });

        $('#' + pager).on('change', '.perPage', function(e) {
            var perPage = parseInt($(this).val());

            //We have to recreate the pager with the new per page data.
            createPaging(pager, options.data.length, perPage, options.pageLengths, options.showOptions, options.showSearch, options.refine);

            options.totalPages = Math.ceil(options.currentData.length / perPage);
            showProperPaging(pager, options.startPage, options.totalPages, options.pagesToShow);
            $('#' + options.contentHolder).html(template(pager, options.template, options.currentData, options.startPage, perPage, options.alwaysShowPager, options.informationToShow, options.errorTemplate));
            options.currentPage = options.startPage;

			$('#' + pager).trigger("pagingChange");
        });

        $('#' + pager).on('keyup', '.search', function(e) {
            var perPage = parseInt($('#' + pager + ' .perPage').val());
            var refine = $(this).val();
            options.refine = refine;

            var newJson = refineJson(options.data, refine, options.informationToRefineBy);

            if (!newJson) {
                newJson = options.data;
            }

            options.currentData = newJson;

            var newTotalPages = Math.ceil(options.currentData.length / perPage);
            options.totalPages = newTotalPages;

            showProperPaging(pager, options.startPage, options.totalPages, options.pagesToShow);
            $('#' + options.contentHolder).html(template(pager, options.template, options.currentData, options.startPage, perPage, options.alwaysShowPager, options.informationToShow, options.errorTemplate));

			$('#' + pager).trigger("pagingChange");
        });

        $('#' + pager).on('focusin', '.search', function() {
	        options.refineFocus = true;
        });

        $('#' + pager).on('focusout', '.search', function() {
	        options.refineFocus = false;
        });
    }

    function createPaging(pager, length, itemsPerPage, options, showOptions, showSearch, refine) {
        var html = '';

        var pages = Math.ceil(length / itemsPerPage);

        html += '<div class="showing"></div>';

        html += '<div class="pager">' +
                    '<span class="first-page btn" data-value="1">First</span>' +
                    '<span class="prev-page btn">Previous</span>' +
                    '<span class="prev-pages btn" data-value="1">...</span>' +
                    '<span class="page btn current" data-value="1">1</span>';

        for (var i = 1; i < pages; i++) {
            html += '<span class="page btn" data-value="' + (i + 1) + '">' + (i + 1) + '</span>';
        }

        html += '	<span class="next-pages btn" data-value="6">...</span>' +
                    '<span class="next-page btn">Next</span>' +
                    '<span class="last-page btn" data-value="' + pages + '">Last</span>' +
                '</div>';

        html += '<div class="options" style="text-align: center; margin-bottom: 10px;">' +
                    '<span>Show </span>' +
                    '<select class="perPage">';

        for (var i = 0; i < options.length; i++) {
            if (options[i] == itemsPerPage) {
                html += '<option selected="selected">' + options[i] + '</option>';
            }
            else {
                html += '<option>' + options[i] + '</option>';
            }
        }

        html += '	</select>' +
                    '<span> per page</span>' +
                '</div>';

        if (showSearch) {
	        html += '<div class="searchBox">' +
	                    '<input type="text" class="search" placeholder="Search" value="' + refine + '" />' +
	                '</div>';
        }

        $('#' + pager).html(html);
    }

    function showProperPaging(pager, currentPage, numPages, pagesToShow) {
        //Show/Hide the prev button
        if (currentPage == 1) {
            $('#' + pager).find('.prev-page').hide();
        }
        else {
            $('#' + pager).find('.prev-page').show();
        }

        //Show/Hide the next button
        if (currentPage == numPages) {
            $('#' + pager).find('.next-page').hide();
        }
        else {
            $('#' + pager).find('.next-page').show();
        }

        var start, end,
        pagesCutOff = pagesToShow,
        ceiling = Math.ceil(pagesCutOff / 2),
        floor = Math.floor(pagesCutOff / 2);

        if (numPages < pagesCutOff) {
            start = 0;
            end = numPages;
        }
        else if (currentPage >= 1 && currentPage <= ceiling) {
            start = 0;
            end = pagesCutOff;
        }
        else if ((currentPage + floor) >= numPages) {
            start = (numPages - pagesCutOff);
            end = numPages;
        }
        else {
            start = (currentPage - ceiling);
            end = (currentPage + floor);
        }

        $('#' + pager + ' .pager').children().each(function() {
            if ($(this).hasClass('page')) {
                $(this).hide();
            }
        });

        for (var i = start; i < end; i++) {
            if (start > 0) {
                $('#' + pager + ' .prev-pages').show();
                $('#' + pager + ' .prev-pages').data('value', start);
            }
            else {
                $('#' + pager + ' .prev-pages').hide();
            }

            $('#' + pager + " .page[data-value='" + (i + 1) + "']").show();

            if (end < numPages) {
                $('#' + pager + ' .next-pages').show();
                $('#' + pager + ' .next-pages').data('value', end + 1);
            }
            else {
                $('#' + pager + ' .next-pages').hide();
            }
        }

        if (numPages == 1) {
            $('#' + pager + ' .last-page, ' + '#' + pager + ' .first-page').hide();
        }
        else if (numPages == 0) {
            $('#' + pager + ' .pager, ' + '#' + pager + ' .showing, ' + '#' + pager + ' .options').hide();
        }
        else {
            $('#' + pager + ' .pager, ' + '#' + pager + ' .showing, ' + '#' + pager + ' .options').show();
            $('#' + pager + ' .last-page, ' + '#' + pager + ' .first-page').show();
        }
    }

    function template(pager, templateToShow, jsonData, page, itemsPerPage, alwaysShow, informationToShow, errorTemplate) {
        var html = '';
        var count = 0;

        var first = ((page * itemsPerPage) - (itemsPerPage - 1));
        var last = ((page * itemsPerPage) > jsonData.length) ? jsonData.length : (page * itemsPerPage);

        if (jsonData.length <= 0) {
            if (errorTemplate == '') {
                html += '<div class="dataError">' +
                        'There is nothing to show here.' +
                    '</div>';
            }
            else {
                var error = $('#' + errorTemplate).html().format(['There are no Messages to display.']);
                html += error;
            }

            if (!alwaysShow) {
                $('#' + pager).hide();
            }

            return html;
        }

        $('#' + pager).show();

        $('#' + pager + ' .showing').html('Showing ' + first + ' to ' + last + ' of ' + jsonData.length + ' total.');

        for (var i = (page * itemsPerPage) - (itemsPerPage); i < page * itemsPerPage; i++) {
            if (i == jsonData.length) {
                break;
            }

            var data = [];

            $.each(informationToShow, function(index, value) {
                data.push(jsonData[i][value]);
            });

            var showing = $('#' + templateToShow).html().format(data);

            html += showing;
        }

        return html;
    }

    function refineJson(jsonToRefine, refineStatment, informationToRefineBy) {
        if (refineStatment == '') {
            return;
        }

        var refineStatmentToLowerCase = refineStatment.toLowerCase();

        dataToKeep = [];
        for (var i = 0; i < jsonToRefine.length; i++) {
            $.each(informationToRefineBy, function(key, value) {
                if (jsonToRefine[i][value] != null && jsonToRefine[i][value].toLowerCase().indexOf(refineStatmentToLowerCase) >= 0) {
                    dataToKeep.push(jsonToRefine[i]);
                    return false;
                }
            });
        }

        return dataToKeep;
    }

})(jQuery);

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[0][number] != 'undefined'
      ? args[0][number]
      : match
    ;
  });
};
