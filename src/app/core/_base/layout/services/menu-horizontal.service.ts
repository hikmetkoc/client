// Angular
import { Injectable } from '@angular/core';
// RxJS
import { BehaviorSubject } from 'rxjs';
// Object path
import * as objectPath from 'object-path';
// Services
import { MenuConfigService } from './menu-config.service';
import { Utils } from '../../../../content/_base/utils';

@Injectable()
export class MenuHorizontalService {
	// Public properties
	menuList$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	/**
	 * Service constructor
	 *
	 * @param menuConfigService: MenuConfigService
	 */
	constructor(private menuConfigService: MenuConfigService) {
		this.loadMenu();
	}

	/**
	 * Load menu list
	 */
	loadMenu() {
		// get menu list
		const menuItems: any[] = objectPath.get(this.menuConfigService.getMenus(), 'header.items');

		const filteredItems = [];
		for (let menuItem of menuItems) {
			if (menuItem.page === '/report' && !Utils.hasOperation('Rapor_Alıcısı')) {
			} else if (menuItem.page === '/user' && !Utils.hasOperation('IK_Goruntuleme')) {
			} else if (menuItem.page === '/quote' && !Utils.hasOperation('Yonetici_Raporu_Goruntuleme')) {
			} else if (menuItem.page === '/customer' && !Utils.hasOperation('Tedarikci_Goruntuleme')) {
			} else if (menuItem.page === '/buy' && !Utils.hasOperation('Teklif_Goruntuleme')) {
			} else if (menuItem.page === '/store' && !Utils.hasOperation('Satınalma_Goruntuleme')) {
			} else if (menuItem.page === '/limit' && !Utils.hasOperation('Limit_Goruntuleme')) {
			} else if (menuItem.page === '/contproduct' && !Utils.hasOperation('Urunler_Goruntuleme')) {
			} else if (menuItem.page === '/holiday' && !Utils.hasOperation('Izinler_Goruntuleme')) {
			} else if (menuItem.page === '/customtask' && !Utils.hasOperation('Gorevler_Goruntuleme')) {
			} else if (menuItem.page === '/customactivity' && !Utils.hasOperation('Aktiviteler_Goruntuleme')) {
			} else if (menuItem.page === '/task' && !Utils.hasOperation('Talep_Goruntuleme')) {
			} else if (menuItem.page === '/activity' && !Utils.hasOperation('Islem_Goruntuleme')) {
			} else if (menuItem.page === '/offer' && !Utils.hasOperation('TedarikciTeklif_Goruntuleme')) {
			} else if (menuItem.page === '/paymentorder' && !Utils.hasOperation('Talimat_Goruntuleme')) {
			} else if (menuItem.page === '/vocationday' && !Utils.hasOperation('TatilGunleri_Goruntuleme')) {
			} else if (menuItem.page === '/invoicelist' && !Utils.hasOperation('FaturaListesi_Goruntuleme')) {
			} else if (menuItem.page === '/holmanager' && !Utils.hasOperation('Yetkizin_Goruntuleme')) {
			} else if (menuItem.page === '/userpermission' && !Utils.hasOperation('Yetkizin_Goruntuleme')) {
			} else if (menuItem.page === '/spend' && !Utils.hasOperation('Odemeler_Goruntuleme')) {
			} else if (menuItem.page === '/fuellimit' && !Utils.hasOperation('YakitLimit_Goruntuleme')) {
			} else if (menuItem.page === '/material' && !Utils.hasOperation('Demirbas_Goruntuleme')) {
			} else if (menuItem.page === '/motionsums' && !Utils.hasOperation('Hesaplar_Goruntuleme')) {
			} else if (menuItem.title === 'PROJE İŞLEMLERİ' && !Utils.getDepartment()) {
			} else if (menuItem.title === 'FATURA İŞLEMLERİ' && !Utils.hasOperation('FaturaListesi_Goruntuleme')) {
			// } else if (menuItem.title === 'RİSK ANALİZ' && !Utils.hasOperation('RiskAnalizCari_Goruntuleme')) {
			} else if (menuItem.title === 'TEDARİKÇİ İŞLEMLERİ' && !Utils.hasOperation('Tedarikci_Goruntuleme')) {
			} else if (menuItem.title === 'SATIN ALMA İŞLEMLERİ' && !Utils.hasOperation('Satınalma_Goruntuleme')) {
			} else if (menuItem.title === 'TALEPLER' && !Utils.hasOperation('Talep_Goruntuleme')) {
			} else if (menuItem.title === 'Dashboard' && !Utils.hasOperation('Talep_Goruntuleme')) {
			} else {
				filteredItems.push(menuItem);
			}
		}

		this.menuList$.next(filteredItems);

		if (menuItems === filteredItems) {
			return true;
		} else {
			return false;
		}
	}
}
