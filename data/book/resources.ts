import { Chapter } from "@/types/reader";

export const RESOURCES_CHAPTER: Chapter = {
  id: "ch-resources",
  title: "Resources, Index & Further Learning",
  readingTimeMinutes: 12,
  content: `# RESOURCES & FURTHER LEARNING

> *"An investment in knowledge pays the best interest."*  
> — Benjamin Franklin

---

## Official Source Code Repository

All code examples, Dockerfiles, vulnerable test applications, and exploit scripts from this book are hosted and maintained in the official GitHub repository:

- **Repository:** https://github.com/spaceraccoon/from-day-zero-to-zero-day
- **Author's Research Blog:** https://spaceraccoon.dev
- **Author on X (Twitter):** https://x.com/spaceraccoonsec

To clone with all target submodules:
\`\`\`bash
$ git clone https://github.com/spaceraccoon/from-day-zero-to-zero-day
$ cd from-day-zero-to-zero-day
$ git submodule update --init
\`\`\`

---

## Essential Tools Catalog

### Code Review & Variant Analysis
- **CodeQL:** https://codeql.github.com — Semantic code analysis engine.
- **Semgrep:** https://semgrep.dev — Fast lightweight syntax-aware pattern matching.
- **AST Explorer:** https://astexplorer.net — Interactive web-based AST visualizer for multiple languages.

### Reverse Engineering & Disassembly
- **Ghidra:** https://ghidra-sre.org — Free and open-source software reverse engineering suite (NSA).
- **ILSpy:** https://github.com/icsharpcode/ILSpy — Modern open-source .NET decompiler.
- **dnSpy:** https://github.com/dnSpy/dnSpy — .NET debugger and assembly editor.
- **JADX:** https://github.com/skylot/jadx — Dex to Java decompiler with GUI.
- **Decompyle++ (pycdc):** https://github.com/zrax/pycdc — Python bytecode disassembler and decompiler.
- **PyInstaller Extractor:** https://github.com/extremecoders-re/pyinstxtractor — Unpacks PyInstaller executables.
- **GoReSym:** https://github.com/mandiant/GoReSym — Go symbol, type, and path extractor for stripped binaries.
- **Binwalk:** https://github.com/ReFirmLabs/binwalk — Firmware analysis and extraction tool.

### Dynamic Tracing & Emulation
- **Frida:** https://frida.re — Dynamic instrumentation toolkit for developers, reverse engineers, and security researchers.
- **DynamoRIO:** https://dynamorio.org — Dynamic binary instrumentation platform (includes \`drcov\`).
- **Qiling Framework:** https://qiling.io — Advanced cross-platform, cross-architecture binary emulation engine.
- **angr:** https://angr.io — Multi-architecture binary analysis and symbolic execution platform.
- **pspy:** https://github.com/DominicBreuker/pspy — Linux process monitoring without root privileges.

### Fuzzing
- **AFL++:** https://github.com/AFLplusplus/AFLplusplus — Coverage-guided evolutionary fuzzer.
- **boofuzz:** https://github.com/jtpereyda/boofuzz — Network protocol fuzzing framework in Python.
- **radamsa:** https://gitlab.com/akihe/radamsa — General-purpose mutation-based test case generator.
- **FormatFuzzer:** https://github.com/uds-se/FormatFuzzer — Framework for compiling binary templates into format-aware fuzzers.
- **Jazzer:** https://github.com/CodeIntelligenceTesting/jazzer — Coverage-guided fuzzer for the JVM (Java, Kotlin, Scala).
- **Fuzzilli:** https://github.com/googleprojectzero/fuzzilli — JavaScript engine fuzzer by Google Project Zero.
- **Google OSS-Fuzz:** https://github.com/google/oss-fuzz — Continuous fuzzing service for open-source software.

---

## Vulnerability Disclosure & Coordination Portals
- **MITRE CVE Request Portal:** https://cveform.mitre.org
- **National Vulnerability Database (NVD):** https://nvd.nist.gov
- **security.txt Standard (RFC 9116):** https://securitytxt.org
- **CERT/CC Vulnerability Reporting Form:** https://kb.cert.org/vuls/
- **Google Project Zero:** https://googleprojectzero.blogspot.com
- **Zero Day Initiative (ZDI):** https://www.zerodayinitiative.com
`
};
