export const exportToCSV = (data: any[], filename: string) => {
  if (!data.length) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header];
        // Handle numbers, strings, and format timestamps
        if (header === 'timestamp') {
          return new Date(cell).toISOString();
        }
        if (typeof cell === 'number') {
          return cell.toString();
        }
        // Escape strings that contain commas
        return `"${cell}"`;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};