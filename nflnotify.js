var parseArgs = require('minimist'),
    growl = require('growl'),
    xml2js = require('xml2js'),
    rp = require('request-promise'),
    args = parseArgs(process.argv.slice(2)),
    options,
    games = []

if(args.h || args.help) {
  helpText() 
  process.exit()
}

options = {
  url: args.url || "http://www.scorespro.com/rss2/live-football.xml",
  refresh: args.r || args.refresh || 5
}

function poll() {
  rp(options.url).then(processResp)
  setTimeout(poll, options.refresh * 1000)
}

function processResp(response) {
  //Will eventually promisify xml2js
  xml2js.parseString(response, function(err, data) {
    for(var i = 0; i < data.rss.channel[0].item.length; i++) {
      var title = data.rss.channel[0].item[i].title[0]
      if(title.includes("USA-NFL")) {
        title = title.split(")")[1]
        var newGame = true
        for(var k = 0; k < games.length; k++)
          if(games[k] == title)
            newGame = false
        if(newGame) {
          growl(title)
          games.push(title)
        }
      }
    }
  })
}


poll()
function helpText() {
  console.log('')
  console.log('Usage: node nflnotify.js [args]')
  console.log('')
  console.log('Options:')
  console.log('  -h, --help         Prints this help text')
  console.log('  -r, --refresh      How often to check for new scores (in seconds)')
  console.log('  --url              Location to pull scores from')
}