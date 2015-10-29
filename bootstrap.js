/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const {classes: Cc, interfaces: Ci, manager: Cm, utils: Cu} = Components;

Cu.import("resource://gre/modules/AddonManager.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const cr = Cm.QueryInterface(Ci.nsIComponentRegistrar);
const FAKE_IMPL_CLASSID = Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator).generateUUID();
const SYSTEMALERTSSERVICE_CID = "@mozilla.org/system-alerts-service;1";

let originalSysAlertObject = null;
let originalSysAlertsID = null;

function install(data, reason) { }

function startup(data, reason) {
  // TODO: check reason
  unregisterSystemAlerts();
}

function shutdown(data, reason) {
  // TODO: check reason
  reregisterSystemAlerts();
}

function uninstall(data, reason) { }

// Begin extension code

function fakeSysAlerts() {}
fakeSysAlerts.prototype = {
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAlertsService]),
};

function unregisterSystemAlerts() {
  if (originalSysAlertObject) {
    dump("already replaced system alerts\n");
    return;
  }

  originalSysAlertObject = Cm.getClassObject(Cc[SYSTEMALERTSSERVICE_CID], Ci.nsIFactory);
  originalSysAlertsID = Components.ID(Components.classes[SYSTEMALERTSSERVICE_CID].number);

  dump("already registered: " + cr.isCIDRegistered(originalSysAlertsID) + "\n");

  cr.unregisterFactory(originalSysAlertsID, originalSysAlertObject);
  // Simply unregistering the default implementation doesn't seem to be enough so we replace with a
  // dummy implementation too.
  cr.registerFactory(FAKE_IMPL_CLASSID, "fake sys alerts", SYSTEMALERTSSERVICE_CID, fakeSysAlerts);
}

function reregisterSystemAlerts() {
  if (!originalSysAlertObject) {
    dump("No original implementation\n");
    return;
  }
  try {
    let sysAlertsID = Components.ID(FAKE_IMPL_CLASSID.number);
    cr.unregisterFactory(sysAlertsID, XPCOMUtils._getFactory(fakeSysAlerts));
  } catch (ex) {
    Cu.reportError(ex);
  }

  cr.registerFactory(originalSysAlertsID, "system alerts", SYSTEMALERTSSERVICE_CID, originalSysAlertObject);
  originalSysAlertObject = null;
}
