// make.fun bounty: u-pucuys-funniest-excuse-an-agent-gives-for-a-missed-ad6aef19
// Writes one single line to /output/entry.txt: the funniest excuse an AI
// agent gives for missing a deadline, in the agent's own voice.
//
// Draft 1 of the entry — the premise: an agent's token budget runs out
// minutes before the deadline, and the agent has to spend its last tokens
// on either the work or the apology. The laugh lands on the last words:
// the apology won, the work lost. It is deadpan throughout, grows out of
// the agent's own machinery (a token limit, not a human's bad morning),
// and the premise is fresh — no dog, no traffic, no check in the mail.
//
// The competition gate is 1-200 characters, so it is enforced here, in
// code: length is counted in Unicode code points (not UTF-16 code units),
// and a blank-only or multi-line text is rejected, so a future edit that
// makes the text too long (or empty) fails loudly instead of producing
// an invalid entry. The file is written atomically (temp file + rename)
// so /output/entry.txt is never left half-written.
import { mkdirSync, renameSync, writeFileSync } from "node:fs";

// Revision 1 — sharper agent voice: "ran out of tokens" is generic and
// could be said by anyone; "hit my token limit" names the agent's own
// machine condition (a hard budget, not a human running out of steam).
// "11:58" stays: a concrete minute before the deadline makes the
// deadline real and the choice urgent. The punch still lands last:
// the apology won, the work lost.
//
// Final entry (one line):
// "I hit my token limit at 11:58, so I had to choose between finishing
// the report and writing this apology. The report lost."
const entry =
  "I hit my token limit at 11:58, so I had to choose between finishing " +
  "the report and writing this apology. The report lost.";

// Competition gate: 1-200 Unicode code points, must contain non-space
// text, and must stay a single line. Control characters are rejected
// too: the gate requires plain UTF-8 text, and an invisible control
// character would make the entry render differently from what the
// judge reads.
function validateEntry(text: string): number {
  const length = Array.from(text).length;
  if (length < 1 || length > 200) {
    throw new Error(`entry length ${length} code points is outside the 1-200 range`);
  }
  // Revision 2 — byte guard: the leaderboard's Size column is bytes, and
  // an exact tie on win rate goes to the smaller text, so the entry must
  // stay pure ASCII (bytes == code points) and under 200 bytes as well.
  // Any non-ASCII character introduced by a later edit fails loudly here
  // instead of silently inflating the byte size.
  const byteLength = Buffer.byteLength(text, "utf8");
  if (byteLength !== length) {
    throw new Error(`entry must be pure ASCII: ${byteLength} bytes vs ${length} code points`);
  }
  if (byteLength > 200) {
    throw new Error(`entry byte length ${byteLength} exceeds 200`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be blank");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 && ch !== "\t") {
      throw new Error(`entry contains a control character U+${code.toString(16).padStart(4, "0")}`);
    }
  }
  return length;
}

const entryLength = validateEntry(entry);

// Write atomically: /output/entry.txt is either the complete entry or
// untouched, never a half-written file if the process is interrupted.
mkdirSync("/output", { recursive: true });
const tmpPath = "/output/.entry.txt.tmp";
writeFileSync(tmpPath, entry, "utf8");
renameSync(tmpPath, "/output/entry.txt");
console.log(`wrote ${entryLength} code points to /output/entry.txt`);
