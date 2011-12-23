function escape() {
	var before = $("#notEscaped").val();
	var after = before.replace(/([\\\*\+\.\?\{\}\(\)\[\]\^\$\-\|\/])/g, "\\$1").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
	$("#escaped").val(after);
}

function unescape() {
	var before = $("#escaped").val();
	var after = before.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/(\\(\\|\*|\+|\.|\?|\{|\}|\(|\)|\[|\]|\^|\$|\-|\||\/))/g, function (whole, s1) {
		return s1.substring(1);
	});
	$("#notEscaped").val(after);
}
