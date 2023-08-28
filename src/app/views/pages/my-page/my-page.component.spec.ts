import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPageComponent } from './my-page.component';
import {ChangeDetectorRef} from "@angular/core";

describe('MyPageComponent', () => {
  let component: MyPageComponent;
  let fixture: ComponentFixture<MyPageComponent>;
  let changeDetectorRef: ChangeDetectorRef;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPageComponent);
    component = fixture.componentInstance;
    // @ts-ignore
	  fixture.markForCheck();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
