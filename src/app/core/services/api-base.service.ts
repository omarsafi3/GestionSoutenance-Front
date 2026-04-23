import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export abstract class ApiBaseService {
  protected readonly apiUrl = environment.apiUrl;

  constructor(protected readonly http: HttpClient) {}
}