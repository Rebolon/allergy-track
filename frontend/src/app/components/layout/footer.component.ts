import { Component } from '@angular/core';
import { VERSION } from '../../../environments/version';

@Component({
  selector: 'app-layout-footer',
  standalone: true,
  template: `
    <footer class="mt-12 pt-8 border-t border-slate-200/50 text-center pb-8 opacity-50 hover:opacity-100 transition-opacity">
      <p class="text-xs font-medium tracking-wide flex flex-col gap-1">
        <span>© 2024-{{currentYear}} AllergyTrack • Tous droits réservés</span>
        <span class="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-full inline-block mx-auto">
          v.{{version.buildDate}} ({{version.hash}})
        </span>
      </p>
    </footer>
  `
})
export class LayoutFooterComponent {
  version = VERSION;
  currentYear = new Date().getFullYear();
}
