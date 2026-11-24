// Runs every suite and reports a combined summary. Exit code 1 if anything fails.
import { spawnSync } from "child_process";

const suites = ["tests/math.mjs", "tests/smoke.mjs", "tests/pwa.mjs"];
let totalPass = 0, totalFail = 0, failedSuites = [];

for (const s of suites) {
  const r = spawnSync(process.execPath, [s], { encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/=====\s*[A-Z ]*?:\s*(\d+) passed,\s*(\d+) failed/);
  const p = m ? +m[1] : 0, f = m ? +m[2] : 1;
  totalPass += p; totalFail += f;
  const status = r.status === 0 ? "PASS" : "FAIL";
  if (r.status !== 0) failedSuites.push(s);
  console.log(`${status}  ${s.padEnd(20)} ${p} passed, ${f} failed`);
  if (r.status !== 0) {
    out.split("\n").filter((l) => /FAIL:|ERROR:|Error:/.test(l)).slice(0, 8).forEach((l) => console.log("      " + l.trim()));
  }
}
console.log(`\nTOTAL: ${totalPass} passed, ${totalFail} failed across ${suites.length} suites`);
if (failedSuites.length) console.log("Failing suites: " + failedSuites.join(", "));
process.exit(totalFail ? 1 : 0);
