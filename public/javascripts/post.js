// New post stuff
$(document).ready(function () {

	$("#counter").text('140');
	$("#micropost_content").text("").focus();
	
	function charCounter () {
		$("#micropost_content").keypress(function (e) {
			var chars = 140 - $("#micropost_content").val().length;
			$("#counter").text(chars);

			if (chars < 0)
			{
				$("#counter").css({"color":"red"});
			};			
			
			if (chars >= 0)
			{
				$("#counter").css({"color":"black"});
			};			
		});
	};
	
	charCounter();
		
});