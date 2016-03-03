import {Component} from 'angular/core';
import {Jsonp, JSONP_PROVIDERS, URLSearchParams} from 'angular/http';

import {TestService} from 'javaScript/angular/test.service';

import templateURL from 'template/test'

@Component({
    selector: 'test-app',
    viewProviders: [JSONP_PROVIDERS],
    templateUrl: templateURL
})
export class TestComponent {
    constructor(jsonp: Jsonp) {
        let params = new URLSearchParams()
        params.set('__model__', 'Site')
        params.set('callback', 'JSONP_CALLBACK')
        jsonp.get('https://www.jobrad.org/webNode', {search: params})
        .subscribe(request => { console.log(request.json())});

        let testService = new TestService()
    }
}
