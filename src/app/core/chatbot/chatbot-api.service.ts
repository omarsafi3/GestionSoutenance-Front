import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ChatbotAskRequest {
  message: string;
}

interface ChatbotAskResponse {
  answer: string;
  model: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotApiService {
  private readonly endpoint = `${environment.apiUrl}/chatbot/ask`;

  constructor(private readonly http: HttpClient) {}

  ask(message: string): Observable<{ answer: string; model: string }> {
    const payload: ChatbotAskRequest = { message };
    return this.http.post<ChatbotAskResponse>(this.endpoint, payload).pipe(
      map((response) => ({
        answer: response.answer,
        model: response.model
      }))
    );
  }
}
