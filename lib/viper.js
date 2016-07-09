// This seeks out and organizes information about USB devices
// that are (or might be) attached to the host.
//
// The format of the hardware specification files for the Arduino IDE
// is described at
//
// https://github.com/arduino/Arduino/wiki/Arduino-IDE-1.5-3rd-party-Hardware-specification
//
// This program is strict-mode throughout.
//
// Doug Johnson, July 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('DEBUG');

const Sequencer = require("lib/Sequencer").Sequencer;
const args = require('node-args');
const fs = require('fs');

class VIDPID {

  constructor(boardPathArray) {
    const boardPaths = (Array.isArray(boardPathArray)) ? boardPathArray : [boardPathArray];
    this.boardMap = new Map();

    if (boardPaths.length > 0) {
      fs.open(boardPaths[0],'r',(err,fd) => {
          if (err) throw err;
          log.info(`Open:  fd: ${fd}, board.txt: ${boardPaths[0]}`);

          let pattern = /^(\w+)\.name=(.*)$/;
          let results = [];

          let board;

          fs.readFile(fd, 'utf8', (err,text) => {
            if (err) throw err;
            const lines = text.split('\n');

            // Extract short name and long name

            lines.forEach((line) => {
              board = new Map();
              let groups = line.match(pattern);
              if (groups !== null) {
                board.set('boardID',groups[1]);
                board.set('name',groups[2]);
                board.set('vendorIDs',{});
                this.boardMap.set(groups[1],board);
              }
            });

            // Extract Vendor IDs

            pattern = /^(\w+)\.vid\.(\d+)=(0x[0-9A-Fa-f]+)$/;
            lines.forEach((line) => {
              let groups = line.match(pattern);
              if (groups !== null) {
                let boardID = groups[1];
                let vidIndex = groups[2];
                let vid = groups[3];

                board = this.boardMap.get(boardID);
                let vids = board.get('vendorIDs');
                vids[vidIndex] = { v: vid };
              }
            });

            // Extract Product IDs

            pattern = /^(\w+)\.pid\.(\d+)=(0x[0-9A-Fa-f]+)$/;
            lines.forEach((line) => {
              let groups = line.match(pattern);
              if (groups !== null) {
                let boardID = groups[1];
                let vidIndex = groups[2];
                let pid = groups[3];

                board = this.boardMap.get(boardID);
                let vids = board.get('vendorIDs');
                vids[vidIndex].p = pid;
              }
            });

            console.log('marker-------abc----------');
            this.boardMap.forEach((brd) => {
              console.log(brd);
            });
            console.log('marker-------def----------');
            log.info(`boardMap has ${this.boardMap.size} entries.`);
            console.log('marker-------ghi----------');

          fs.close(fd,(err) => {
              if (err) throw err;
              log.info(`Close: fd: ${fd}`);
          });
        });
      });
    }
  }
}

// let getAction = {
//   cmd: 'c:/apps/curl-7.49.1/bin/curl',
//   user: 'finson',
//   out: './bldsrc/libraries',
//   options: {L:''}
// };

// let getItem = {
//   repoRoot: 'https://api.github.com/repos',
//   repos: [
//   {name:'Luni', branch: 'v0.10.0', release: 'latest'},
//   {name: 'FirmataWithDeviceFeature', branch: 'v0.10.0', release: 'latest'}
//   ]
// };

// let bldAction = {
//   cmd: "arduino-builder",
//   options: {'debug-level': '5'},
//   hardware: ['C:/PROGRA~2/Arduino/hardware','C:/Users/finson/AppData/Local/Arduino15/packages'],
//   tools: ['C:/PROGRA~2/Arduino/hardware/tools/avr','C:/PROGRA~2/Arduino/tools-builder',
//   'C:/Users/finson/AppData/Local/Arduino15/packages'],
//   libraries: [],
//   target: 'e:/users/finson/repos/batman/bldtgt'
// };

// let bldItem = {
//   name: 'uno-blinker',
//   board: 'arduino:avr:uno',
//   sketch: './bldsrc/Blink/Blink.ino',
//   libraries: '',
//   options: {}
// };

// let bat = new Builder.BldMan();

// let seq = new Sequencer(bat,["exit"]);
// log.trace(`Sequencer is created.`);

// seq.on("error", (apiError) => {
//   log.error(`Error: ${apiError}`);
// });

// seq.on("done", (apiResult) => {
//   log.info(`Steps completed.`);
// });

// function makeStepFunction(c) {
//   return function(apiResult) {
//     log.debug(`step result: ${apiResult.status}`);
//     log.debug(`next step: ${c}`);
//     bat.executeOSCommand(c);
//   };
// }

// let osCmd = bat.composeGetCommand(getAction,getItem);
// let step = [];
// for (let c of osCmd) {
//   log.trace(c);
//   step.push(makeStepFunction(c));
// }

// seq.start(step);


// osCmd = bat.composeBuildCommand(bldAction,bldItem);
// log.info(osCmd);
// bat.executeOSCommand(osCmd);

const paths = [  "C:/apps/Arduino/hardware/arduino/avr/boards.txt"];
let VP = new VIDPID(paths);
