import { ActionNotificationComponent } from './dialogs/action-notification/action-notification.component';
import { MatSnackBar } from '@angular/material';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { Pipe, PipeTransform } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material';
import { environment } from '../../../environments/environment';

export class Utils {

    static phoneMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
	static ibanMask: Array<RegExp | string> = ['T', 'R', /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/];

	static currencyMask = createNumberMask({
        prefix: '',
        suffix: '', // BURADA TL yazıyordu.
        thousandsSeparatorSymbol: '.',
        allowDecimal: true,
        decimalSymbol: ',',
        decimalLimit: 2
    });
	static currencyMask2 = createNumberMask({
		prefix: '',
		suffix: '',
		thousandsSeparatorSymbol: '.',
		allowDecimal: true,
		decimalSymbol: ',',
		decimalLimit: 2
	});
    static percentageMask = createNumberMask({
        prefix: '% ',
        suffix: '',
        thousandsSeparatorSymbol: '.',
        allowDecimal: true,
        decimalSymbol: ',',
        decimalLimit: 2
    });
    static integerMask = createNumberMask({
        prefix: '',
        suffix: '',
        thousandsSeparatorSymbol: '',
        allowDecimal: false,
        decimalSymbol: ',',
        decimalLimit: 0
    });
    static hourMask = createNumberMask({
        prefix: '',
        suffix: '',
        thousandsSeparatorSymbol: '',
        allowDecimal: false,
        decimalSymbol: ',',
        decimalLimit: 0,
        integerLimit: 2,
        allowLeadingZeroes: true
    });
    private static models: any;
    static operatorList = [
        {
            name: 'EQUALS',
            title: 'Eşittir'
        },
        {
            name: 'CONTAINS',
            title: 'İçerir'
        },
        {
            name: 'STARTS_WITH',
            title: 'İle Başlar'
        },
        {
            name: 'ENDS_WITH',
            title: 'İle Biter'
        },
        {
            name: 'GREATER_THAN',
            title: 'Büyüktür'
        },
        {
            name: 'GREATER_OR_EQUAL_THAN',
            title: 'Büyük veya Eşittir'
        },
        {
            name: 'LESS_THAN',
            title: 'Küçüktür'
        },
        {
            name: 'LESS_OR_EQUAL_THAN',
            title: 'Küçük veya Eşittir'
        },
        {
            name: 'BETWEEN',
            title: 'Arasındadır'
        },
        {
            name: 'IN',
            title: 'Bunlardan Biridir'
        },
        {
            name: 'SPECIFIED',
            title: 'Değer Girilmiş'
        }
    ];
    static aggregates = [
        {
            name: 'DEFAULT',
            title: 'Hiçbiri'
        },
        {
            name: 'COUNT',
            title: 'Say'
        },
        {
            name: 'SUM',
            title: 'Topla'
        },
        {
            name: 'MIN',
            title: 'En Düşük'
        },
        {
            name: 'MAX',
            title: 'En Büyük'
        },
        {
            name: 'AVG',
            title: 'Ortalama'
        }
    ];

