import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorPage } from './color.page';

import { ColorPageRoutingModule } from './color-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ColorPageRoutingModule
  ],
  declarations: [ColorPage]
})
export class ColorPageModule {}
