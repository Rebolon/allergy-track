import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PocketbaseAdapterService } from './persistence/pocketbase-adapter.service';
import { HealthStatus, DailyLog } from '../models/allergi-track.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private persistence = inject(PocketbaseAdapterService);

  getHealthStatus(startDate: string, endDate: string): Observable<HealthStatus> {
    return this.persistence.getDailyLogs(startDate, endDate).pipe(
      map(allLogs => {
        // Keep only the latest log for each date
        const latestLogsMap = new Map<string, DailyLog>();
        allLogs.forEach(log => latestLogsMap.set(log.date, log));

        let totalMisses = 0;
        let totalSevereSymptoms = 0;
        let totalMildSymptoms = 0;
        let totalTreatments = 0;

        const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
        const [eYear, eMonth, eDay] = endDate.split('-').map(Number);
        const start = new Date(sYear, sMonth - 1, sDay);
        const end = new Date(eYear, eMonth - 1, eDay);
        let current = new Date(start);

        while (current <= end) {
          const y = current.getFullYear();
          const m = String(current.getMonth() + 1).padStart(2, '0');
          const d = String(current.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;
          const log = latestLogsMap.get(dateStr);

          if (log) {
            const hasMissedIntake = log.intakes.some(i => !i.taken);
            if (hasMissedIntake) {
              totalMisses += 1;
            }
            
            const severeSymptoms = log.symptoms.filter(s => ['Respiratoire', 'Abdominal', 'Autres'].includes(s)).length;
            const mildSymptoms = log.symptoms.filter(s => s === 'Démangeaisons bouche').length;
            
            totalSevereSymptoms += severeSymptoms;
            totalMildSymptoms += mildSymptoms;

            const treatmentsTaken = log.treatments.filter(t => t.before || t.after).length;
            totalTreatments += treatmentsTaken;
          } else {
            // Un jour sans saisie est considéré comme un oubli (1 oubli pour la journée)
            totalMisses += 1;
          }
          current.setDate(current.getDate() + 1);
        }

        const hasSevereSymptomsOrMeds = totalSevereSymptoms > 0 || totalTreatments > 0;

        let status: 'VERT' | 'ORANGE' | 'ROUGE' = 'VERT';

        if (totalMisses > 2 || hasSevereSymptomsOrMeds) {
          status = 'ROUGE';
        } else if ((totalMisses > 0 && totalMisses <= 2) || totalMildSymptoms > 0) {
          status = 'ORANGE';
        } else {
          status = 'VERT';
        }

        return {
          status,
          misses: totalMisses,
          symptomsCount: totalSevereSymptoms + totalMildSymptoms
        };
      })
    );
  }

  generateCsvReport(startDate: string, endDate: string): Observable<string> {
    return this.persistence.getDailyLogs(startDate, endDate).pipe(
      map(allLogs => {
        const latestLogsMap = new Map<string, DailyLog>();
        allLogs.forEach(log => latestLogsMap.set(log.date, log));

        let csv = 'Date,Allergenes (Doses),Tout Pris,Symptomes,Traitements,Note,Auteur\n';
        
        const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
        const [eYear, eMonth, eDay] = endDate.split('-').map(Number);
        const start = new Date(sYear, sMonth - 1, sDay);
        const end = new Date(eYear, eMonth - 1, eDay);
        let current = new Date(start);

        while (current <= end) {
          const y = current.getFullYear();
          const m = String(current.getMonth() + 1).padStart(2, '0');
          const d = String(current.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;
          const log = latestLogsMap.get(dateStr);

          if (log) {
            const allergensStr = log.intakes.map(i => `${i.allergen} (${i.dose})`).join('; ');
            const allTaken = log.intakes.every(i => i.taken) ? 'Oui' : (log.intakes.some(i => i.taken) ? 'Partiel' : 'Non');
            
            const symptomsStr = log.symptoms.join('; ');
            const treatmentsStr = log.treatments
              .filter(t => t.before || t.after)
              .map(t => `${t.name} (${t.before ? 'Avant' : ''}${t.before && t.after ? '+' : ''}${t.after ? 'Après' : ''})`)
              .join('; ');
            
            const note = log.note ? log.note.replace(/"/g, '""') : '';
            
            csv += `${log.date},"${allergensStr}",${allTaken},"${symptomsStr}","${treatmentsStr}","${note}",${log.updatedBy}\n`;
          } else {
            // Journée manquante
            csv += `${dateStr},"(Non saisi)",Non,"","","",-\n`;
          }
          current.setDate(current.getDate() + 1);
        }
        return csv;
      })
    );
  }
}