    public static getModels() {
        if (!this.models) {
            this.models = [];
            const metadata = JSON.parse(localStorage.getItem('metadata'));
            for (const entity of Object.values(metadata)) {
                let model: any = {};
                model.apiName = entity['apiName'];
                model.name = entity['name'];
                model.title = entity['title'];
                model.pluralTitle = entity['pluralTitle'];
                model.name = entity['name'];
                model.readOnly = entity['readOnly'];
                model.display = entity['display'];
                model.required = entity['required'];
                model.displayField = entity['displayField'];
                model.fields = [];
                for (const field of Object.values(entity['fieldMetadataMap'])) {
                    if (field['type'] === 'String') {
                        field['fieldType'] = 'text';
                    } else if (field['type'] === 'UUID') {
                        field['fieldType'] = 'text';
                    } else if (field['type'] === 'BigDecimal') {
                        field['fieldType'] = 'currency';
                    } else if (field['type'] === 'Instant') {
                        field['fieldType'] = 'time';
                    } else if (field['type'] === 'Object' && field['objectApiName'] !== 'attribute-values') {
                        field['fieldType'] = 'object';
                    } else if (field['type'] === 'Object' && field['objectApiName'] === 'attribute-values') {
                        field['fieldType'] = 'select';
                    } else if (field['objectApiName'] === 'spends' && field['name'] === 'paymentorder') {
						field['fieldType'] = 'object';
					} else if (field['type'] === 'User') {
                        field['fieldType'] = 'object';
                        field['objectApiName'] = 'users';
                    } else if (field['type'] === 'List') {
                        continue;
                    } else if (field['type'] === 'Double') {
                        field['fieldType'] = 'number';
                    } else if (field['type'] === 'Long') {
                        field['fieldType'] = 'number';
                    } else if (field['type'] === 'Integer') {
                        field['fieldType'] = 'number';
                    } else if (field['type'] === 'Boolean') {
                        field['fieldType'] = 'boolean';
                    } else if (field['type'] === 'Email') {
                        field['fieldType'] = 'email';
                    } else if (field['type'] === 'Phone') {
                        field['fieldType'] = 'phone';
                    } else if (field['type'] === 'Disabled') {
						field['fieldType'] = 'disabled';
					} else if (field['type'] === 'iban') {
						field['fieldType'] = 'iban';
					}
                    model.fields.push(field);
                }
                model.fields.sort(function (a, b) {
                    return a.priority - b.priority;
                });
                this.models.push(model);
            }
            console.log('models', this.models);
        }
        return this.models;
    }

    public static initModels() {
        this.models = undefined;
    }

    public static getModel(name) {
        const models = this.getModels();
        for (const model of models) {
            if (model.name.toUpperCase() === name.toUpperCase() || model.apiName.toUpperCase() === name.toUpperCase()) {
                return model;
            }
        }
        return undefined;
    }

    public static getField(fields, fieldName) {
        for (const field of fields) {
            if (field.name === fieldName) {
                return field;
            }
        }
        return undefined;
    }

    public static lowerCaseFirst(a) {
        return a.charAt(0).toLowerCase() + a.slice(1);
    }

    public static showActionNotification(
        // TODO: It must user own snackbar service
        message: string,
        type: 'success' | 'warning' | 'error' = 'success',
        duration: number = 10000,
        showCloseButton: boolean = true,
        showUndoButton: boolean = false,
        undoButtonDuration: number = 3000,
        snackBar: MatSnackBar
    ) {
        const snackBarRef = snackBar.openFromComponent(ActionNotificationComponent, {
            duration,
            data: {
                message,
                snackBar,
                showCloseButton,
                showUndoButton,
                undoButtonDuration
            },
            panelClass: type === 'warning' ? ['kt-bg-error'] : [],
            verticalPosition: type === 'error' ? 'top' : 'top'
        });
        return snackBarRef.afterDismissed();
    }

    public static currency2Float(str: any) {
        if (!this.isSet(str)) { return undefined; }
        str = str.toString();
        str = str.replace(/\./g, '');
        str = str.replace(/,/g, '.');
        str = str.replace(' TL', '');
        str = str.replace('% ', '');
        str = parseFloat(str);
        return str ? str : 0;
    }

    public static makeIntegers(str: any) {
        if (Array.isArray(str)) {
            const newStr = [];
            for (let st of str) {
                st = this.makeInteger(st);
                newStr.push(st);
            }
            return newStr;
        } else {
            return this.makeInteger(str);
        }

    }

    public static makeInteger(str: any) {
        if (!str) { return str; }
        str = str.toString();
        str = str.replace(/\D+/g, '');
        str = parseInt(str, null);
        return str;
    }

    public static makeTurkish(str: any) {
        if (!str) { return str; }
        str = str.toString();
        str = str.replace('.', ',');
        return str;
    }

    public static makeRows(rows: any, model: any) {
        for (const row of rows) {
            for (const field of model.fields) {
                if (field.name === 'id' && !row[field.name]) {
                } else if (field.fieldType === 'currency' || field.fieldType === 'percentage') {
                    row[field.name] = Utils.currency2Float(row[field.name]);
                } else if (field.fieldType === 'phone' || field.fieldType === 'select') {
                    row[field.name] = Utils.makeInteger(row[field.name]);
                } else if (field.fieldType === 'time' || field.fieldType === 'date') {
                    row[field.name] = row[field.name] ? row[field.name].toString().replace('+03:00', '') : undefined;
                } else if (field.fieldType === 'number') {
                    row[field.name] = parseFloat(row[field.name]);
                }
            }
        }
        return rows;
    }

