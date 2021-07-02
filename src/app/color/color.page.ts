import { Component } from '@angular/core';
import { SocketioService } from '../service/socketio.service';

@Component({
  selector: 'app-color',
  templateUrl: 'color.page.html',
  styleUrls: ['color.page.scss'],
})
export class ColorPage {

  lightImg = './assets/img/smart_light.png';

  smartLight: any;

  debounce = 100;

  color = 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)';

  dark = '#92949c';

  smartLightStatus = {
    brightness: 1,
    colorTemperature: 1,
    channel0: false
  }

  constructor(
    private socketioService: SocketioService,
  ) { }

  ngOnInit() {
    this.socketioService.getSmartLightChange().subscribe((data: any) => {
      this.smartLight = data;
    });
  }

  ionViewWillEnter() {
    this.socketioService.getSmartLightStatusChange().subscribe((data: any) => {
      this.smartLightStatus.channel0 = data.channel0;
      this.smartLightStatus.colorTemperature = data.colorTemperature;
      this.smartLightStatus.brightness = data.brightness;
      if (!this.smartLightStatus.channel0) {
        this.color = this.dark;
      } else {
        const rgb = this.cct2rgb(this.smartLightStatus.colorTemperature);
        const hexColor = this.RGBToHex(rgb);
        if(hexColor !== -1) {
          this.color = hexColor;
        }
      }
    });
  }

  /**
   * 开关控制
   */
  changeChannel0() {
    this.socketioService.controlSmartLightStatus({
      channel0: !this.smartLightStatus.channel0
    });
  }


  /**
   * 亮度控制
   */
  changeBrightness() {
    if (this.smartLightStatus.channel0) {
      this.socketioService.controlSmartLightStatus({
        brightness: this.smartLightStatus.brightness
      });
    }
  }

  /**
   * 色温控制
   */
  changeColorTemperature() {
    if (this.smartLightStatus.channel0) {
      this.socketioService.controlSmartLightStatus({
        colorTemperature: this.smartLightStatus.colorTemperature
      });
    }
  }

  /**
   * 色温转化为rgb 通过线性关系模拟
   * 本应对应的是2700k ~ 6500K，由于此智能灯的设计，色温值只能用1~500来进行模拟
   * @param cct 色温
   */
  cct2rgb(cct: number): Array<number> {
    // 2700k 对应 rgb
    const rgbMin = [255, 169, 87];
    // 6500k 对应 rgb
    const rgbMax = [255, 249, 251];
    const cctMin = 1;
    const cctMax = 500;
    const k = (cct - cctMax) / (cctMin - cctMax);
    const r = rgbMin[0] * (1 - k) + rgbMax[0] * k;
    const g = rgbMin[1] * (1 - k) + rgbMax[1] * k;
    const b = rgbMin[2] * (1 - k) + rgbMax[2] * k;
    return [Math.round(r), Math.round(g), Math.round(b)];
  }

  /**
   * rgb颜色转16进制
   * @param num rgb数组
   */
  RGBToHex(num: Array<number>): any {
    if (
      num[0] >= 0 &&
      num[0] <= 255 &&
      num[1] >= 0 &&
      num[1] <= 255 &&
      num[2] >= 0 &&
      num[2] <= 255
    ) {
      return (
        '#' +
        (num[0].toString(16).length < 2
          ? '0' + num[0].toString(16)
          : num[0].toString(16)) +
        (num[1].toString(16).length < 2
          ? '0' + num[1].toString(16)
          : num[1].toString(16)) +
        (num[2].toString(16).length < 2
          ? '0' + num[2].toString(16)
          : num[2].toString(16))
      );
    } else {
      return -1;
    }
  }
}
