ace.config.set('basePath', '/@/node_modules/ace-builds/src-min-noconflict')
var editor = ace.edit("editor")
editor.setTheme("ace/theme/textmate");
document.body.dataset.contentType && editor.session.setMode("ace/mode/" + document.body.dataset.contentType);
