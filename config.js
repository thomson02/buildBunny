var commands = {
    reboot: { action: 'reboot' },
    clear: { action: 'clear' },
    noNoseFlash: { value: 0, action: 'ambient', type: 8 },
    singleNoseFlash: { value: 1, action: 'ambient', type: 8 },
    doubleNoseFlash: { value: 2, action: 'ambient', type: 8 },
    sadEars: { left: 9, right: 9, action: 'ears' },
    happyEars: { left: 1, right: 1, action: 'ears' },
    okEars: { left: 5, right: 5, action: 'ears' },
    exampleText: { action: "tts", txt: "This is Sparta!"}
};

var config = {
    server: {
        host: 'http://buildbunny.herokuapp.com',
        port: 3000,
		tz: "GMT"
    },
    bunnySerial: "0013d380f43f",
    plugins: {
        'ambient.plugin.js': {},
        'ears.plugin.js': {},
        'message.plugin.js': {},
        'reboot.plugin.js': {},
        'clear.plugin.js': {}
    },
    startupCommands: [ commands.singleNoseFlash ],
    scheduledCommands: [
		{ time: '00 00 09 * * 1-5', cmd: commands.singleNoseFlash },
        { time: '00 05 09 * * 1-5', cmd: { action: "tts", txt: "Have the phones been diverted?" } },
        { time: '00 00 13 * * 1-5', cmd: { action: "tts", txt: "I could murder a carrot. lunch time" } },
		{ time: '00 14 14 * * 1-5', cmd: { action: "tts", txt: "Have the phones been diverted?" } },
        { time: '00 30 17 * * 1-5', cmd: { action: "tts", txt: "Go home colin" } },
		{ time: '00 32 17 * * 1-5', cmd: { action: "tts", txt: "I said go home colin" } }
    ]
}

module.exports = config;
