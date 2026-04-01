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
        const logs = Array.from(latestLogsMap.values());

        let totalMisses = 0;
        let totalSevereSymptoms = 0;
        let totalMildSymptoms = 0;
        let totalTreatments = 0;

        logs.forEach(log => {
          const missedIntakes = log.intakes.filter(i => !i.taken).length;
          totalMisses += missedIntakes;
          
          const severeSymptoms = log.symptoms.filter(s => ['Respiratoire', 'Abdominal', 'Autres'].includes(s)).length;
          const mildSymptoms = log.symptoms.filter(s => s === 'Démangeaisons bouche').length;
          
          totalSevereSymptoms += severeSymptoms;
          totalMildSymptoms += mildSymptoms;

          const treatmentsTaken = log.treatments.filter(t => t.before || t.after).length;
          totalTreatments += treatmentsTaken;
        });

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
      map(logs => {
        let csv = 'Date,Allergenes (Doses),Tout Pris,Symptomes,Traitements,Note,Auteur\n';
        logs.forEach(log => {
          const allergensStr = log.intakes.map(i => `${i.allergen} (${i.dose})`).join('; ');
          const allTaken = log.intakes.every(i => i.taken) ? 'Oui' : (log.intakes.some(i => i.taken) ? 'Partiel' : 'Non');
          
          const symptomsStr = log.symptoms.join('; ');
          const treatmentsStr = log.treatments
            .filter(t => t.before || t.after)
            .map(t => `${t.name} (${t.before ? 'Avant' : ''}${t.before && t.after ? '+' : ''}${t.after ? 'Après' : ''})`)
            .join('; ');
          
          const note = log.note ? log.note.replace(/"/g, '""') : '';
          
          csv += `${log.date},"${allergensStr}",${allTaken},"${symptomsStr}","${treatmentsStr}","${note}",${log.updatedBy}\n`;
        });
        return csv;
      })
    );
  }
}
