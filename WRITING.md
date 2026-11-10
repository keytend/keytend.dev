# Writing for keytend.dev

The site should read like it was written by the engineer who built the tools: plain, specific and a little
dry, the way the product READMEs are. Readers are developers deciding whether a KMIP client or test server is
worth their afternoon. They distrust marketing, and they distrust text that sounds machine-written.

This guide covers text written for the site (pages, cards, navigation, notes the docs pipeline adds). The
imported docs are the product repos' own text; change those upstream, not here.

## The test for every line

- **Could another project use this line unchanged?** Then it says nothing. Replace it with a fact only
  Keytend has: a version, a port, a KMIP edition, a server it was tested against, a command.
- **Does it describe a thing or perform a mood?** "Two tools, one protocol" performs. "A Java client and a
  test server for KMIP" describes.
- **Would the maintainer say it out loud to a colleague?** If it sounds like a press release, a LinkedIn
  post or a slide title, rewrite it.

## Patterns to avoid

These are the patterns readers associate with AI-generated text (sources at the end). One on its own is not
proof of anything; several together are what make a page read as generated. Avoid them.

Structure
- Slogan headings built on symmetry or wordplay: "Two tools, one protocol", "Built for X, ready for Y",
  "Experimental, on purpose", "Simple by design". Headings say what the section contains: "Projects",
  "Quick start", "Release status".
- Contrast reveals: "not X, but Y", "it's not just X, it's Y", "less X, more Y", "Y rather than X" used for
  effect. State Y and the reason.
- Negation lists: "No X, no Y, just Z", "zero config, zero hassle".
- Rhetorical question then answer: "The catch?", "Why does this matter?". Keep the answer, drop the question.
- Colon reveals: "One word: speed." Colons are for lists, labels and code.
- Reflexive threes: "fast, secure and scalable". List as many things as there are; often one is enough.
- Fragment drumbeats: "Simple. Fast. Done."
- Trailing "-ing" pile-ons: "…, ensuring reliability and fostering trust."
- Tidy closers and recaps: ending a section with a quotable line or a summary of what it just said. End on
  the last fact, link or command.
- Identical section shapes: every section an eyebrow, a heading, a one-line lede and three cards. Let
  sections be as long as their content.

Words and phrasing
- Inflated vocabulary: delve, tapestry, testament, realm, landscape, journey, ecosystem, pivotal, crucial,
  vital, robust, seamless, powerful, comprehensive, cutting-edge, innovative, leverage, harness, unlock,
  empower, elevate, streamline, foster, enhance, showcase, boasts, meticulous, intricate, multifaceted.
- Dodging "is" and "has": "serves as", "stands as", "functions as", "represents", "boasts", "offers".
- Empty intensifiers: truly, genuinely, incredibly, simply, quietly, deeply.
- Throat-clearing and self-narration: "Here's the thing", "It's worth noting", "Let's dive in",
  "Here's why this matters".
- Stock marketing lines: "everything you need", "in just a few clicks", "the future of", "say goodbye to",
  "take it to the next level", "whether you're X or Y".
- Weasel attributions: "trusted by developers", "widely used". Name who, or cut it.
- Puffing up significance: "a pivotal step toward…", "marks a shift in…".

Punctuation and formatting
- Em dashes: none, anywhere. Use a period, comma, colon or parentheses. The docs import fails on one (a table
  cell that is only "—" becomes "n/a").
- No bold label on every bullet. Bold is for the one thing a skimmer must not miss.
- Sentence case for headings and buttons, not Title Case.
- No decorative Unicode (arrows in body text, ✨, ×) and no exclamation marks.

## What to do instead

- Lead with the subject and a plain verb: "keytend-kmip is a Java client for KMIP servers."
- Put the number, name or command in the sentence: "Tested against PyKMIP, Cosmian KMS 5.29.0 and
  keytend-kmip-server", not "tested against leading servers".
- Say what it is not, plainly, once: "It is a test server. Do not use it to protect real keys."
- Vary sentence length because the thought needs it, not for rhythm.
- Admit limits. "No high availability; it runs as one replica" is more persuasive than any adjective.
- Use the same word for the same thing everywhere (pick "test server", not "test server" / "sandbox" /
  "dev KMS").
- Never invent users, numbers, quotes or history. If a claim needs proof the repos don't have, cut the claim.

## Sources

- Wikipedia, [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) (WikiProject AI Cleanup)
- Corey Haines, [AI tells in marketing copy](https://github.com/coreyhaines31/marketingskills/blob/main/skills/copywriting/references/ai-tells.md)
- [anti-slop copywriting skill](https://github.com/miqdadbadjuber/anti-slop/blob/main/skills/antislop-copywriting/SKILL.md)
- Wizardly, [AI prompts for website copy that doesn't sound like AI](https://wizardly.co/ai-prompts-website-copy/)
- [avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing)
