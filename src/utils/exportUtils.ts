// Utility functions for exporting data reports

export interface ExportData {
  students?: any[];
  departments?: any[];
  supervisors?: any[];
  summary?: any;
  metadata?: {
    generatedAt: string;
    generatedBy: string;
    reportType: string;
    timeRange?: string;
    department?: string;
  };
}

// Convert data to CSV format
export const convertToCSV = (data: any[], headers: string[]): string => {
  if (!data || data.length === 0) return '';
  
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle special cases
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
};

// Generate comprehensive analytics report
export const generateAnalyticsReport = (data: ExportData): string => {
  let report = '';
  
  // Add metadata
  if (data.metadata) {
    report += `Analytics Report\n`;
    report += `Generated: ${data.metadata.generatedAt}\n`;
    report += `Report Type: ${data.metadata.reportType}\n`;
    if (data.metadata.timeRange) report += `Time Range: ${data.metadata.timeRange}\n`;
    if (data.metadata.department) report += `Department: ${data.metadata.department}\n`;
    report += `\n`;
  }
  
  // Add summary section
  if (data.summary) {
    report += `EXECUTIVE SUMMARY\n`;
    report += `================\n`;
    Object.entries(data.summary).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      report += `${formattedKey}: ${value}\n`;
    });
    report += `\n`;
  }
  
  // Add student analytics
  if (data.students && data.students.length > 0) {
    report += `STUDENT ANALYTICS\n`;
    report += `================\n`;
    const studentHeaders = ['name', 'matricNumber', 'supervisor', 'progress', 'riskLevel', 'engagementScore', 'chaptersSubmitted', 'chaptersApproved'];
    report += convertToCSV(data.students, studentHeaders);
    report += `\n\n`;
  }
  
  // Add department statistics
  if (data.departments && data.departments.length > 0) {
    report += `DEPARTMENT STATISTICS\n`;
    report += `====================\n`;
    const deptHeaders = ['department', 'totalStudents', 'completionRate', 'averageProgress', 'riskStudents'];
    report += convertToCSV(data.departments, deptHeaders);
    report += `\n\n`;
  }
  
  // Add supervisor performance
  if (data.supervisors && data.supervisors.length > 0) {
    report += `SUPERVISOR PERFORMANCE\n`;
    report += `=====================\n`;
    const supervisorHeaders = ['name', 'studentsCount', 'averageProgress', 'responseTime', 'satisfactionScore', 'completionRate'];
    report += convertToCSV(data.supervisors, supervisorHeaders);
    report += `\n\n`;
  }
  
  return report;
};

// Generate Excel-compatible CSV
export const generateExcelCSV = (data: ExportData): string => {
  let csv = '';
  
  // Add BOM for proper Excel UTF-8 handling
  csv = '\uFEFF';
  
  // Create multiple sheets in one CSV (separated by blank lines)
  if (data.students && data.students.length > 0) {
    csv += 'STUDENT ANALYTICS\n';
    const studentHeaders = ['Name', 'Matric Number', 'Supervisor', 'Progress (%)', 'Risk Level', 'Engagement Score (%)', 'Chapters Submitted', 'Chapters Approved', 'Last Activity'];
    csv += studentHeaders.join(',') + '\n';
    
    data.students.forEach(student => {
      const row = [
        student.name || '',
        student.matricNumber || '',
        student.supervisor || '',
        student.progress || 0,
        student.riskLevel || '',
        student.engagementScore || 0,
        student.chaptersSubmitted || 0,
        student.chaptersApproved || 0,
        student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : ''
      ];
      csv += row.map(cell => {
        if (typeof cell === 'string' && cell.includes(',')) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',') + '\n';
    });
    csv += '\n\n';
  }
  
  if (data.departments && data.departments.length > 0) {
    csv += 'DEPARTMENT STATISTICS\n';
    csv += 'Department,Total Students,Completion Rate (%),Average Progress (%),At Risk Students\n';
    
    data.departments.forEach(dept => {
      csv += `${dept.department || ''},${dept.totalStudents || 0},${dept.completionRate || 0},${dept.averageProgress || 0},${dept.riskStudents || 0}\n`;
    });
    csv += '\n\n';
  }
  
  if (data.supervisors && data.supervisors.length > 0) {
    csv += 'SUPERVISOR PERFORMANCE\n';
    csv += 'Name,Students Count,Average Progress (%),Response Time (hours),Satisfaction Score,Completion Rate (%)\n';
    
    data.supervisors.forEach(supervisor => {
      csv += `${supervisor.name || ''},${supervisor.studentsCount || 0},${supervisor.averageProgress || 0},${supervisor.responseTime || 0},${supervisor.satisfactionScore || 0},${supervisor.completionRate || 0}\n`;
    });
  }
  
  return csv;
};

// Download file function
export const downloadFile = (content: string, filename: string, contentType: string = 'text/plain') => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Generate filename with timestamp
export const generateFilename = (prefix: string, extension: string): string => {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  return `${prefix}_${timestamp}.${extension}`;
};

// Export functions for different formats
export const exportToCSV = (data: ExportData, filename?: string) => {
  const csv = generateExcelCSV(data);
  const file = filename || generateFilename('analytics_report', 'csv');
  downloadFile(csv, file, 'text/csv;charset=utf-8;');
};

export const exportToTXT = (data: ExportData, filename?: string) => {
  const txt = generateAnalyticsReport(data);
  const file = filename || generateFilename('analytics_report', 'txt');
  downloadFile(txt, file, 'text/plain;charset=utf-8;');
};

export const exportToJSON = (data: ExportData, filename?: string) => {
  const json = JSON.stringify(data, null, 2);
  const file = filename || generateFilename('analytics_data', 'json');
  downloadFile(json, file, 'application/json;charset=utf-8;');
};