    public static downloadFile(data: any, type?: string, fileName?: any) {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        let mimeType;
        if (type === 'Excel') {
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            fileName += '.xlsx';
        } else if (type === 'Csv') {
            mimeType = 'text/plain';
            fileName += '.csv';
        } else if (type === 'Ppt') {
            mimeType = 'application/vnd.ms-powerpoint';
            fileName += '.ppt';
        } else if (type === 'Text') {
            mimeType = 'text/plain';
            fileName += '.txt';
        } else {
            mimeType = 'application/octet-stream';
            fileName += '';
        }
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        if (fileName) { a.download = fileName; }
        a.click();
        window.URL.revokeObjectURL(url);
    }

    public static dateFormatForApi(dateInput) {
        if (!dateInput) { return ''; }
        const date = new Date(dateInput);
        // date.setTime(date.getTime() + (3 * 60 * 60 * 1000));
        return date.toISOString();
    }

    public static isSet(value) {
        return value !== undefined && value !== null && value !== '' && value !== {};
    }

    public static makeFilter(filters) {
        const filterList = [];
        for (const filter of Array.from(filters)) {
            filterList.push({
                filterItem: {
                    fieldName: filter['name'],
                    operator: filter['operator'],
                    value: filter['value']
                },
                operator: 'FILTER_ITEM'
            });
        }
        return {
            filterList,
            operator: 'AND_GROUP'
        };
    }

    public static getMonths() {
        const months = [{
            month: 0,
            name: 'm1',
            title: 'Ocak'
        }, {
            month: 1,
            name: 'm2',
            title: 'Şubat'
        }, {
            month: 2,
            name: 'm3',
            title: 'Mart'
        }, {
            month: 3,
            name: 'm4',
            title: 'Nisan'
        }, {
            month: 4,
            name: 'm5',
            title: 'Mayıs'
        }, {
            month: 5,
            name: 'm6',
            title: 'Haziran'
        }, {
            month: 6,
            name: 'm7',
            title: 'Temmuz'
        }, {
            month: 7,
            name: 'm8',
            title: 'Ağustos'
        }, {
            month: 8,
            name: 'm9',
            title: 'Eylül'
        }, {
            month: 9,
            name: 'm10',
            title: 'Ekim'
        }, {
            month: 10,
            name: 'm11',
            title: 'Kasım'
        }, {
            month: 11,
            name: 'm12',
            title: 'Aralık'
        }];

        return months;
    }

    public static getMonth(month) {
        return this.getMonths()[month];
    }

