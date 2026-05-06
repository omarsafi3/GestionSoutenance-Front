import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../auth/auth.models';
import { ChatbotApiService } from './chatbot-api.service';

type Sender = 'assistant' | 'user';

interface ChatMessage {
  sender: Sender;
  text: string;
  createdAt: Date;
}

interface QuickAction {
  label: string;
  prompt: string;
}

@Component({
  selector: 'app-chatbot-assistant',
  templateUrl: './chatbot-assistant.component.html',
  styleUrl: './chatbot-assistant.component.css'
})
export class ChatbotAssistantComponent implements OnInit {
  @ViewChild('messagesBox') private messagesBox?: ElementRef<HTMLDivElement>;

  open = false;
  loading = false;
  draft = '';
  activeModel = 'local';

  readonly quickActions: QuickAction[] = [
    { label: 'Planifier une soutenance', prompt: 'comment planifier une soutenance' },
    { label: 'Regles de notes', prompt: 'quand un enseignant peut ajouter une note' },
    { label: 'Regles du jury', prompt: 'regles jury et encadrant' },
    { label: 'Comprendre les statuts', prompt: 'statuts planifiee en cours terminee' }
  ];

  messages: ChatMessage[] = [];
  private readonly markdownCache = new Map<string, SafeHtml>();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly chatbotApiService: ChatbotApiService,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const role = this.authService.getCurrentRole();
    this.messages = [
      {
        sender: 'assistant',
        text: this.buildWelcome(role),
        createdAt: new Date()
      }
    ];
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) {
      window.setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  askQuick(prompt: string): void {
    this.draft = prompt;
    this.send();
  }

  send(): void {
    const question = this.draft.trim();
    if (!question || this.loading) {
      return;
    }

    this.messages.push({
      sender: 'user',
      text: question,
      createdAt: new Date()
    });

    this.draft = '';

    if (this.tryNavigate(question)) {
      this.messages.push({
        sender: 'assistant',
        text: 'J ouvre la page demandee.',
        createdAt: new Date()
      });
      this.scrollToBottom();
      return;
    }

    this.loading = true;
    this.scrollToBottom();

    this.chatbotApiService.ask(question)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (result) => {
          this.activeModel = result.model;
          this.messages.push({
            sender: 'assistant',
            text: result.answer,
            createdAt: new Date()
          });
          this.scrollToBottom();
        },
        error: (error) => {
          const apiMessage = error?.error?.message as string | undefined;
          this.messages.push({
            sender: 'assistant',
            text: apiMessage || 'Le modele local est indisponible. Lance Ollama puis reessaie.',
            createdAt: new Date()
          });
          this.scrollToBottom();
        }
      });
  }

  private buildWelcome(role: UserRole | null): string {
    const roleHint = role ? `Je te reponds selon ton role ${role}.` : 'Je peux te guider dans l application.';
    return `Salut, je suis l assistant IA local de **Gestion Soutenance**. ${roleHint} Modele actuel: \`${this.activeModel}\`.`;
  }

  formatMessage(text: string): SafeHtml {
    const cached = this.markdownCache.get(text);
    if (cached) {
      return cached;
    }

    const rendered = this.renderMarkdown(text);
    const safe = this.sanitizer.bypassSecurityTrustHtml(rendered);
    this.markdownCache.set(text, safe);
    return safe;
  }

  private tryNavigate(q: string): boolean {
    if (this.has(q, ['ouvre soutenances', 'aller soutenances', 'go soutenances'])) {
      this.router.navigate(['/soutenances']);
      return true;
    }
    if (this.has(q, ['ouvre notes', 'aller notes', 'go notes'])) {
      this.router.navigate(['/notes']);
      return true;
    }
    if (this.has(q, ['ouvre resultats', 'aller resultats', 'go resultats'])) {
      this.router.navigate(['/resultats']);
      return true;
    }
    if (this.has(q, ['ouvre dashboard', 'aller accueil', 'go accueil'])) {
      this.router.navigate(['/']);
      return true;
    }
    return false;
  }

  private has(question: string, terms: string[]): boolean {
    const normalizedQuestion = this.normalize(question);
    return terms.some(term => normalizedQuestion.includes(this.normalize(term)));
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private renderMarkdown(source: string): string {
    const lines = this.escapeHtml(source).split(/\r?\n/);
    const html: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let codeBlock: string[] | null = null;

    const closeList = () => {
      if (listType) {
        html.push(`</${listType}>`);
        listType = null;
      }
    };

    const openList = (type: 'ul' | 'ol') => {
      if (listType === type) {
        return;
      }
      closeList();
      listType = type;
      html.push(`<${type}>`);
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        closeList();
        if (codeBlock) {
          html.push(`<pre><code>${codeBlock.join('\n')}</code></pre>`);
          codeBlock = null;
        } else {
          codeBlock = [];
        }
        continue;
      }

      if (codeBlock) {
        codeBlock.push(line);
        continue;
      }

      if (!trimmed) {
        closeList();
        continue;
      }

      const bullet = trimmed.match(/^[-*]\s+(.+)$/);
      if (bullet) {
        openList('ul');
        html.push(`<li>${this.renderInlineMarkdown(bullet[1])}</li>`);
        continue;
      }

      const numbered = trimmed.match(/^\d+\.\s+(.+)$/);
      if (numbered) {
        openList('ol');
        html.push(`<li>${this.renderInlineMarkdown(numbered[1])}</li>`);
        continue;
      }

      closeList();
      html.push(`<p>${this.renderInlineMarkdown(trimmed)}</p>`);
    }

    closeList();
    if (codeBlock) {
      html.push(`<pre><code>${codeBlock.join('\n')}</code></pre>`);
    }
    return html.join('');
  }

  private renderInlineMarkdown(escapedText: string): string {
    const codeSnippets: string[] = [];
    let value = escapedText.replace(/`([^`]+)`/g, (_match, code) => {
      const key = `%%CODE${codeSnippets.length}%%`;
      codeSnippets.push(`<code>${code}</code>`);
      return key;
    });

    value = value
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');

    codeSnippets.forEach((snippet, index) => {
      value = value.replace(`%%CODE${index}%%`, snippet);
    });

    return value;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private scrollToBottom(): void {
    const container = this.messagesBox?.nativeElement;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }
}
