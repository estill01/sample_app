 jQuery(function ($) {
var csrf_token = $('meta[name=csrf-token]').attr('content'),
csrf_param = $('meta[name=csrf-param]').attr('content');

$.fn.extend({
/**
* Triggers a custom event on an element and returns the event result
* this is used to get around not being able to ensure callbacks are placed
* at the end of the chain.
*
* TODO: deprecate with jQuery 1.4.2 release, in favor of subscribing to our
* own events and placing ourselves at the end of the chain.
*/
triggerAndReturn: function (name, data) {
var event = new $.Event(name);
this.trigger(event, data);

return event.result !== false;
},

/**
* Handles execution of remote calls firing overridable events along the way
*/
callRemote: function () {
var el = this,
method = el.attr('method') || el.attr('data-method') || 'GET',
url = el.attr('action') || el.attr('href'),
dataType = el.attr('data-type') || 'script';

if (url === undefined) {
throw "No URL specified for remote call (action or href must be present).";
} else {
if (el.triggerAndReturn('ajax:before')) {
var data = el.is('form') ? el.serializeArray() : [];
$.ajax({
url: url,
data: data,
dataType: dataType,
type: method.toUpperCase(),
beforeSend: function (xhr) {
el.trigger('ajax:loading', xhr);
},
success: function (data, status, xhr) {
el.trigger('ajax:success', [data, status, xhr]);
},
complete: function (xhr) {
el.trigger('ajax:complete', xhr);
},
error: function (xhr, status, error) {
el.trigger('ajax:failure', [xhr, status, error]);
}
});
}

el.trigger('ajax:after');
}
}
});

/**
* confirmation handler
*/
$('a[data-confirm],input[data-confirm]').live('click', function () {
var el = $(this);
if (el.triggerAndReturn('confirm')) {
if (!confirm(el.attr('data-confirm'))) {
return false;
}
}
});


/**
* remote handlers
*/
$('form[data-remote]').live('submit', function (e) {
$(this).callRemote();
e.preventDefault();
});

$('a[data-remote],input[data-remote]').live('click', function (e) {
$(this).callRemote();
e.preventDefault();
});

$('a[data-method]:not([data-remote])').live('click', function (e){
var link = $(this),
href = link.attr('href'),
method = link.attr('data-method'),
form = $('<form method="post" action="'+href+'"></form>'),
metadata_input = '<input name="_method" value="'+method+'" type="hidden" />';

if (csrf_param != null && csrf_token != null) {
metadata_input += '<input name="'+csrf_param+'" value="'+csrf_token+'" type="hidden" />';
}

form.hide()
.append(metadata_input)
.appendTo('body');

e.preventDefault();
form.submit();
});

/**
* disable-with handlers
*/
var disable_with_input_selector = 'input[data-disable-with]';
var disable_with_form_remote_selector = 'form[data-remote]:has(' + disable_with_input_selector + ')';
var disable_with_form_not_remote_selector = 'form:not([data-remote]):has(' + disable_with_input_selector + ')';

var disable_with_input_function = function () {
$(this).find(disable_with_input_selector).each(function () {
var input = $(this);
input.data('enable-with', input.val())
.attr('value', input.attr('data-disable-with'))
.attr('disabled', 'disabled');
});
};

$(disable_with_form_remote_selector).live('ajax:before', disable_with_input_function);
$(disable_with_form_not_remote_selector).live('submit', disable_with_input_function);

$(disable_with_form_remote_selector).live('ajax:complete', function () {
$(this).find(disable_with_input_selector).each(function () {
var input = $(this);
input.removeAttr('disabled')
.val(input.data('enable-with'));
});
});

});

