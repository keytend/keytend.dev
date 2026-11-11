---
title: "Licensing"
description: "keytend-kmip's own code and documentation are licensed under the Apache License 2.0. NOTICE names the project and keeps the standards and third-party attributions."
editUrl: "https://github.com/keytend/keytend-kmip-java/edit/main/docs/licensing.md"
head: [{"tag":"title","content":"Licensing | Keytend KMIP Java SDK"},{"tag":"meta","attrs":{"data-pagefind-meta":"title[content]","content":"Licensing · keytend-kmip (Java)"}},{"tag":"meta","attrs":{"data-pagefind-filter":"project[content]","content":"keytend-kmip (Java)"}}]
---

keytend-kmip's own code and documentation are licensed under the
[Apache License 2.0](https://github.com/keytend/keytend-kmip-java/blob/c5da4f1f409914da3790bbad79b37a6296585520/LICENSE).
[NOTICE](https://github.com/keytend/keytend-kmip-java/blob/c5da4f1f409914da3790bbad79b37a6296585520/NOTICE) names the project and keeps the standards and third-party attributions.

## What the JARs contain

- Every module's JAR (the SDK, the in-memory test server, the two metrics modules, the CLI and the
  integration application) carries `META-INF/LICENSE` and `META-INF/NOTICE`, the repository's
  own. Apart from the SDK's bundled Caffeine, the JARs bundle no third-party code. The libraries
  they use are separate JARs under their own licenses ([dependencies](/kmip-java/docs/dependencies/)).
- The SDK JAR bundles [Caffeine](https://github.com/ben-manes/caffeine) (Apache-2.0), relocated
  ([The bundled Caffeine](/kmip-java/docs/dependencies/#the-bundled-caffeine)). NOTICE's "Bundled third-party
  code" names its version, copyright and origins. Its license is
  `META-INF/licenses/caffeine/LICENSE`, as Caffeine ships it, so it never replaces the SDK's own
  `META-INF/LICENSE`.
  `META-INF/maven/com.github.ben-manes.caffeine/caffeine/` holds its `pom.properties` and POM, so
  that scanners that read a JAR's contents find the bundled version.
- `./mvnw -Pdistribution install` also builds source and Javadoc JARs. The SDK's source JAR holds
  Caffeine's sources, relocated, and the same two license files as the SDK JAR. The notices are
  copied into the Javadoc JAR, next to the JDK doclet's own legal notices. The Javadoc documents
  the SDK's API only.
- The binary ZIP's `lib/` also holds the libraries the CLI and the lab run with (slf4j-api and
  the others `cli/target/lib/` lists). They are other projects' JARs, each with its own license
  files.

## Source headers

Each authored file starts with the Apache header for a copyright owner, from the license's
appendix. This follows the Apache Software Foundation's
[guidance for projects outside the ASF](https://www.apache.org/legal/apply-license.html#new).
The ASF contributor-agreement header does not apply, because the ASF does not own this project.

Headers use the comment syntax of each file type. This covers Java, Python, Go and shell
sources, Dockerfiles, build files, SVG and the documentation. Shebangs and XML declarations
stay on the first line. Generators write the header into generated Java and HTML.

Data files (JSON, TSV, CSV) and checksums carry no header, because a comment would break their
format. The distribution's LICENSE and NOTICE cover them.

To check the headers:

```sh title="Source headers"
python3 tools/license_headers.py --check
```

Without `--check`, the tool adds the header to new files. `LicenseHeadersTest` applies the same
rules in every `./mvnw verify`. It also checks that each JAR's `META-INF/LICENSE` and
`META-INF/NOTICE` match the repository's, that the bundled Caffeine's license is the one Caffeine
ships, and that NOTICE names the Caffeine version the build bundles.

## Material under other licenses

- The OASIS test fixtures and the Maven wrapper keep their original notices. The
  interoperability catalog in `integration/catalog` and its tests are the Keytend project's own
  work, under Apache-2.0.
- The Krypton bootstrap keeps its upstream attribution and marks the changes made here.
- Each server used in the integration tests keeps its own license. Downloading or running one
  does not place it under Apache-2.0.

<p class="kt-doc-source" data-pagefind-ignore>Imported from <a href="https://github.com/keytend/keytend-kmip-java/blob/c5da4f1f409914da3790bbad79b37a6296585520/docs/licensing.md"><code>docs/licensing.md</code></a> in <span class="kt-nw">keytend/keytend-kmip-java</span> at commit <code>c5da4f1</code>.</p>
