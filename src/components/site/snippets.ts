// Code samples quoted verbatim from the product READMEs.

/** keytend-kmip-java README.md, "Quickstart" (tested as Quickstart.java). The
 * orderJson line is split after the string so the sample fits its column. */
export const javaQuickstart = `import dev.keytend.kmip.kms.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

char[] password = System.getenv("KMS_CLIENT_PASSWORD").toCharArray();
KmsConfig config = KmsConfig.builder()
    .endpoints("kms1.example.com:5696", "kms2.example.com:5696")
    .clientIdentityKeyStore(Path.of("client.p12"), password)
    .trustPem(Path.of("ca.pem"))
    .build();
byte[] orderJson = "{\\"id\\":1042,\\"total\\":\\"19.99\\"}"
    .getBytes(StandardCharsets.UTF_8);

try (Kms kms = Kms.connect(config)) {
  kms.keys().createAes(256).named("orders-kek")
      .usages(KeyUsage.ENCRYPT, KeyUsage.DECRYPT)
      .findOrCreate();
  CurrentKey kek = kms.keys().current("orders-kek");
  byte[] orderId = "order-1042".getBytes(StandardCharsets.UTF_8);
  byte[] sealed = kek.seal(orderJson, orderId);
  byte[] opened = kek.open(sealed, orderId);
}`;

/** keytend-kmip-java README.md, "Install". */
/** Check out the release tag, as the README says. */
export const javaBuild = `git checkout v0.10.0-rc.1
./mvnw install`;

export const javaDependency = `<dependency>
  <groupId>dev.keytend</groupId>
  <artifactId>keytend-kmip</artifactId>
  <version>0.10.0-rc.1</version>
</dependency>`;

export const javaTestingDependency = `<dependency>
  <groupId>dev.keytend</groupId>
  <artifactId>keytend-kmip-testing</artifactId>
  <version>0.10.0-rc.1</version>
  <scope>test</scope>
</dependency>`;

export const javaTestingGradle = `// Gradle
testImplementation("dev.keytend:keytend-kmip-testing:0.10.0-rc.1")`;

/** keytend-kmip-java SECURITY.md, "Verifying release artifacts". */
export const javaVerify = `mkdir keytend-kmip-0.10.0-rc.1-release && cd keytend-kmip-0.10.0-rc.1-release
BASE=https://github.com/keytend/keytend-kmip-java/releases/download/v0.10.0-rc.1
for f in keytend-kmip-0.10.0-rc.1.zip keytend-kmip-0.10.0-rc.1.zip.asc keytend-kmip-0.10.0-rc.1.zip.sha256 \
    SHA256SUMS SHA256SUMS.asc; do
  curl -fsSLO "$BASE/$f"
done
gpg --keyserver keys.openpgp.org --recv-keys 3A84912AFBE7D2B04EBA2A8A51E65DD49C6F987F
gpg --verify keytend-kmip-0.10.0-rc.1.zip.asc keytend-kmip-0.10.0-rc.1.zip   # "Good signature", this fingerprint
gpg --verify SHA256SUMS.asc SHA256SUMS
sha256sum -c keytend-kmip-0.10.0-rc.1.zip.sha256
unzip -q keytend-kmip-0.10.0-rc.1.zip
sha256sum -c --ignore-missing SHA256SUMS   # the ZIP, its contents, and what else you downloaded`;

/** keytend-kmip-server README.md, "Quick start". */
export const serverClone = `git clone https://github.com/keytend/keytend-kmip-server
cd keytend-kmip-server`;

export const serverBuild = `docker build -t localhost/keytend-kmip-server:dev .`;

export const serverVerify = `scripts/verify_release.sh 0.10.0-rc.1 &&
  export IMAGE=localhost/keytend-kmip-server:0.10.0-rc.1`;

export const serverStart = `scripts/quick-start.sh`;
export const serverStartOutput = `ready
next (bash or zsh): . examples/https/kmip.sh && kmip create.json | field ResultStatus`;

export const serverRequest = `. examples/https/kmip.sh && kmip create.json | field ResultStatus`;
export const serverRequestOutput = `Success`;

/** The whole README quick start as one shell session, outputs as comments. */
export const serverQuickstart = `git clone https://github.com/keytend/keytend-kmip-server
cd keytend-kmip-server

# Build the image (a few minutes, about 1.5 GB of disk)
docker build -t localhost/keytend-kmip-server:dev .
# Or load the signed 0.10.0-rc.1 release (needs Python 3.12 or later and gpg):
# scripts/verify_release.sh 0.10.0-rc.1 &&
#   export IMAGE=localhost/keytend-kmip-server:0.10.0-rc.1

scripts/quick-start.sh
# ready

. examples/https/kmip.sh && kmip create.json | field ResultStatus
# Success`;

/** keytend-kmip-server examples/https/create.json: a KMIP 2.1 Create over HTTPS JSON. */
export const serverCreateJson = `{"tag": "RequestMessage", "value": [
  {"tag": "RequestHeader", "value": [
    {"tag": "ProtocolVersion", "value": [
      {"tag": "ProtocolVersionMajor", "type": "Integer", "value": 2},
      {"tag": "ProtocolVersionMinor", "type": "Integer", "value": 1}]},
    {"tag": "BatchCount", "type": "Integer", "value": 1}]},
  {"tag": "BatchItem", "value": [
    {"tag": "Operation", "type": "Enumeration", "value": "Create"},
    {"tag": "RequestPayload", "value": [
      {"tag": "ObjectType", "type": "Enumeration", "value": "SymmetricKey"},
      {"tag": "Attributes", "value": [
        {"tag": "CryptographicAlgorithm", "type": "Enumeration", "value": "AES"},
        {"tag": "CryptographicLength", "type": "Integer", "value": 256},
        {"tag": "CryptographicUsageMask", "type": "Integer", "value": "Encrypt|Decrypt"}]}]}]}]}`;

/** keytend-kmip-server docs/release-signing.md. */
export const serverVerifyOutput = `Verified OK
pgp_verify: good signature by the Keytend release key: /tmp/tmp.Xa1b2C3d4E/release/SHA256SUMS
…
verified and loaded localhost/keytend-kmip-server:0.10.0-rc.1
release files: /tmp/tmp.Xa1b2C3d4E/release
next: IMAGE=localhost/keytend-kmip-server:0.10.0-rc.1 scripts/quick-start.sh`;

export const serverDownload = `mkdir keytend-kmip-server-0.10.0-rc.1 && cd keytend-kmip-server-0.10.0-rc.1
BASE=https://github.com/keytend/keytend-kmip-server/releases/download/v0.10.0-rc.1
for f in SHA256SUMS SHA256SUMS.asc SHA256SUMS.sigstore.json cosign.pub \
    keytend-kmip-server-0.10.0-rc.1-signed-release.tar \
    keytend-kmip-server-0.10.0-rc.1-signed-release.tar.sha256; do
  curl -fsSLO "$BASE/$f"
done`;
