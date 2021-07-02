import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { SocketioService } from './service/socketio.service';
import { ToastService } from './service/toast.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, HammerModule, IonicModule.forRoot({rippleEffect: false,
    mode: 'ios',
    backButtonIcon: 'chevron-back-outline',
    backButtonText: ''
  }),
  AppRoutingModule,
  HttpClientModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SocketioService,
    ToastService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