// /**
//  * Unobtrusive scripting adapter for jQuery
//  *
//  * Requires jQuery 1.4.3 or later.
//  * https://github.com/rails/jquery-ujs
//  */
// 
// (function($) {
// 	// Triggers an event on an element and returns the event result
// 	function fire(obj, name, data) {
// 		var event = new $.Event(name);
// 		obj.trigger(event, data);
// 		return event.result !== false;
// 	}
// 
// 	// Submits "remote" forms and links with ajax
// 	function handleRemote(element) {
// 		var method, url, data,
// 			dataType = element.attr('data-type') || ($.ajaxSettings && $.ajaxSettings.dataType);
// 
// 		if (element.is('form')) {
// 			method = element.attr('method');
// 			url = element.attr('action');
// 			data = element.serializeArray();
// 			// memoized value from clicked submit button
// 			var button = element.data('ujs:submit-button');
// 			if (button) {
// 				data.push(button);
// 				element.data('ujs:submit-button', null);
// 			}
// 		} else {
// 			method = element.attr('data-method');
// 			url = element.attr('href');
// 			data = null;
// 		}
// 
// 		$.ajax({
// 			url: url, type: method || 'GET', data: data, dataType: dataType,
// 			// stopping the "ajax:beforeSend" event will cancel the ajax request
// 			beforeSend: function(xhr, settings) {
// 				if (settings.dataType === undefined) {
// 					xhr.setRequestHeader('accept', '*/*;q=0.5, ' + settings.accepts.script);
// 				}
// 				return fire(element, 'ajax:beforeSend', [xhr, settings]);
// 			},
// 			success: function(data, status, xhr) {
// 				element.trigger('ajax:success', [data, status, xhr]);
// 			},
// 			complete: function(xhr, status) {
// 				element.trigger('ajax:complete', [xhr, status]);
// 			},
// 			error: function(xhr, status, error) {
// 				element.trigger('ajax:error', [xhr, status, error]);
// 			}
// 		});
// 	}
// 
// 	// Handles "data-method" on links such as:
// 	// <a href="/users/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
// 	function handleMethod(link) {
// 		var href = link.attr('href'),
// 			method = link.attr('data-method'),
// 			csrf_token = $('meta[name=csrf-token]').attr('content'),
// 			csrf_param = $('meta[name=csrf-param]').attr('content'),
// 			form = $('<form method="post" action="' + href + '"></form>'),
// 			metadata_input = '<input name="_method" value="' + method + '" type="hidden" />';
// 
// 		if (csrf_param !== undefined && csrf_token !== undefined) {
// 			metadata_input += '<input name="' + csrf_param + '" value="' + csrf_token + '" type="hidden" />';
// 		}
// 
// 		form.hide().append(metadata_input).appendTo('body');
// 		form.submit();
// 	}
// 
// 	function disableFormElements(form) {
// 		form.find('input[data-disable-with]').each(function() {
// 			var input = $(this);
// 			input.data('ujs:enable-with', input.val())
// 				.val(input.attr('data-disable-with'))
// 				.attr('disabled', 'disabled');
// 		});
// 	}
// 
// 	function enableFormElements(form) {
// 		form.find('input[data-disable-with]').each(function() {
// 			var input = $(this);
// 			input.val(input.data('ujs:enable-with')).removeAttr('disabled');
// 		});
// 	}
// 
// 	function allowAction(element) {
// 		var message = element.attr('data-confirm');
// 		return !message || (fire(element, 'confirm') && confirm(message));
// 	}
// 
// 	$('a[data-confirm], a[data-method], a[data-remote]').live('click.rails', function(e) {
// 		var link = $(this);
// 		if (!allowAction(link)) return false;
// 
// 		if (link.attr('data-remote')) {
// 			handleRemote(link);
// 			return false;
// 		} else if (link.attr('data-method')) {
// 			handleMethod(link);
// 			return false;
// 		}
// 	});
// 
// 	$('form').live('submit.rails', function(e) {
// 		var form = $(this);
// 		if (!allowAction(form)) return false;
// 
// 		if (form.attr('data-remote')) {
// 			handleRemote(form);
// 			return false;
// 		} else {
// 			disableFormElements(form);
// 		}
// 	});
// 
// 	$('form input[type=submit], form button[type=submit], form button:not([type])').live('click.rails', function() {
// 		var button = $(this);
// 		if (!allowAction(button)) return false;
// 		// register the pressed submit button
// 		var name = button.attr('name'), data = name ? {name:name, value:button.val()} : null;
// 		button.closest('form').data('ujs:submit-button', data);
// 	});
// 	
// 	$('form').live('ajax:beforeSend.rails', function(event) {
// 		if (this == event.target) disableFormElements($(this));
// 	});
// 
// 	$('form').live('ajax:complete.rails', function(event) {
// 		if (this == event.target) enableFormElements($(this));
// 	});
// })( jQuery );
