import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import {MyIdService} from "../my-id.service";

@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
  constructor(private myId: MyIdService) {
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clone the request and modify the headers
    const modifiedRequest = request.clone({
      setHeaders: {
        'X-CLIENT-ID': this.myId.get()
      }
    });

    return next.handle(modifiedRequest);
  }
}
