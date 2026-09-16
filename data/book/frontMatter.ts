import { Chapter } from "@/types/reader";

export const FRONT_MATTER_CHAPTER: Chapter = {
  id: "front-matter",
  title: "Front Matter & Forewords & Introduction",
  readingTimeMinutes: 18,
  content: `# FROM DAY ZERO TO ZERO DAY
## A Hands-On Guide to Vulnerability Research
**By Eugene Lim ("Spaceraccoon")**  
*Published by No Starch Press®, Inc., San Francisco*

---

### Dedication
To my wife, Darshini, the real bug hunter;  
To the Lim family, who bore my nocturnal ways;  
To BBAC, (still waiting on that BBQ);  
To the Hacker101 OGs, you were there from Day Zero.  
To the memory of Rajaram Ramiah.

---

### About the Author
**Eugene "Spaceraccoon" Lim** is a security researcher and white-hat hacker. From Amazon to Zoom, he has helped secure applications from a range of vulnerabilities, and in 2021 he was selected from a pool of one million white-hat hackers for HackerOne’s annual H1-Elite Hall of Fame. Since 2020, he has been credited for hundreds of vulnerability disclosures in enterprise software, applications, and hardware. His work has been featured at top conferences such as Black Hat and DEF CON and in industry publications such as *Wired* and *The Register*.

### About the Technical Reviewer
**Kc Udonsi (CISSP)**, aka "glitchnsec," is currently the security architect at Stan Technology Inc., where he oversees the organization’s security posture by designing and building defenses. He has experience leading research teams in the cybersecurity industry and mentoring security professionals. Kc offers training on the OpenSecurityTraining platform and is a sessional instructor for computer and network security at his alma mater, the University of Toronto Scarborough. In his previous role as a senior vulnerability researcher at Trend Micro, he disclosed significant vulnerabilities to companies such as Adobe and Microsoft.

---

## FOREWORD BY JACOB SOO
*(Founder and CEO of STAR Labs SG, Singapore — September 2024)*

This book is more than just a theoretical exploration; it’s a hands-on, practical guide designed for immediate application. Each chapter equips you with essential skills, techniques, and strategies that empower you to confidently dissect complex code and identify weaknesses. Whether you’re mapping out attack surfaces or analyzing subtle vulnerabilities, the insights you gain will translate directly into enhanced research capabilities.

Reflecting on my own journey into vulnerability research back in 2003, I remember feeling a mix of excitement and uncertainty. The countless hours spent on trial and error made understanding software bugs daunting. During those early days, with limited resources—primarily Phrack and a few reversing e-zines—finding reliable guidance was challenging. I often spent evenings poring over code, eager to unravel its complexities. If I’d had a guide like *From Day Zero to Zero Day*, my learning experience would have been not just easier but also far more fulfilling.

Eugene’s journey from a fresh graduate navigating the world of vulnerability research to becoming one of Singapore’s top bug bounty hunters has provided him with extensive hands-on experience and profound technical insight. This journey encompasses the entire spectrum of vulnerability research. What sets this book apart is its unwavering commitment to the fundamentals—fostering a solid understanding of how vulnerabilities manifest, equipping you to tackle unfamiliar code with confidence, and cultivating a structured, analytical mindset. Complex concepts are broken down into intuitive, accessible knowledge.

As I read through the chapters, I recognized the logical progression every researcher encounters: mapping out attack surfaces, understanding data flows, and identifying subtle yet impactful weaknesses. The book maintains a practical and realistic approach, rooted in real-world experience rather than purely theoretical scenarios. Each topic is introduced not just to impart skills but to transform the way you approach security problems as a whole.

Whether you are just starting out or looking to refine your methodologies, this book serves as a mentor, guiding you through each step of your learning journey with clarity and purpose. It’s an invaluable resource that deepens your understanding of vulnerability research while encouraging exploration and critical thinking.

As researchers, we embrace curiosity and don’t accept things at face value; we seek to understand the "why" behind everything. We dig deeper than the average user, focusing on the underlying code instead of flashy presentations. This journey involves mastering the intricacies of code, enabling us to rewrite and manipulate it with confidence.

I encourage you to engage actively with the examples; don’t read passively. Exploring the concepts in a hands-on way will deepen your understanding. Don’t hesitate to make mistakes along the way! When something breaks (and it will), take the time to understand why. This is where genuine learning occurs. Take this opportunity to explore and enjoy the process; there’s plenty of fun to be had as you unravel these mysteries. This book truly deserves a place on the desk of anyone new to vulnerability research.

Have Phun.

---

## FOREWORD BY SHUBHAM SHAH, AKA "SHUBS"
*(CTO of Assetnote, Sydney, Australia — October 2024)*

When I was a toddler, my parents used to playfully scold me, saying that every time they bought me a new toy I would "break it, crumble it, take it apart in pieces." Little did I know that my curiosity about understanding the inner workings of something—or just causing chaos and seeing what it led to—would prove helpful in vulnerability research.

Although I had a way with computers, breaking computer systems was never a career option I thought I had. My family was distraught at the idea of me breaking into systems for a living, and computer security was not a well-known career pathway. Fortunately, times have changed.

Since I come from this time when the relevant knowledge was hidden in the dark nooks of the internet or transferred within tight-knit communities, Eugene Lim’s *From Day Zero to Zero Day* has renewed my optimism about training the next generation of vulnerability researchers.

As someone who has been heavily involved in the security research community for the last 10 years, I have closely followed Eugene’s work in admiration as he has tackled a broad range of topics, from complex client-side attacks and server-side issues to deep reverse engineering of custom protocols.

In *From Day Zero to Zero Day*, Eugene synthesizes this diverse knowledge to provide a framework and structure for systematically taking apart software and discovering its underlying flaws. He explores the modern mindset and procedures of vulnerability researchers in several domains, from source code analysis and binary exploitation to deep fuzzing and automated variant analysis. Eugene’s focus on first principles makes *From Day Zero to Zero Day* a timeless book for vulnerability researchers.

What I loved the most about this book is its unique ability to really start from day zero and teach the fundamentals needed to be successful at vulnerability research. Historically, the topics covered here have been dispersed across a mountain of research articles, presentations, and blog posts, which have often lacked pragmatic guidance and reproducibility. The idea of being a vulnerability researcher has felt out of reach to many, as these topics were never cohesively brought together in a single place.

With the increasing complexity and maturity of computer systems over the last few decades, analyzing, finding, and exploiting zero-day vulnerabilities has become an art form that requires undivided attention and constant iteration. A good exploit is akin to a magnificent painting, and zero days are waiting to be found, regardless of how deeply a product or program has been analyzed for security issues.

As vulnerability researchers, it is our job to challenge assumptions. The fact that a system is popular and widely deployed or may have been audited thoroughly in the past should not deter our motivation and willingness to dive deep and discover vulnerabilities. It is our unwavering attention and dedication in this field that leads to the most significant discoveries. To succeed in vulnerability research, one must resist the urge to give up and push through the psychological challenges that stand in the way of the discovery of critical bugs.

Eugene’s detailed guidance in the different areas of vulnerability research reinforces this mindset and provides practical steps to discover vulnerabilities in widely deployed software.

I hope you also have the opportunity to build exploits you look back at in the future as art.

---

## INTRODUCTION

Zero day. The term evokes a sense of urgency, fear, and yes, even excitement in infosec circles. They are called *zero days* because no one other than the researchers who discovered them knows about them, and the clock to patch a known vulnerability hasn’t even started yet. The discoverers of the zero days are thus free to exploit them at will. Rare, dangerous, and often over-hyped, zero days capture the imagination of security enthusiasts, who view zero-day research as one of the pinnacles of offensive security.

In my early days as a journeyman hacker who’d had some minor successes in security testing, hunting for zero days seemed to me a mystic art reserved for only the wisest and most experienced hackers. I read blog posts and watched conference talks detailing incredible zero-day discoveries and exploits, but like the audience at a magic show, I could only be impressed by the final reveal without grasping the method, or trick, behind it all. How did the researcher know to look at this particular part of the code? Why did they attempt this exploit instead of another? Answering those questions was often left as an exercise for the viewer or reader, but despite me venturing into other disciplines, like red teaming and web penetration testing, my experiences did not shed much light. I felt like there was a huge gap between where I was and where I needed to be: not quite a beginner, but far from a master.

However, with the right opportunities to practice cross-disciplinary skills such as malware reverse engineering, and the time and space to focus on deep security research, I began to discover that zero-day hunting wasn’t as arcane as I’d thought. Like with a magic trick, the process behind it was actually systematic and, more importantly, learnable. In spite of the wide variety of targets and techniques, there are many common tools and approaches researchers can use to effectively discover new vulnerabilities. This book aims to take you through the journey from day zero as a novice researcher to discovering your first zero day and beyond.

### Who Should Read This Book and Why

I wrote this book for others who are staring across the gap and for those who experience a sense of impostor syndrome when considering zero-day research, despite having a good grasp of offensive security fundamentals. You may be just starting out, popping a few boxes for practice or capturing flags at contests. You might have read a web hacking book like *Real-World Bug Hunting* by Peter Yaworski (No Starch Press, 2019) or a more general introduction like *Ethical Hacking* by Daniel G. Graham (No Starch Press, 2021). Maybe you have some experience working as a penetration tester or red teamer, but you still feel lost when contemplating getting started on security research.

While some blog posts and other online materials attempt to teach this subject, they can’t go as deeply into the whole range of needed technical skills as a book-length treatment can. Or they may go too deeply into one particular niche topic, without explaining the overall strategy and thought process needed to approach security research. This book is the book I wished I’d had back when I first started out. It provides both a high-level overview and nitty-gritty details, without assuming too much prior knowledge. By the time you finish it, you should be able to initiate your own independent security research project.

### What This Book Is About

This book covers three broad techniques in zero-day research: code review, reverse engineering, and fuzzing. However, it doesn’t simply teach *how* to use these techniques, but *why*. It describes the best way to deploy them, and for which targets. I explain the process of analyzing a target to identify the most likely weak spots and demonstrate with real-world examples. For example, when explaining taint analysis in code review, I take a disclosed vulnerability in actual software and rediscover it from scratch.

While it’s impossible to cover the three techniques fully—doing so for each one would take a book (or several) by itself—I introduce subdomains within each area in sufficient detail that you’ll be able to make your own informed decisions about which tools or techniques to use for the problem at hand. For example, fuzzing tools comprise not only traditional random fuzzers but also coverage-guided fuzzers that use compile-time or runtime instrumentation. By learning and applying these concepts, you’ll be well equipped to explore further on your own.

Although the grouping of chapters into parts allows you to jump around based on the technique you wish to focus on, I recommend reading the chapters in order as you progress in your understanding of the target. It may be tempting to jump straight to "Fuzzing Everything" (Chapter 9), but without a deeper understanding of data flows and taint analysis from Part I, which focuses on source code review, you may waste a lot of time fuzzing the wrong part of a target. Nevertheless, if you feel well versed in a particular topic, feel free to skip ahead. A short summary of the chapters in this book follows:

- **Chapter 0: Day Zero:** Introduces the key concepts of zero-day vulnerability research and differentiates it from other offensive security disciplines. You’ll also learn how to identify potential research targets.
- **Part I: Code Review** takes you through understanding and analyzing the source code of your research targets. While not every target may have source code available, the techniques you learn here focus on the fundamentals of vulnerability discovery that you’ll still apply in reverse engineering and fuzzing. In addition, you’ll learn how to transition from manual to automated analysis to scale your coverage.
  - **Chapter 1: Taint Analysis:** Walks through the process of manual source and sink analysis through real-world examples. It explains the sink-to-source strategy as an optimal approach.
  - **Chapter 2: Mapping Code to Attack Surface:** Teaches you how to map the code you are reading to the actual target, and vice versa. It identifies various attack vectors and shows you how to identify them in source code.
  - **Chapter 3: Automated Variant Analysis:** Demonstrates how you can automate source code analysis using tools like CodeQL and Semgrep. It also explains how to scale your research across multiple targets at once.
- **Part II: Reverse Engineering** focuses on extracting information from targets that allows you to understand how input flows through them and potentially reach exploitable code. As in Part I, you’ll start with manual techniques before moving on to more efficient automation.
  - **Chapter 4: Binary Taxonomy:** Covers several categories of typical binaries and how to reverse engineer them. We’ll explore how to quickly triage binaries and apply the right reverse engineering tools.
  - **Chapter 5: Source and Sink Discovery:** Explains how to locate areas of interest in binaries for further analysis using static and dynamic methods.
  - **Chapter 6: Hybrid Analysis in Reverse Engineering:** Delves into more advanced reverse engineering approaches, such as emulation, code coverage, and symbolic analysis. The examples combine static and dynamic analysis to narrow down your search.
- **Part III: Fuzzing** covers the highly automated and scalable art of fuzzing. Having learned about source and sink analysis in code review and reverse engineering, you can now understand how fuzzing short-circuits processes and how you can enhance your fuzzing with the principles and techniques from previous chapters.
  - **Chapter 7: Quick and Dirty Fuzzing:** Explores the basics of fuzzing files and protocols and how to quickly bootstrap fuzzing with templates.
  - **Chapter 8: Coverage-Guided Fuzzing:** Details the process of coverage-guided fuzzing with AFL++, including writing a harness and analyzing fuzzing performance.
  - **Chapter 9: Fuzzing Everything:** Discusses even more fuzzing targets and approaches to handle complex formats and binaries.
  - **Chapter 10: Beyond Day Zero:** Describes the process of coordinated vulnerability disclosure, writing a good vulnerability report, and how to apply vulnerability research to improve the security of organizations.

### Source Code and Online Resources

This book features many working examples that you should test out for yourself. The majority of examples are run on the latest version of Kali Linux at the time of this writing or use free and open source software, but a handful include Windows targets, so it’s best to use virtual machines to run the relevant operating systems and targets. The examples are all based on x86 and x64, so the virtual machines can’t be ARM-based, which means you can’t host them on Apple Silicon devices.

The source code and scripts used in the examples are available in the book’s code repository at https://github.com/spaceraccoon/from-day-zero-to-zero-day. You should use that as a reference to save time instead of copying and pasting snippets from the book. The repository contains Git submodules, which are copies of specific versions of open source repositories, so you’ll have to run an additional Git command to fetch them after cloning the repository:

\`\`\`bash
$ git clone https://github.com/spaceraccoon/from-day-zero-to-zero-day
$ cd from-day-zero-to-zero-day
$ git submodule update --init
\`\`\`

Along the way, if you face any problems with the examples or have further questions, feel free to create an issue on the GitHub repository or reach out to me on X at https://x.com/spaceraccoonsec.

### Further Reading

In the book, I reference several examples from my security research blog at https://spaceraccoon.dev, which I’ll continue to update with new research and cybersecurity-related topics.

After finishing this book, I recommend following up with specific books that focus on particular targets and techniques, such as the following:

- *Practical Binary Analysis* by Dennis Andriesse (No Starch Press, 2018) provides a more thorough treatment of reverse engineering, in particular for x86-64 Linux binary analysis. This will fully equip you with the foundations of reverse engineering.
- *Attacking Network Protocols* by James Forshaw (No Starch Press, 2017) takes a deep dive into network protocols, which require specialized tools to capture and analyze. The book also provides great detail about protocol internals and cryptography, and it is a good study of reverse engineering techniques.
- *The Hardware Hacking Handbook* by Jasper van Woudenberg and Colin O’Flynn (No Starch Press, 2021) covers the vast range of hardware targets and the practical skills needed to tackle this type of security research, like working with electrical circuitry.
- *Practical IoT Hacking* by Fotios Chantzis, Ioannis Stais, Paulino Calderon, Evangelos Deirmentzoglou, and Beau Woods (No Starch Press, 2021) is a useful survey guide that covers hardware, firmware, and the wider internet of things (IoT) ecosystem, such as mobile applications.

After learning the basic principles of vulnerability research, you’ll be able to better appreciate the advanced and specialized techniques covered by these books.

The world of zero-day research is vast and ever-expanding. New and experienced researchers share fresh discoveries all the time, so it’s worth checking out social media websites like X or https://infosec.exchange/public/local for the latest findings. In addition, consider exploring the archives of cybersecurity conferences like hardwear.io, DEF CON, Hack In The Box, and OffensiveCon, which are treasure troves of research presentations and papers. And don’t forget to follow the blogs of zero-day research organizations and companies, including the Zero Day Initiative (https://www.zerodayinitiative.com/blog), which pull back the curtain on high-impact zero days.

Let’s get started hunting zero days!
`
};
