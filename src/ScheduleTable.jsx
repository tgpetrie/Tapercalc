import React from 'react';
import { formatNumber, downloadAsCSV } from './utils/taperMath';

export default function ScheduleTable({ schedule, doseLabels }) {
  if (!schedule || schedule.length === 0) {
    return null;
  }

  const handleExport = () => {
    downloadAsCSV(schedule, doseLabels, 'taper-schedule.csv');
  };

  const handlePrint = () => {
    window.print();
  };

  const hasDate = schedule.some(item => item.date);

  return (
    <div className="panel table-panel">
      <div className="panel-header">
        <h2 className="panel-title">Generated Schedule</h2>
        <div className="action-buttons">
          <button onClick={handleExport} className="btn-secondary">
            Export CSV
          </button>
          <button onClick={handlePrint} className="btn-secondary">
            Print
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Day</th>
              {hasDate && <th>Date</th>}
              {hasDate && <th>Day</th>}
              <th>Step</th>
              {doseLabels.map((label, i) => (
                <th key={`tablet-${i}`} className="dose-header">{label} Tablet (mg)</th>
              ))}
              {doseLabels.map((label, i) => (
                <th key={`liquid-${i}`} className="dose-header">{label} Liquid (mL)</th>
              ))}
              {doseLabels.map((label, i) => (
                <th key={`liquidmg-${i}`} className="dose-header">{label} Liquid (mg)</th>
              ))}
              <th className="total-cell">Total Daily (mg)</th>
              <th>Daily Reduction (mg)</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item, index) => (
              <tr key={index} className={`status-row status-${item.status}`}>
                <td>{item.day}</td>
                {hasDate && <td>{item.date || '—'}</td>}
                {hasDate && <td>{item.weekday || '—'}</td>}
                <td>{item.step}</td>
                {item.doses.map((d, i) => (
                  <td key={`tablet-${i}`}>{formatNumber(d.tabletMg)}</td>
                ))}
                {item.doses.map((d, i) => (
                  <td key={`liquid-${i}`}>{formatNumber(d.liquidMl)}</td>
                ))}
                {item.doses.map((d, i) => (
                  <td key={`liquidmg-${i}`}>
                    {formatNumber((d.liquidMl || 0) * (d.mgPerMl || 0))}
                  </td>
                ))}
                <td className="total-cell">{formatNumber(item.totalDailyDose)}</td>
                <td>{item.dailyReduction > 0 ? formatNumber(item.dailyReduction, 4) : '—'}</td>
                <td>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status === 'tapering' ? 'Tapering' :
                     item.status === 'hold' ? 'Hold' :
                     'Target'}
                  </span>
                </td>
                <td className="notes-cell">{item.note || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
