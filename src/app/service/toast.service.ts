import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  /**
   * 弹出成功消息
   * @param msg 
   */
  async successPresentToast(msg) {
    const toast = await this.toastController.create({
      color: 'primary',
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }

  /**
   * 
   * @param msg 弹出失败消息
   */
  async failPresentToast(msg) {
    const toast = await this.toastController.create({
      color: 'danger',
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
}
