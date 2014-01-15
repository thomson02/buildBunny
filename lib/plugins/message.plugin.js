'use strict';
var encode = require('./../encode.js');
exports.init = function(plugins, server){
	plugins.listen(this, 'ping', function(args){
		var doc = args.doc,
			data = args.data,
			msg = [];
		var code = 'ID ' + Math.floor((new Date).getTime() / 1000) + '\n';	
		code += 'MU http://172.24.1.136:3000/tts.mp3';
		if(doc && doc.action && doc.action === 'tts'){
			encode.message(msg, code);
			
			data.push(0x0A);
			
			encode.length(data, msg.length);
			console.log(msg.length);
			[].forEach.call(msg, function(e){ 
				// console.log(e);
				data.push(e);
			}); 
		}
	});
};