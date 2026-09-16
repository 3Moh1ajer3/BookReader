// v2: assigns language tags to code fences with better heuristics.
const fs = require("fs");

// Strip noise that confuses detection
function normalize(code) {
  return code
    .replace(/[❶❷❸❹❺❻❼❽❾❿]/g, "")
    .replace(/--snip--/g, "");
}

function detectLang(rawCode) {
  const code = normalize(rawCode).trim();
  if (!code) return "";
  const t = code;
  const lines = code.split("\n").map((l) => l.trim()).filter(Boolean);
  const first = lines[0] || "";
  const codeLines = lines.filter((l) => !/^[#/*]/.test(l) || /#include|#define/.test(l));
  const nonComment = codeLines.join("\n");

  // 1. HTTP messages
  if (/^(GET|POST|PUT|DELETE|HEAD|OPTIONS)\s+\S+\s+HTTP\//.test(t) || /^HTTP\/1\.[01]\s+\d{3}/.test(t)) return "http";

  // 2. Terminal sessions: prompts
  const promptLines = lines.filter((l) => /^\$\s+/.test(l)).length;
  if (promptLines >= 2) return "bash";
  if (promptLines >= 1 && lines.length <= 8 && !/[{};]/.test(nonComment)) return "bash";
  if (/^(sudo|apt|pip|wget|curl|tar|cd|git|make|cmake|echo|export|source|python3?|semgrep|codeql|ln|touch|ls|cat|rm)\s/.test(first) && !/[{};]/.test(nonComment)) return "bash";

  // 3. XML / HTML (starts with tag)
  if (/^<\?xml|^<!DOCTYPE/i.test(t)) return "xml";
  if (/^<\/?[a-zA-Z]/.test(t) && /<\/[a-zA-Z]+>|\/>/.test(t)) return t.includes("html") || /<(html|body|div|span|link\b)/i.test(t) ? "html" : "xml";
  if (/^<(link|meta|br|img|p|h[1-6]|a)\b/i.test(t)) return "html";

  // 4. JSON
  if (/^\{[\s\S]*\}$/.test(t) && /"[^"]+"\s*:/.test(t) && !/[;=]\s*$/m.test(t.replace(/"[\s\S]*?"/g, ""))) return "json";

  // 5. YAML (semgrep rules, k8s, configs): top-level keys with colon, 2-space indented children, dashes
  if (/^\s*rules:\s*$/m.test(t) || /^\s*-\s+id:\s/m.test(t)) return "yaml";
  if (/^[a-z][a-z-]*:\s*$/m.test(t) && /^\s*-\s+[a-z-]+:/m.test(t) && !/[{};]/.test(t)) return "yaml";
  if (/^[a-z][a-z-]*:\s*$/m.test(t) && /^ {2,}\S/m.test(t) && !/[{};]/.test(t) && !/\bfunction\b/.test(t)) return "yaml";

  // 6. SQL
  if (/\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE)\b/i.test(t) && /\b(FROM|SET|VALUES|INTO)\b/i.test(t)) return "sql";

  // 7. Diff / patch
  if (/^@@\s+-\d+,\d+/m.test(t) || /^(---\s|\+\+\+\s)/m.test(t)) return "diff";

  // 8. Go
  if (/\bfunc\s+\w*\(|^\s*package\s+main\b|\bfmt\.(Print|Errorf|Sprintf)/m.test(t) || /:=/.test(t) && /\bfunc\b/.test(t)) return "go";

  // 9. Java
  if (/public\s+(class|static|void)|@RequestMapping|@Autowired|@Controller|@Override|private\s+final|System\.out\.print|import\s+java\./.test(t) && !/using\s+System/.test(t)) return "java";

  // 10. C#
  if (/using\s+System|namespace\s+[A-Z]|Console\.(ReadKey|WriteLine)|NamedPipeServerStream|PipeSecurity|WellKnownSidType/.test(t)) return "csharp";

  // 11. Python (imports, defs, decorators, struct/namedtuple, self.)
  if (/^\s*(import\s+\w+|from\s+[\w.]+\s+import\s)/m.test(t)) return "python";
  if (/(^|\n)\s*def\s+\w+\(|(^|\n)\s*class\s+\w+[(:]|^\s*@\w+/.test(t)) return "python";
  if (/(^|\n)\s*(try:|except\s*\w*\s*:|elif\s|else:)/.test(t) && !/[{};]\s*$/m.test(t)) return "python";
  if (/struct\.unpack|namedtuple\(|asyncio\.|logger\.(debug|exception)|self\.\w+\s*=|elif\s/.test(t) && !/[{};]\s*$/m.test(t.replace(/"[\s\S]*?"/g, ""))) return "python";
  if (/^\s*[\w."']+\s*=\s*[\w."'\(]/.test(t) && /\(/.test(t) && !/[{};]|\$\s/.test(t)) return "python";

  // 12. JavaScript / Node
  if (/(const|let|var)\s+[\w{},\s$]+\s*=\s*require\(/.test(t) || /console\.log|app\.listen|express\(\)|exports\.\w+\s*=|\.createServer\(|router\.(get|post)\(|res\.(send|end)\(/.test(t)) return "javascript";
  if (/^(var|let|const)\s+\w+\s*=\s*["'`]/m.test(t) && !/\bdef\b|\bfunc\b/.test(t)) return "javascript";
  if (/(const|let|var)\s+\w+\s*=\s*|=>\s*\{?|function\s*\w*\(/.test(t) && !/[;>]\s*$/m.test(t) === false) return "javascript";
  if (/(const|let|var)\s+\w+\s*=/.test(t) && /\(.*\)|=>/.test(t) && !/#include|printf|malloc/.test(t)) return "javascript";

  // 13. C / C++ / Windows API
  if (/#include|#define\s+[A-Z_]|int\s+main\s*\(|printf\s*\(|\bmalloc\(|\brealloc\(|\bmemcpy\(|\bfree\(|struct\s+\w+\s*\{|\bDWORD\b|\bHANDLE\b|\bLPCSTR\b|\bLPSTR\b|\bpid_t\b|\buid_t\b|\bgid_t\b|typedef\s+struct/.test(t)) return "c";
  if (/\b(uint8_t|uint16_t|uint32_t|uint64_t|int8_t|int16_t|int32_t|int64_t|size_t|sockaddr|ntohs|htons|syslog|AF_INET|SOCK_\w+|INADDR_ANY)\b/.test(t)) return "c";
  if (/\b(void|int|char|auto)\s+\*?\w+\s*\([^;)]*\)/.test(t) && /\bsizeof\(|\w+\([^;]*\)\s*;/.test(t)) return "c";
  if (/\bsizeof\s*\(|\w+->\w+\s*=\s*[^=]/.test(t) && /[();]/.test(t) && !/\b(def|import|function|val|let|const)\b/.test(t)) return "c";

  // 14. Assembly
  if (/^\s*(mov|push|pop|call|jmp|lea|add|sub|xor|cmp|jne|je)\s/i.test(t)) return "asm";

  return "";
}

function processFile(file) {
  let raw = fs.readFileSync(file, "utf8");
  if (process.argv.includes("-force")) {
    raw = raw.replace(/```[a-zA-Z0-9_\-#+]*[ \t]*\r?\n/g, "```\n");
  }
  const re = /```([a-zA-Z0-9_\-#+]*)[ \t]*\r?\n([\s\S]*?)```/g;
  let out = "";
  let lastIdx = 0;
  let match;
  let tagged = 0;
  let total = 0;
  const log = [];
  while ((match = re.exec(raw)) !== null) {
    total++;
    out += raw.slice(lastIdx, match.index);
    lastIdx = match.index + match[0].length;
    let lang = match[1];
    if (!lang) {
      lang = detectLang(match[2]) || "text";
      tagged++;
      log.push([lang, normalize(match[2]).trim().split("\n")[0] || ""]);
    }
    out += "```" + lang + "\n" + match[2] + "```";
  }
  out += raw.slice(lastIdx);
  fs.writeFileSync(file, out, "utf8");
  console.log(`${file}: ${tagged}/${total} blocks tagged`);
  if (process.argv.includes("-v")) {
    log.forEach(([lang, first]) => console.log(`   ${lang.padEnd(10)} | ${first.slice(0, 60)}`));
  }
}

for (const f of process.argv.slice(2)) {
  if (!f.startsWith("-")) processFile(f);
}
