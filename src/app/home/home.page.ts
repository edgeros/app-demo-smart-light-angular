import { Component, OnInit } from '@angular/core';
import { SocketioService } from '../service/socketio.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  // 智能灯列表
  smartLightMap = new Map<string, any>();

  constructor(private socketioService: SocketioService) { }

  ngOnInit() {
    this.socketioService.getSmartLightMapChange().subscribe((data: Map<string, any>) => {
      this.smartLightMap = data;
    });
  }

  doRefresh(event) {
    setTimeout(() => {
      this.socketioService.getSmartLightList();
      event.target.complete();
    }, 1000);
  }

  /**
   * 进入color页面
   * @param smartLight 
   */
  getColorPage(smartLight: any) {
    this.socketioService.openSmartLight(smartLight);
  }

}
