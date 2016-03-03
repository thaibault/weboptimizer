import offlineServiceWorker from 'offline-plugin/runtime'
import {bootstrap}          from 'angular2/platform/browser'
import {TestComponent}      from 'javaScript/angular/test.component'

offlineServiceWorker.install()
bootstrap(TestComponent)
