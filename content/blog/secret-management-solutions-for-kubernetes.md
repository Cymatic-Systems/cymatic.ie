+++
title = "Managing Secrets in Kubernetes with GitOps"
description = "A practical comparison of secret management tools for Kubernetes GitOps workflows, covering SOPS, Sealed Secrets, External Secrets, and the Secrets Store CSI Driver."
authors = ["Declan Curran"]
date = 2026-05-13
draft = false

[taxonomies]
tags = ["kubernetes", "security", "gitops", "devops", "cloud-native"]

[extra]
author_id = "declan"
+++

## Introduction
Managing secrets in Kubernetes is one of the bigger challenges in running production workloads, particularly in GitOps-driven environments. A lot of teams still store secrets in plaintext files or commit them directly to Git, sometimes because they treat Git as a single source of truth for all configuration. Once a secret is committed, Git retains it in history; if the repository is ever compromised, that exposure is irreversible.

There are a few main approaches. Tools like [HashiCorp Vault](https://www.vaultproject.io/) or [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) store secrets externally and retrieve them at runtime. [SOPS](https://github.com/getsops/sops) and [Git-Crypt](https://github.com/AGWA/git-crypt) encrypt secrets before they reach the repository. Some teams avoid the problem entirely by embedding configuration inside Docker images, which trades one set of problems for another. This post covers the Git-native encryption tools and Kubernetes operators in more detail, comparing how they work and where each one fits.




## Understanding Kubernetes Secrets
Kubernetes provides a built-in `Secret` object for storing sensitive data as key-value pairs. Secrets can be consumed by pods in three ways: mounted as files, exposed as environment variables, or used as image pull credentials for private registries.

Each value in the `data` field is base64-encoded, which allows binary data to be stored but provides no confidentiality. Using a `Secret` over a `ConfigMap` does, however, enable stronger access control via RBAC; Kubernetes applies more restrictive default policies to Secrets, reducing the risk of accidental exposure.

Here's an example of a basic Kubernetes Secret:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
  namespace: default
type: Opaque
data:
  username: dXNlcm5hbWU=  # Base64 encoded "username"
  password: cGFzc3dvcmQ=  # Base64 encoded "password"
```

To use this secret as an environment variable, reference it by name and key in the `secretKeyRef` field:
```yaml
env:
  - name: DB_USERNAME
    valueFrom:
      secretKeyRef:
        name: my-secret
        key: username
```

To mount it as a file, use the `secret` volume type:
```yaml
volumeMounts:
  - name: secret-volume
    mountPath: "/etc/secret"
volumes:
  - name: secret-volume
    secret:
      secretName: my-secret
```

The `stringData` field can be used as an alternative to base64-encoding values manually:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
  namespace: default
type: Opaque
stringData:
  username: bob
  password: hunter2
```




## Comparing Secret Management Solutions
`Secret` objects work well for storing and consuming secrets inside a cluster. The problem is the deployment workflow: how do you version and deploy `Secret` resources alongside Helm charts or other manifests without exposing the content? Storing them directly in Git is not secure enough for most situations.

### Git-Crypt
[Git-Crypt](https://github.com/AGWA/git-crypt) encrypts files in a Git repository using GPG keys. Secret manifests are encrypted at rest in the repository and decrypted locally when needed. It largely predates tools like SOPS and lacks support for cloud KMS providers and GitOps tooling, but it served its purpose well at the time and is fairly straightforward to set up.

**Example usage:**
```bash
git-crypt unlock            # Decrypt all files using your GPG key
git-crypt add-gpg-user USER_ID  # Add a user with decryption access
```

Files to encrypt are specified in a `.gitattributes` file:
```bash
secretfile filter=git-crypt diff=git-crypt
*.key filter=git-crypt diff=git-crypt
secretdir/** filter=git-crypt diff=git-crypt
```

Git-Crypt has a few limitations:
- Encrypted files remain in Git history, making full removal difficult if a key is compromised.
- Decryption happens locally, leaving plaintext secrets on developer workstations.
- It does not integrate with GitOps tooling such as ArgoCD or FluxCD.

A common misuse is sharing a single GPG key across the whole organisation rather than adding per-user keys. Git-Crypt fully supports per-user keys, so this is a process problem rather than a tool limitation, but it defeats the purpose of access control entirely.

### SOPS
[SOPS](https://github.com/getsops/sops) also encrypts files in Git repositories, but offers a lot more flexibility than Git-Crypt. Encryption can use cloud KMS providers such as AWS KMS, GCP KMS, or Azure Key Vault, each with their own access controls. This allows access management to be tied into existing user management systems rather than relying on distributed key files.

`age` keys are also supported as a simpler alternative to GPG, and require no additional setup. When a new key is added, all files are re-encrypted to include it. A new key can only decrypt files encrypted after it was added; this is expected behaviour, not a limitation.

SOPS is configured with a `.sops.yaml` file that specifies which files to encrypt using a regex pattern, and which keys or providers to use. For `age` keys, only the public key is stored:
```yaml
creation_rules:
- path_regex: .*secret.*\.yaml
  key_groups:
  - age:
    - agej85xfXL0oR15WE0ppSB3dAJsofO6g3LR9cprXat0CJcEDiA1DRZ9v9qoFx0  # flux-cd
    - ageTHqYXetqoY88g7hvhQjkHWWq84EHt4AfRF5qMi6K4HmzSK4hj5Pu8BdMK0Q  # developer-a
```

Modifying encrypted files requires decryption first. This is done via the `sops` command, which opens the file in a text editor, or via editor extensions like `vscode-sops` for seamless in-editor decryption and re-encryption.

Files can also be encrypted and decrypted manually:
```bash
sops -e secrets.yaml > secrets.enc.yaml  # Encrypt
sops -d secrets.enc.yaml > secrets.yaml  # Decrypt
```

SOPS integrates well with [FluxCD](https://fluxcd.io/), which can decrypt secrets natively before syncing the repository with a cluster. It lacks native support in [ArgoCD](https://argo-cd.readthedocs.io/), making integration with ArgoCD-based workflows more involved.

Removing a key from `.sops.yaml` does not actually prevent that person from checking out an earlier commit and decrypting files using their old key. In practice this is a theoretical concern, as it requires someone to be actively malicious, but it does mean that true access revocation requires rotating the secrets themselves, not just removing the key. Using cloud KMS providers (AWS KMS, GCP KMS) instead of `age` keys sidesteps this, since access can be revoked at the IAM level without touching the repository.

### Sealed Secrets
[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) encrypts secrets using a cluster-specific public key, meaning only that Kubernetes cluster can decrypt them. This allows encrypted secrets to be stored safely in a Git repository.

Secrets are encrypted locally using the `kubeseal` tool, which produces a `SealedSecret` manifest containing only encrypted values. This manifest is then committed to Git or applied directly to the cluster. The Sealed Secrets controller running in the cluster decrypts it into a standard `Secret` object.

**Example: Encrypt a secret using `kubeseal`**
```bash
# Create a plain Secret manifest in secret.yaml
kubectl create secret generic db-secret -o yaml --dry-run=client --from-literal=password=super-secret > secret.yaml

# Create a SealedSecret manifest in sealed-secret.yaml based on the values in secret.yaml
# This uses the public key on the Kubernetes cluster for encryption
kubeseal -f secret.yaml -w sealed-secret.yaml
```

The file `sealed-secret.yaml` now contains the encrypted values that were in `secret.yaml`:
```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: db-secret
  namespace: mynamespace
spec:
  encryptedData:
    password: AgBxEXAMPLEENCRYPTEDDATAyK=
  template:
    metadata:
      labels:
        app: my-app
```

Because a `SealedSecret` is a standard Kubernetes manifest, it integrates naturally with GitOps tools like Flux, ArgoCD, and Kustomize. Unlike SOPS, which requires a plugin or controller integration, Sealed Secrets handles decryption entirely through its own controller. This also makes it a good fit for teams building in public, as encrypted manifests can sit openly in a public repository without exposing any secret values.

The main limitation is workflow. To update a secret, the plaintext value must be re-sealed using `kubeseal` before committing, and viewing the current value requires going through the cluster. There is no way to simply open a file and edit it. For teams that are comfortable with that constraint it works well; for those who'd rather just open a file and edit it, there are better options.

There is also one big risk: if the controller's private key is lost, every sealed secret in the repository becomes permanently unrecoverable. The controller supports [key backup and restore](https://github.com/bitnami-labs/sealed-secrets#how-can-i-do-a-backup-of-my-sealedsecrets), which should be configured before going to production.

### Secrets Store CSI Driver
The [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/) mounts secrets directly from external providers such as AWS Secrets Manager, HashiCorp Vault, and GCP Secret Manager as volumes in a pod. Unlike the other approaches covered so far, it does not create Kubernetes `Secret` objects at all. Secrets are retrieved from the provider at runtime and exist only in memory. This reduces the blast radius significantly — an attacker would need full access to a running pod to read a secret, rather than just access to the Kubernetes API.

#### Configuring a Secrets Store Provider
A `SecretProviderClass` resource specifies which provider to use and which secrets to mount.

**Example SecretProviderClass for AWS Secrets Manager:**
```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: aws-secrets
spec:
  provider: aws
  parameters:
    objects: |
      - objectName: "my-secret"
        objectType: "secretsmanager"
```

Other providers are supported, including Azure Key Vault, GCP Secret Manager, and HashiCorp Vault.

#### Mounting Secrets in a Pod
Once the `SecretProviderClass` is defined, a pod references it via a CSI volume:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-secrets
spec:
  serviceAccountName: secret-access-sa
  containers:
  - image: nginx
    name: nginx
    volumeMounts:
    - name: secrets-store
      mountPath: "/mnt/secrets"
      readOnly: true
  volumes:
  - name: secrets-store
    csi:
      driver: secrets-store.csi.k8s.io
      readOnly: true
      volumeAttributes:
        secretProviderClass: "aws-secrets"
```

Secrets are retrieved from AWS Secrets Manager and mounted at `/mnt/secrets`. The mounted files update in real time when the remote secret changes; some applications can detect this and reload without a restart.

Because secrets are never stored as Kubernetes objects, they cannot be referenced in standard manifests, making this solution less suitable for configuring third-party applications through Helm. The driver does provide [secret syncing functionality](https://secrets-store-csi-driver.sigs.k8s.io/topics/sync-as-kubernetes-secret) as an opt-in, which syncs the secret to a standard Kubernetes `Secret` object and keeps it up to date as the remote value changes.

### External Secrets
[External Secrets](https://external-secrets.io/) is a Kubernetes operator that synchronises secrets from external providers such as AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, and Azure Key Vault into standard Kubernetes `Secret` objects. Unlike the Secrets Store CSI Driver, which mounts secrets at runtime without persisting them, External Secrets creates and manages `Secret` objects directly. This makes it well-suited for GitOps workflows where secrets need to exist as Kubernetes resources.

#### Configuring a Secret Store
Retrieving secrets from an external provider requires a `SecretStore` or `ClusterSecretStore` resource. A `SecretStore` is namespaced; a `ClusterSecretStore` is cluster-wide and can be referenced by `ExternalSecret` resources across multiple namespaces.

**Example: Namespaced SecretStore for AWS Secrets Manager using IRSA**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secret-store
  namespace: default
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
```

This uses IAM Roles for Service Accounts (IRSA), allowing External Secrets to authenticate without storing AWS credentials in Kubernetes. The service account `external-secrets-sa` must be annotated with an IAM role that has permission to retrieve secrets from AWS Secrets Manager.

#### Fetching Secrets from an External Provider

The following example retrieves credentials from AWS Secrets Manager and creates a Kubernetes `Secret`:
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
  namespace: default
spec:
  secretStoreRef:
    name: aws-secret-store
    kind: SecretStore
  target:
    name: db-credentials-secret
  data:
  - secretKey: username
    remoteRef:
      key: production/database
      property: username
  - secretKey: password
    remoteRef:
      key: production/database
      property: password
```

When applied, the operator retrieves `production/database` from AWS Secrets Manager and creates a `Secret` named `db-credentials-secret`.

#### Secret Templating
External Secrets can generate structured configuration files with secrets injected inline, which is useful for applications that read config from a single file rather than individual environment variables.

A common pattern is to store a lightweight JSON secret in AWS Secrets Manager using a structured path, for example:

```
/app-name/service-name/db-credentials: {"db_username": "user", "db_password": "pass", "db_host": "localhost", "db_port": 5432}
```

An `ExternalSecret` can then template this into a full config file:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-config
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: my-secret-store
    kind: SecretStore
  target:
    name: db-config-secret
    template:
      engineVersion: v2
      data:
        application.properties: |
          db.url=jdbc://{{ .db_host }}:{{ .db_port }}/{{ .db_service }}
          db.user={{ .db_username }}
          db.pass={{ .db_password }}
  data:
  - secretKey: db_username
    remoteRef:
      key: /app-name/service-name/db-credentials
      property: db_username
  - secretKey: db_password
    remoteRef:
      key: /app-name/service-name/db-credentials
      property: db_password
  - secretKey: db_host
    remoteRef:
      key: /app-name/service-name/db-credentials
      property: db_host
  - secretKey: db_port
    remoteRef:
      key: /app-name/service-name/db-credentials
      property: db_port
```

The generated `Secret` contains a fully rendered `application.properties` file with secrets injected. The raw secret values in AWS Secrets Manager are never stored in Git.

**Binary data and double-encoding**

One thing to watch out for: if binary data is already base64-encoded before going into AWS Secrets Manager, External Secrets will encode it again when creating the Kubernetes `Secret`, since all `Secret` values in Kubernetes are base64-encoded by default. This ends up double-encoded. The fix is to set `decodingStrategy: Base64` on the relevant `remoteRef`, which tells External Secrets to decode the value before re-encoding it:

```yaml
  data:
  - secretKey: my-binary
    remoteRef:
      key: /app-name/service-name/binary-secret
      decodingStrategy: Base64
```

**Using templating with Helm**

Helm evaluates `{{ }}` expressions during rendering, which conflicts with External Secrets template syntax. Placeholders must be escaped to prevent Helm from processing them:
```
db.user={{ `{{ .db_username }}` }}
```




## Worthy Mentions

### Vals-Operator
[Vals-Operator](https://github.com/digitalis-io/vals-operator) works similarly to External Secrets, using `vals` to retrieve secrets from external providers and sync them into Kubernetes `Secret` objects. It also supports file templating for generating structured configuration files.

**Example: Managing secrets with Vals-Operator**
```yaml
apiVersion: digitalis.io/v1
kind: ValsSecret
metadata:
  name: my-secret
spec:
  data:
    username:
      ref: ref+vault://secret/database/username
    password:
      ref: ref+vault://secret/database/password
  template:
    config.yaml: |
      username: {{.username}}
      password: {{.password}}
  rollout:
    - kind: Deployment
      name: myapp
```

This example retrieves secrets from Vault and injects them into a Kubernetes `Secret` and a templated config file. The `rollout` field triggers a rolling update on the specified deployment when the secret changes.

### Helm Secrets
[Helm Secrets](https://github.com/jkroepke/helm-secrets) is a Helm plugin that decrypts values files at deploy time. It supports SOPS, GPG, and `age` for encryption, and can also pull values directly from AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault. This makes it possible to store encrypted values in Git and have them decrypted automatically when deploying through ArgoCD or other GitOps operators.

The main drawback is that decryption is tied to wherever Helm runs, which adds complexity on top of Helm's own deployment pipeline without giving much control over where it happens. Teams already using SOPS or an external provider directly tend to find it simpler to manage secrets outside of Helm rather than through it.

## Conclusion
Each approach covered here has a different set of trade-offs. The right choice depends on infrastructure, compliance requirements, and how much cluster access the team has.

- **Git-Crypt** served its purpose well when it was one of the few options available. For most teams today, SOPS or an external provider is a better starting point.
- **SOPS** is a solid choice for teams that want secrets in Git with proper encryption. It works particularly well with FluxCD, which supports it natively. The main thing to keep in mind is that true access revocation requires secret rotation, not just key removal; using a cloud KMS provider instead of `age` keys largely solves this.
- **Sealed Secrets** is a good fit for teams building in public, or those who want a fully Kubernetes-native workflow. The limitation is that secrets can only be read or updated through the cluster, which does not suit every team's workflow. Make sure to back up the controller key; losing it makes every sealed secret permanently unrecoverable.
- **Secrets Store CSI Driver** is the strongest option for regulated environments where secrets must never land in Kubernetes. The blast radius is minimal; an attacker needs full pod access to read anything.
- **External Secrets** is the most flexible option and works well as a default choice for teams already using a cloud secret manager. The templating feature is particularly useful for generating full config files from lightweight JSON secrets, avoiding the need to manage large structured secrets directly in the provider.
