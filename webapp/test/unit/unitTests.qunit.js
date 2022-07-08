/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"zz1_edit_cartoes/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
