const fs = require('fs');
const path = 'W:/Wedding Planner/seatmate/src/components/TableCircle.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace table colors with more premium variants
code = code.replace(/tableFill: ".*?ov"/, 'tableFill: isDark ? "#1E293B" : "#FFFFFF"');
code = code.replace(/tableStroke: ".*?ov"/, 'tableStroke: isDark ? "#334155" : "#E2E8F0"');
code = code.replace(/tableSelectedStroke: ".*?ov"/, 'tableSelectedStroke: isDark ? "#3B82F6" : "#2563EB"');
code = code.replace(/tableHoverStroke: ".*?ov"/, 'tableHoverStroke: isDark ? "#475569" : "#CBD5E1"');
code = code.replace(/tableTextPrimary: ".*?ov"/, 'tableTextPrimary: isDark ? "#F8FAFC" : "#0F172A"');
code = code.replace(/tableTextSecondary: ".*?ov"/, 'tableTextSecondary: isDark ? "#94A3B8" : "#64748B"');

// Reduce shadow opacity for a softer, more elegant float
code = code.replace(/shadowOpacity: isSelected \? 0.4 : 0.2/g, 'shadowOpacity: isSelected ? 0.3 : 0.08');
code = code.replace(/shadowBlur: isSelected \? 15 : 10/g, 'shadowBlur: isSelected ? 24 : 12');

// Update chair shadows
code = code.replace(/shadowOpacity: 0.15/g, 'shadowOpacity: 0.05');
code = code.replace(/shadowBlur: 3/g, 'shadowBlur: 6');

fs.writeFileSync(path, code, 'utf8');
