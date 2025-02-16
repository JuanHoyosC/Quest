import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { HERO_ICONS } from '@app/shared/icons';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { RippleModule } from 'primeng/ripple';
import { SpinComponent } from '@shared/components/spin/spin.component';

@Component({
  selector: 'd-button',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RippleModule, SpinComponent],
  providers: [provideIcons(HERO_ICONS)],
  templateUrl: './d-button.component.html',
  styleUrl: './d-button.component.scss',
})
export class DButtonComponent {
  type = input<'button' | 'submit'>('button');
  severity = input<ButtonSeverity>('primary');
  icon = input<keyof typeof HERO_ICONS>();
  label = input<string>();
  styleClass = input<string>();
  appId = input.required<string>();
  disabled = input<boolean>();
  loading = input<boolean>();
  rounded = input<boolean>();
  outline = input<boolean>();
  onClick = output<Event>();
}

type ButtonSeverity = 'primary' | 'danger';
