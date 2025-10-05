// Generate JusGor Logo PNG
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 200;
canvas.height = 80;

// Fill background
ctx.fillStyle = '#1e293b';
ctx.fillRect(0, 0, 200, 80);

// Draw leaves (green)
ctx.fillStyle = '#22c55e';
ctx.font = '16px Arial';
ctx.fillText('🍃', 20, 20);

// Draw "Jus" text (orange)
ctx.fillStyle = '#f97316';
ctx.font = 'bold 32px Arial';
ctx.fillText('Jus', 20, 50);

// Draw "Gor" text (white)
ctx.fillStyle = 'white';
ctx.font = 'bold 32px Arial';
ctx.fillText('Gor', 80, 50);

// Draw exclamation (white)
ctx.fillStyle = 'white';
ctx.font = 'bold 32px Arial';
ctx.fillText('!', 120, 50);

// Draw circle (red)
ctx.fillStyle = '#dc2626';
ctx.beginPath();
ctx.arc(160, 40, 20, 0, 2 * Math.PI);
ctx.fill();

// Draw arrow (white)
ctx.fillStyle = 'white';
ctx.font = 'bold 20px Arial';
ctx.fillText('→', 150, 45);

// Convert to PNG and download
const link = document.createElement('a');
link.download = 'logo-jusgor.png';
link.href = canvas.toDataURL();
link.click();