    public static getWeekDays(inputDate?) {
        const date = inputDate ? new Date(inputDate) : new Date();
        date.setDate(date.getDate() - date.getDay() + 1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        const weekDays = [{
            name: 'd1',
            wday: 1,
            title: 'Pazartesi',
            date
        }, {
            name: 'd2',
            wday: 2,
            title: 'Salı',
            date: new Date(date.valueOf() + 1000 * 3600 * 24)
        }, {
            name: 'd3',
            wday: 3,
            title: 'Çarşamba',
            date: new Date(date.valueOf() + 2000 * 3600 * 24)
        }, {
            name: 'd4',
            wday: 4,
            title: 'Perşembe',
            date: new Date(date.valueOf() + 3000 * 3600 * 24)
        }, {
            name: 'd5',
            wday: 5,
            title: 'Cuma',
            date: new Date(date.valueOf() + 4000 * 3600 * 24)
        }, {
            name: 'd6',
            wday: 6,
            title: 'Cumartesi',
            date: new Date(date.valueOf() + 5000 * 3600 * 24)
        }, {
            name: 'd7',
            wday: 7,
            title: 'Pazar',
            date: new Date(date.valueOf() + 6000 * 3600 * 24)
        }];
        return weekDays;
    }

    public static getOperators(fieldType) {
        const selectedList = [];
        switch (fieldType) {
            case 'time':
                selectedList.push(this.operatorList[4]);
                selectedList.push(this.operatorList[5]);
                selectedList.push(this.operatorList[6]);
                selectedList.push(this.operatorList[7]);
                break;
            case 'select':
                selectedList.push(this.operatorList[0]);
                break;
            default:
                selectedList.push(this.operatorList[0]);
                selectedList.push(this.operatorList[1]);
                selectedList.push(this.operatorList[2]);
                selectedList.push(this.operatorList[3]);
                break;
        }
        return selectedList;
    }

    public static getDefaultOperator(fieldType) {
        const selectedList = [];
        switch (fieldType) {
            case 'time':
                return 'GREATER_OR_EQUAL_THAN';
            case 'select':
                return 'EQUALS';
            default:
                return 'CONTAINS';
        }
    }

    public static hasOperation(operation) {
        const operations = JSON.parse(localStorage.getItem('operations'));
        for (const op of operations) {
            if (op.id === operation) {
                return true;
            }
        }
        return false;
    }

    public static hasPermission(entity, permission) {
        const permissions = JSON.parse(localStorage.getItem('permissions'));
        if (permissions[entity] && permissions[entity][permission] !== undefined) {
            return permissions[entity][permission];
        }
        return false;
    }

    public static getConfiguration(configuration) {
        const configurations = JSON.parse(localStorage.getItem('configurations'));
        for (const cfg of configurations) {
            if (cfg.id === configuration) {
                return cfg;
            }
        }
        return false;
    }

    public static arrayAddIfNotPresent(array, subject) {
        if (!this.arrayIsPresent(array, subject)) {
            array.push(subject);
        }
    }

    public static arrayIsPresent(array, subject) {
        for (let item of array) {
            if (JSON.stringify(item) === JSON.stringify(subject)) {
                return true;
            }
        }
        return false;
    }

    public static arrayRemoveIfPresent(array, subject) {
        const newArray = [];
        for (let item of array) {
            if (JSON.stringify(item) !== JSON.stringify(subject)) {
                newArray.push(item);
            }
        }
        return newArray;
    }

    public static makeSalesData(rawData, salesData, color1, color2, year) {
        const yearStart = new Date(year, 0, 1);
        const stats = {};
        const gasData = [];
        const dieselData = [];
        let i = 0;
        for (let row of rawData) {
            const saleEnd = new Date(row.saleEnd).toLocaleString();
            if (!stats[saleEnd]) { stats[saleEnd] = {}; }
            if (row.productName === 'Motorin' || row.productName === 'EcoForce') {
                salesData.totalDiesel += row.volume / 1000;
                stats[saleEnd].totalDiesel = (stats[saleEnd].totalDiesel ? stats[saleEnd].totalDiesel : 0) + row.volume;
            } else {
                salesData.totalGas += row.volume / 1000;
                stats[saleEnd].totalGas = (stats[saleEnd].totalGas ? stats[saleEnd].totalGas : 0) + row.volume;
            }
            salesData.total += row.volume / 1000;
        }
        for (let m of Utils.getMonths()) {
            salesData.labels.push(m.title);
            yearStart.setMonth(m.month);
            if (yearStart > new Date()) { continue; }
            if (stats[yearStart.toLocaleString()]) {
                const gasRow = Math.round((stats[yearStart.toLocaleString()].totalGas || 0) / 1000);
                gasData.push(gasRow);
                salesData.monthlyGas = gasRow;
                const dieselRow = Math.round((stats[yearStart.toLocaleString()].totalDiesel || 0) / 1000);
                dieselData.push(dieselRow);
                salesData.monthlyDiesel = dieselRow;
                salesData.monthlyTotal = dieselRow + gasRow;
                salesData.maxData = dieselRow > salesData.maxData ? this.roundUppest(dieselRow) : salesData.maxData;
                salesData.maxData = gasRow > salesData.maxData ? this.roundUppest(gasRow) : salesData.maxData;
            } else {
                gasData.push(0);
                dieselData.push(0);
            }
        }
        salesData.datasets = [
            {
                label: 'Motorin',
                fill: false,
                borderWidth: 2,
                backgroundColor: Chart.helpers.color(color2).alpha(0).rgbString(),
                borderColor: Chart.helpers.color(color2).alpha(1).rgbString(),

                pointHoverRadius: 4,
                pointHoverBorderWidth: 12,
                pointBackgroundColor: Chart.helpers.color(color2).alpha(1).rgbString(),
                pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
                pointHoverBackgroundColor: Chart.helpers.color(color2).alpha(1).rgbString(),
                pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

                data: dieselData
            },
            {
                label: 'Benzin',
                fill: false,
                borderWidth: 2,
                backgroundColor: Chart.helpers.color(color1).alpha(0).rgbString(),
                borderColor: Chart.helpers.color(color1).alpha(1).rgbString(),

                pointHoverRadius: 4,
                pointHoverBorderWidth: 12,
                pointBackgroundColor: Chart.helpers.color(color1).alpha(1).rgbString(),
                pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
                pointHoverBackgroundColor: Chart.helpers.color(color1).alpha(1).rgbString(),
                pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.1).rgbString(),

                data: gasData,
            },
        ];

        return salesData;
    }

