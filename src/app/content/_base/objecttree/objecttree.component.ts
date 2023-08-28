import { Component, ChangeDetectionStrategy, AfterViewInit, OnInit, ViewEncapsulation, EventEmitter, Output, Input } from '@angular/core';
import { MatSnackBar, MatDialog, MatTreeNestedDataSource } from '@angular/material';
import { BaseService } from '../base.service';
import { Utils } from '../utils';
import { NestedTreeControl } from '@angular/cdk/tree';

@Component({
	selector: 'kt-objecttree',
	templateUrl: './objecttree.component.html',
	styleUrls: ['./objecttree.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectTreeComponent implements AfterViewInit, OnInit {

	@Input() subject;
	@Output() subjectChange = new EventEmitter<any>();
	@Output() nodeClick = new EventEmitter<any>();

	treeControl = new NestedTreeControl<any>(node => node.children);
	dataSource = new MatTreeNestedDataSource<any>();
	utils;

	constructor(
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public baseService: BaseService
	) {
		this.utils = Utils;
	}

	hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

	ngOnInit() {
		Utils.getModels();
	}

	ngAfterViewInit() {
		if (this.subject) {
			this.dataSource.data = this.makeTreeData();
		}
	}

	subjectChanged() {
		this.subjectChange.emit(this.subject);
		this.dataSource.data = this.makeTreeData();
	}

	makeTreeData() {
		let treeData = [];
		for (const field of this.subject.fields) {
			let child: any = {};
			child = JSON.parse(JSON.stringify(field));
			child.shortTitle = child.title;
			child.originalTitle = child.title;
			if (field.type === 'Object' && field.objectApiName !== 'attribute-values') {
				child.children = [];
				const name = field.javaType.substr(field.javaType.lastIndexOf('.') + 1);
				for (const subField of Utils.getModel(name).fields) {
					if (subField.type === 'Object') {

					} else {
						let subChild: any = {};
						subChild = JSON.parse(JSON.stringify(subField));
						subChild.shortTitle = subChild.title;
						subChild.title = child.title + ' ' + subField.title;
						subChild.originalTitle = subChild.title;
						subChild.name = child.name + '.' + subChild.name;
						child.children.push(subChild);
					}
				}
			}
			treeData.push(child);
		}

		return treeData;
	}
}
