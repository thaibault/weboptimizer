#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'; // region imports

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _clientnode = _interopRequireDefault(require("clientnode"));

var _browserAPI = _interopRequireDefault(require("../browserAPI.compiled"));

//import registerTest from 'clientnode/test.compiled'
// endregion
//registerTest(function():void {
var a = function a(b) {
  return b();
}; //a(() =>


test('browserAPI', function (done) {
  (0, _browserAPI["default"])(function (api) {
    (0, _browserAPI["default"])(function (api, alreadyCreated) {
      return expect(alreadyCreated).toBe(true);
    });
    done();
    /*
    assert.notOk(api.debug)
    assert.ok(api.window.hasOwnProperty('document'))
    assert.ok(api.window.document.hasOwnProperty('location'))
    assert.ok(
        api.window.document.querySelector('body') instanceof
        Object
    )
    const done:Function = assert.async()
    const timer:Promise<boolean> = Tools.timeout(done, 100)
    api.window.document.addEventListener(
        'DOMContentLoaded',
        (event:Object):void => {
            // IgnoreTypeCheck
            timer.clear()
            assert.ok(event)
            done()
        }
    )
    */
  }, false);
}); ///*}, 'plain'*/)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2Jyb3dzZXJBUEkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFFQTtBQUNBLGEsQ0FDQTs7OztBQUNBOztBQUdBOztBQUZBO0FBSUE7QUFDQTtBQUNBLElBQU0sQ0FBQyxHQUFHLFNBQUosQ0FBSSxDQUFDLENBQUQ7QUFBQSxTQUFPLENBQUMsRUFBUjtBQUFBLENBQVYsQyxDQUNBOzs7QUFDSSxJQUFJLENBQUMsWUFBRCxFQUFlLFVBQUMsSUFBRCxFQUF3QjtBQUN2Qyw4QkFDSSxVQUFDLEdBQUQsRUFBeUI7QUFDckIsZ0NBQVcsVUFBQyxHQUFELEVBQWlCLGNBQWpCO0FBQUEsYUFDUCxNQUFNLENBQUMsY0FBRCxDQUFOLENBQXVCLElBQXZCLENBQTRCLElBQTVCLENBRE87QUFBQSxLQUFYO0FBR0EsSUFBQSxJQUFJO0FBQ0o7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JILEdBMUJMLEVBMkJJLEtBM0JKO0FBNkJILENBOUJHLENBQUosQyxDQStCSjtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJyb3dzZXJBUEkuY29tcGlsZWQuanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG4vL2ltcG9ydCByZWdpc3RlclRlc3QgZnJvbSAnY2xpZW50bm9kZS90ZXN0LmNvbXBpbGVkJ1xuXG5pbXBvcnQgYnJvd3NlckFQSSBmcm9tICcuLi9icm93c2VyQVBJLmNvbXBpbGVkJ1xuaW1wb3J0IHR5cGUge0Jyb3dzZXJBUEl9IGZyb20gJy4uL3R5cGUnXG4vLyBlbmRyZWdpb25cbi8vcmVnaXN0ZXJUZXN0KGZ1bmN0aW9uKCk6dm9pZCB7XG5jb25zdCBhID0gKGIpID0+IGIoKVxuLy9hKCgpID0+XG4gICAgdGVzdCgnYnJvd3NlckFQSScsIChkb25lOkZ1bmN0aW9uKTp2b2lkID0+IHtcbiAgICAgICAgYnJvd3NlckFQSShcbiAgICAgICAgICAgIChhcGk6QnJvd3NlckFQSSk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgYnJvd3NlckFQSSgoYXBpOkJyb3dzZXJBUEksIGFscmVhZHlDcmVhdGVkOmJvb2xlYW4pOnZvaWQgPT5cbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0KGFscmVhZHlDcmVhdGVkKS50b0JlKHRydWUpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGRvbmUoKVxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgYXNzZXJ0Lm5vdE9rKGFwaS5kZWJ1ZylcbiAgICAgICAgICAgICAgICBhc3NlcnQub2soYXBpLndpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnZG9jdW1lbnQnKSlcbiAgICAgICAgICAgICAgICBhc3NlcnQub2soYXBpLndpbmRvdy5kb2N1bWVudC5oYXNPd25Qcm9wZXJ0eSgnbG9jYXRpb24nKSlcbiAgICAgICAgICAgICAgICBhc3NlcnQub2soXG4gICAgICAgICAgICAgICAgICAgIGFwaS53aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpIGluc3RhbmNlb2ZcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGNvbnN0IGRvbmU6RnVuY3Rpb24gPSBhc3NlcnQuYXN5bmMoKVxuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVyOlByb21pc2U8Ym9vbGVhbj4gPSBUb29scy50aW1lb3V0KGRvbmUsIDEwMClcbiAgICAgICAgICAgICAgICBhcGkud2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICdET01Db250ZW50TG9hZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgKGV2ZW50Ok9iamVjdCk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5vayhldmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKVxuICAgIH0pXG4vLy8qfSwgJ3BsYWluJyovKVxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=