    public static makeTargetData(rawData, color1, color2) {
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const stats = {};
        const targetData = [];
        const realizationData = [];
        let i = 0;
        const outputData = { datasets: [], labels: [], maxData: 1 };
        for (let row of rawData) {
            stats[new Date(row.termStart).toLocaleString()] = row;
        }
        for (let m of Utils.getMonths()) {
            yearStart.setMonth(m.month);
            if (yearStart > new Date()) { continue; }
            let targetAmount = 0;
            let realizedAmount = 0;
            if (stats[yearStart.toLocaleString()]) {
                targetAmount = Math.round((stats[yearStart.toLocaleString()].amount || 0) * 100) / 100;
                realizedAmount = Math.round((stats[yearStart.toLocaleString()].realizedAmount || 0) * 100) / 100;
            }
            const targetValue = Math.round(targetAmount / 1000);
            const realizedValue = Math.round(realizedAmount / 1000);
            targetData.push(targetValue);
            realizationData.push(realizedValue);
            outputData.maxData = targetValue > outputData.maxData ? this.roundUppest(targetValue) : outputData.maxData;
            outputData.maxData = realizedValue > outputData.maxData ? this.roundUppest(realizedValue) : outputData.maxData;
            outputData.labels.push([m.title, (targetAmount ? '%' + (Math.round(realizedAmount * 10000 / targetAmount) / 100).toString() : '')]);
        }
        outputData.datasets = [
            {
                label: 'Hedef',
                fill: false,
                borderWidth: 2,
                backgroundColor: Chart.helpers.color(color1).alpha(0).rgbString(),
                borderColor: Chart.helpers.color(color1).alpha(1).rgbString(),

                // pointHoverRadius: 4,
                // pointHoverBorderWidth: 12,
                pointBackgroundColor: Chart.helpers.color(color1).alpha(1).rgbString(),
                pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
                pointHoverBackgroundColor: Chart.helpers.color(color1).alpha(0).rgbString(),
                pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),

                data: targetData,
            },
            {
                label: 'Gerçekleşen',
                fill: false,
                borderWidth: 2,
                backgroundColor: Chart.helpers.color(color2).alpha(0).rgbString(),
                borderColor: Chart.helpers.color(color2).alpha(1).rgbString(),

                // pointHoverRadius: 4,
                // pointHoverBorderWidth: 12,
                pointBackgroundColor: Chart.helpers.color(color2).alpha(1).rgbString(),
                pointBorderColor: Chart.helpers.color('#000000').alpha(0).rgbString(),
                pointHoverBackgroundColor: Chart.helpers.color(color2).alpha(0).rgbString(),
                pointHoverBorderColor: Chart.helpers.color('#000000').alpha(0.0).rgbString(),

                data: realizationData
            },
        ];
        return outputData;
    }

    public static roundUppest(subject) {
        subject = Math.round(subject).toString();
        let newSubject = (parseInt(subject[0], 0) + 1).toString();
        for (let i = 1; i < subject.length; i++) {
            newSubject += '0';
        }
        return parseInt(newSubject, 0);
    }

	public static ibanClean(iban) {
		if (!iban || iban === null) { return iban; }
		if (iban.length < 7) { iban = ''; }
		if (iban.length > 34) { iban = iban.split('-')[0]; }
		iban = iban.replace(/\D+/g, '');
		if (iban.length > 34) { iban = iban.substr(0, 34); } else { iban = iban.substr(0, 32); }
		return iban;
	}

    public static phoneClean(phone) {
        if (!phone || phone === null) { return phone; }
        if (phone.length < 7) { phone = ''; }
        if (phone.length > 20) { phone = phone.split('-')[0]; }
        phone = phone.replace(/\D+/g, '');
        if (phone.startsWith('0090')) { phone = phone.substr(4, phone.length); }
        if (phone.startsWith('+90')) { phone = phone.substr(3, phone.length); }
        if (phone.startsWith('90')) { phone = phone.substr(2, phone.length); }
        if (phone.startsWith('0')) { phone = phone.substr(1, phone.length); }
        if (phone.length > 9) { phone = phone.substr(0, 10); } else { phone = phone.substr(0, 7); }
        return phone;
    }

    public static phoneZeroPad(phone) {
        if (!phone) { return phone; }
        phone = this.phoneClean(phone);
        if (phone.length > 7) { phone = '0' + phone; }
        return phone;
    }

    public static phoneFormat(phone) {
        if (!phone) { return phone; }
        phone = this.phoneClean(phone);
        if (phone.length === 10) {
            phone = '(' + phone.substr(0, 3) + ') ' + phone.substr(3, 3) + ' ' + phone.substr(6, 4);
        } else if (phone.length === 7) {
            phone = phone.substr(0, 3) + ' ' + phone.substr(3, 4);
        }
        return phone;
    }

	public static ibanZeroPad(iban) {
		if (!iban) {
			return iban;
		}
		iban = this.ibanClean(iban);
		if (iban.length > 7) {
			iban = '0' + iban;
		}
		return iban;
	}

	public static ibanFormat(iban) {
		if (!iban) {
			return iban;
		}
		iban = this.ibanClean(iban);
		if (iban.length === 34) {
			iban = 'TR' + iban.substring(2, 4) + ' ' + iban.substring(4, 8) + ' ' + iban.substring(8, 12) + ' ' + iban.substring(12, 16) + ' ' + iban.substring(16, 20) + ' ' + iban.substring(20, 24) + ' ' + iban.substring(24, 28) + ' ' + iban.substring(28, 30);
		} else {
			iban = 'TR' + iban.substring(2, 4) + ' ' + iban.substring(4, 8) + ' ' + iban.substring(8, 12) + ' ' + iban.substring(12, 16) + ' ' + iban.substring(16, 20) + ' ' + ' ' + iban.substring(20, 24) + ' ' + iban.substring(24, 28);
		}
		return iban;
	}

	public static compareObjects(o1: any, o2: any) {
        if (o1.id === o2.id) {
            return true;
        } else {
            return false;
        }
    }

    public static cleanLocalStorage() {
        localStorage.removeItem(environment.authTokenKey);
        localStorage.removeItem('quickActivity');
        localStorage.removeItem('layoutConfig');
        localStorage.removeItem('language');
        localStorage.removeItem('user');
        localStorage.removeItem('metadata');
        localStorage.removeItem('attributeValues');
        localStorage.removeItem('operations');
        localStorage.removeItem('permissions');
        localStorage.removeItem('configurations');
        localStorage.removeItem('backendVersion');
    }
}

@Pipe({ name: 'objectPipe' })
export class ObjectPipe implements PipeTransform {
    transform(value: any, exponent: string): any {
        return value ? value.name ? value.name : value.firstName ? value.firstName : value : '';
    }
}

const trRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) { return `${length} kayıttan hiçbiri`; }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;

    return `${length} kayıttan ${startIndex + 1} - ${endIndex} arası gösteriliyor`;
};

export function getTrPaginatorIntl() {
    const paginatorIntl = new MatPaginatorIntl();

    paginatorIntl.itemsPerPageLabel = 'Sayfa başı adet:';
    paginatorIntl.nextPageLabel = 'Sonraki sayfa';
    paginatorIntl.previousPageLabel = 'Önceki sayfa';
    paginatorIntl.getRangeLabel = trRangeLabel;

    return paginatorIntl;
}
