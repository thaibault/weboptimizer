import {Injectable} from 'angular/core';
import jQuery from 'jquery';
import jQueryTools from 'imports?$=jquery!coffeeScript/jQuery/jquery-tools-1.0';

@Injectable()
export class TestService {
    constructor() {
        console.log(jQuery('body').Tools('generateDirectiveSelector', 'my-app'))
    }
}
