import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as io from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from './toast.service';
import { edger } from '@edgeros/web-sdk';

@Injectable({
  providedIn: 'root',
})
export class SocketioService {
  // 定义socketio客户端对象
  private socket: SocketIOClient.Socket;

  // 包含用户token和srand数据
  private payload: any;

  // 设备列表
  smartLightMap = new Map<string, any>();

  // 设备列表，可观察对象
  smartLightMapChange = new BehaviorSubject<Map<string, any>>(new Map<string, any>());

  // 当前设备
  smartLight: any;

  // 当前设备，观察者对象
  smartLightChange = new BehaviorSubject<any>({});

  // 智能灯状态信息
  smartLightStatus = {
    brightness: 1,
    colorTemperature: 1,
    channel0: false
  };

  // 当前智能灯的状态， 观察者对象
  smartLightStatusChange = new BehaviorSubject<any>(this.smartLightStatus);

  constructor(
    private router: Router,
    private toast: ToastService,
  ) {
    edger.onAction('token', (data: any) => {
      if (!data) {
        this.toast.failPresentToast('请先登录！');
      }
      this.payload = data;
    });

    edger.token().then((data: any) => {
      if (!data) {
        this.toast.failPresentToast('请先登录！');
      }
      this.payload = data;
      this.socket = io({
        path: '/light',
        query: {
          'edger-token': this.payload.token,
          'edger-srand': this.payload.srand,
        },
      });
      this.initSocket();
    });
  }

  /**
   * 返回一个socketio连接
   */
  getSocket() {
    return this.socket;
  }

  /**
   * 初始化监听事件
   */
  initSocket() {
    this.socket.on('reconnect_attempt', (attempt) => {
      this.socket.io.opts.query = {
        'edger-token': this.payload.token,
        'edger-srand': this.payload.srand,
      };
    });
    this.socket.on('connect_error', (error) => {
      this.toast.failPresentToast('连接错误，错误：' + error);
    });
    this.socket.on('connect_timeout', (timeout) => {
      this.toast.failPresentToast('连接超时,用时：' + timeout);
    });
    this.socket.on('error', (error) => {
      this.toast.failPresentToast('发生错误，错误：' + error);
    });

    this.socket.on('connect', () => {
      this.getSmartLightList();
    });
    this.socket.on('disconnect', () => {
      this.router.navigateByUrl('home');
    });

    this.socket.on('light-lost', (devid) => {
      edger.notify.info(this.smartLightMap.get(devid).alias + '设备已下线');
      this.smartLightMap.delete(devid);
      this.smartLightMapChange.next(this.smartLightMap);
    });
    this.socket.on('light-join', (smartLight: any) => {
      if (!this.smartLightMap.has(smartLight.id)) {
        this.smartLightMap.set(smartLight.id, smartLight);
        this.smartLightMapChange.next(this.smartLightMap);
        edger.notify.info(`新上线了 ${smartLight.id} 设备`);
      }
    });

    this.socket.on('light-error', (error) => {
      this.toast.failPresentToast(error.error);
    });

    this.socket.on('light-message', (data) => {
      console.log(data);
      if(data.channel0 !== undefined) {
        this.smartLightStatus.channel0 = data.channel0;
      }
      if(data.colorTemperature !== undefined) {
        this.smartLightStatus.colorTemperature = data.colorTemperature;
      }
      if(data.brightness !== undefined) {
        this.smartLightStatus.brightness = data.brightness;
      }
      this.smartLightStatusChange.next(this.smartLightStatus);
    });

  }

  /**
   * 获取设备列表
   */
  getSmartLightList() {
    this.socket.emit('light-list', (data: any[]) => {
      console.log(data);
      this.smartLightMap.clear();
      data.forEach((value) => {
        this.smartLightMap.set(value.id, value);
      });
      this.smartLightMapChange.next(this.smartLightMap);
    });
  }

  /**
   * 打开此智能灯
   * @param smartLight 
   */
  openSmartLight(smartLight: any) {
    this.socket.emit('light-select', smartLight.devid, (data) => {
      console.log(data);
      if (data.result) {
        this.router.navigateByUrl('color');
        this.smartLight = smartLight;
        this.smartLightChange.next(this.smartLight);
      } else {
        if(data.code === 50004) {
          edger.notify.error('你没有此设备权限！');
        } else {
          edger.notify.error('未知错误！');
        }
      }
    });
  }

  /**
   * 智能灯状态控制
   * @param request 
   */
  controlSmartLightStatus(request: any) {
    this.socket.emit('light-control', request);
  }

  /**
   * 获取设备map 观察者对象
   */
  getSmartLightMapChange() {
    return this.smartLightMapChange;
  }

  /**
   * 获取设备设备信息 观察者对象
   */
  getSmartLightChange() {
    return this.smartLightChange;
  }

  /**
   * 获取设备设备状态信息 观察者对象
   */
  getSmartLightStatusChange() {
    return this.smartLightStatusChange;
  }

}
