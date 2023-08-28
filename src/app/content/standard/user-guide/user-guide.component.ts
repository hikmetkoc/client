import { tap, catchError } from 'rxjs/operators';
import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar, MatDialog, DateAdapter } from '@angular/material';
import { BaseService } from '../../_base/base.service';
import { Utils } from '../../_base/utils';
import { HttpClient } from '@angular/common/http';
import { HttpUtilsService } from '../../_base/http-utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';

@Component({
  selector: 'kt-user-guide',
  templateUrl: './user-guide.component.html',
  styleUrls: ['./user-guide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGuideComponent implements OnInit {

  @Input() current: any;
  @Input() model: any;
  description: string;
  files: any;
  loading$: Observable<boolean>;
  inputFiles = [];
  utils = Utils;
  checkDownload = false;

  constructor(
    private modalService: NgbModal,
    public baseService: BaseService,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private httpUtils: HttpUtilsService,
    private cdr: ChangeDetectorRef
  ) {
    this.loading$ = this.baseService.loadingSubject.asObservable();
  }

  ngOnInit() {
    this.loadList();
  }

  loadList() {
    this.baseService.find({}, 'user-guides/file-list').subscribe(res2 => {
      console.log(res2);
      this.files = res2.body;
      this.cdr.markForCheck();
    });
  }

  download(row, e) {
    this.checkDownload = true;
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    this.http.post('api/user-guides' + '/file-download?fileName=' + row, {}, { headers: httpHeaders, responseType: 'blob', observe: 'response' })
      .pipe(
        tap(res => {
          let filename = '';
          const disposition = res.headers.get('Content-Disposition');
          if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }
          Utils.downloadFile(res.body, undefined, filename);
          this.checkDownload = false;
          this.cdr.markForCheck();
        }),
        catchError(err => {
          this.checkDownload = false;
          this.cdr.markForCheck();
          return err;
        })
      ).subscribe();
  }

}
