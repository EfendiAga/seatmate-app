const fs = require('fs');
const path = 'W:/Wedding Planner/seatmate/src/components/Header.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('GuestListSheet')) {
  code = code.replace(/import \{ Button \} from ".*?";/, 'import { Button } from "@/components/ui/button";\nimport { GuestListSheet } from "./GuestListSheet";');
  code = code.replace(/<\/TooltipProvider>\s*<\/div>\s*<\/div>/, '</TooltipProvider>\n            <GuestListSheet />\n          </div>\n        </div>');
  fs.writeFileSync(path, code, 'utf8');
}
