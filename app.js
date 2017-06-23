'use strict';

var parseApkUtil =  require('./node-apk-parser/parseapk.js')

parseApkUtil.parseApkFile('app-debug.apk',function(data){

	console.log(data);
	parseApkUtil.saveIcon('app-debug.apk',data.iconName,"output.png");
})







// var ApkReader = require('node-apk-parser')

// var reader = ApkReader.readFile('offerwalldemo-ol-release.apk')
// var manifest = reader.readManifestSync()

// console.log(manifest);
// console.log(manifest.package);
