+++
title = "Getting Secret Management Right in Kubernetes"
description = "A practical look at secret management tools for Kubernetes, covering SOPS, Sealed Secrets, External Secrets, and the Secrets Store CSI Driver."
authors = ["Declan Curran"]
date = 2026-05-14
draft = false

[taxonomies]
tags = ["kubernetes", "security", "devops", "cloud-native"]

[extra]
author_id = "declan"
+++

One of the biggest challenges in migrating to Kubernetes is getting secret management right. The number of teams I've seen committing plaintext secrets to Git, or baking them into Docker images, is genuinely surprising. Most of the time it's simply because they don't have a better solution, or it's just what they've always done.

There are a few problems with this. From a security standpoint, you want to limit the blast radius if a secret is ever leaked. From a responsibility standpoint, access should be restricted to a small number of people, typically the infra admins actually provisioning databases and external services, not every developer on the team.

The subtler issue is separation of concerns: what you want in a repository is the application and maybe some defaults, not environment-specific config or secrets. An application should be reusable, deployable into any environment, with the environment supplying the secrets.

If you're running on Kubernetes, there are no excuses; there are plenty of mature solutions available. There are a few I've come across over the past few years - I'll get into them below.


## What exactly is a Secret resource?
Kubernetes `Secret` objects are the underlying primitive that most secret management solutions build on, so it's worth understanding how they work. The tools I cover in this post largely exist to generate them from a secure source rather than having you define them directly.

The issue with managing `Secret` manifests by hand is that their values are only base64-encoded, not encrypted. Committing them to a repository, or embedding them in Helm charts, is essentially storing plaintext secrets in your codebase. The examples below are useful for understanding the format, but a hardcoded `Secret` manifest should never end up in version control.

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

Secrets can be consumed by pods as mounted files or environment variables. Here's an example using the `secret` volume type:
```yaml
volumeMounts:
  - name: secret-volume
    mountPath: "/etc/secret"
volumes:
  - name: secret-volume
    secret:
      secretName: my-secret
```





## The Tools Worth Knowing
`Secret` objects are fine; pushing them manually (without checking them into a git repo) is one way to manage secrets and it works. It's just not maintainable at scale, and it's not something a team can collaborate on cleanly. What you really want is a solution that automates the process, keeps secrets out of your repository directly, and can be managed consistently across environments. Several tools exist that will either encrypt secret manifests before they reach Git, or generate them at runtime from a secure external source.

### Git-Crypt
[Git-Crypt](https://github.com/AGWA/git-crypt) is not exactly new, but it works, and it has for a long time. It uses GPG keys to encrypt and decrypt files directly in a Git repository, not just Kubernetes secrets but anything. That means you can commit encrypted secret manifests alongside everything else, and they'll be decrypted locally when you unlock the repo with your key.

It doesn't integrate well with GitOps tooling like ArgoCD or FluxCD. It predates a lot of that ecosystem, but it has survived for a long time, and that counts for something.

The most common mistake I see is teams sharing a single GPG key across the whole organisation. I've seen a single key shared between around thirty people, at which point access control is effectively meaningless. Git-Crypt fully supports per-user keys, so this is a process problem rather than a tool limitation.

The other issue is key leakage. If a key is compromised, you can't simply revoke it and re-encrypt. Every commit in history that was encrypted with the old key is still accessible to anyone who has it. The only real remediation is rotating all of the affected secrets.

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

### SOPS
If you do need to keep secrets in Git, [SOPS](https://github.com/getsops/sops) is the modern way to do it. Like Git-Crypt, it stores secrets encrypted in the repository, so you can keep your existing workflow while moving to a much more secure approach.

SOPS supports `age` keys as a simpler alternative to GPG, but the real benefit comes when you integrate a cloud KMS provider. Hook it up to AWS KMS, GCP KMS, or Azure Key Vault, and SOPS will encrypt and decrypt using your existing identity (an IAM user or role, for example) rather than a key sitting on someone's machine.

KMS might feel like overkill for a small team, and it is. Starting with `age` keys and upgrading later is a perfectly reasonable approach. I've had good success running SOPS with FluxCD and `age` keys in a small team - it keeps things simple without introducing a lot of complexity, and it's a solid starting point for a startup that wants proper secret management without the overhead.

SOPS is configured with a `.sops.yaml` file that specifies which files to encrypt using a regex pattern, and which keys or providers to use. For `age` keys, only the public key is needed:
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

FluxCD integration is one of SOPS's strongest points. You can give the FluxCD controller an `age` key (like the example above) and it will handle decryption automatically as part of the sync. A particularly useful pattern is encrypting sensitive values in your HelmRelease manifests directly; FluxCD decrypts them before rendering, so you can reference those values in Secret manifest templates inside your Helm charts without ever exposing them in the repository.

One thing that catches people out: similar to Git-Crypt, removing an `age` key from `.sops.yaml` does not revoke access. Anyone who had access before can still check out an earlier commit and decrypt with their old key. With `age` keys the only fix is rotating the secrets themselves. With a cloud KMS provider you revoke IAM access and they lose the ability to decrypt anything, including historical commits.

### Sealed Secrets
[Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) takes a very different approach compared to the last two. Rather than encrypting with a key you manage, it runs a controller in the cluster that manages its own key pair, keeping the private key inside the cluster itself. Only that cluster can ever decrypt your secrets, which means the encrypted manifests are safe to commit anywhere.

You create a plain `Secret` locally and seal it with `kubeseal` (Sealed Secret's CLI tool):

```bash
kubectl create secret generic db-secret \
  --dry-run=client -o yaml \
  --from-literal=password=hunter2 > secret.yaml

kubeseal -f secret.yaml -w sealed-secret.yaml
```

The resulting `sealed-secret.yaml` looks something like this:
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

The output is a `SealedSecret` manifest, a custom resource managed by the Sealed Secrets controller, which is completely safe to commit into any repository, private or even public. Once a `SealedSecret` is pushed to the cluster, the controller decrypts it using its private key and creates a standard `Secret` object, just like any other. Since it's just a standard YAML manifest based on a custom resource, it works with any tooling: Helm, ArgoCD, FluxCD, Kustomize, whatever you're using. This makes it a good fit for teams building in public, or those working in environments without access to external services like KMS or a cloud secrets manager.

Honestly, I haven't used Sealed Secrets in anger myself, I was put off by two things that I hit pretty early on while evaluating it.

The first was the workflow. There's no way to just open a file and edit a value. Updating a secret means connecting to the cluster, decrypting, making the change, re-sealing, and committing. Reading the current value of a secret means going through the cluster too. For a team collaborating across environments that gets painful fast. On top of that, sealed secrets can't be shared across clusters; each cluster has its own key pair, so every environment needs its own sealed manifests.

The second was key loss. If the controller's private key is gone (say you accidentally recreate the cluster), every sealed secret in the repository is permanently unrecoverable. That felt like too much risk to take on without a solid backup process in place.

### Secrets Store CSI Driver
The [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/) is the least GitOps-related solution here, but in my opinion, the most secure. Rather than having secrets stored encrypted in various repos, you keep them in one central place: a secret manager. CSI stands for Container Storage Interface, and that's exactly what this does: it mounts secrets as files directly into your pod, pulling them from your provider at runtime. HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, and others are supported.

The key advantage over everything else here is that no `Secret` resource exists in your Kubernetes cluster at all. The secrets never hit etcd (the database where Kubernetes manifests live). An attacker with cluster access would need full access to a running pod to read anything, which is a meaningfully smaller blast radius.

A `SecretProviderClass` resource specifies which provider to use and which secrets to mount:
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

A pod references the `SecretProviderClass` via a CSI volume:
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

The mounted files update in real time when the remote secret changes, and applications that watch for file changes can pick this up without a restart.

The trade-off is flexibility. Because no `Secret` objects are created, you can't reference secrets the usual way in manifests, which makes it awkward for third-party applications deployed via Helm. There is an opt-in [secret syncing feature](https://secrets-store-csi-driver.sigs.k8s.io/topics/sync-as-kubernetes-secret) that creates a `Secret` object, but at that point you're somewhat defeating the purpose. For most teams, External Secrets is a simpler path to the same external provider integration.

### External Secrets
[External Secrets](https://external-secrets.io/) is probably my go-to recommendation for most teams. It's a Kubernetes operator that pulls secrets from an external provider and syncs them into standard `Secret` objects. AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, Azure Key Vault, all supported. Because it creates real `Secret` objects, everything works as normal: Helm, ArgoCD, FluxCD, no special integration needed. It's not the right fit for overly regulated environments where secrets can't touch the Kubernetes API at all, but for most teams it hits the sweet spot.

You configure a `SecretStore` (or `ClusterSecretStore` for cluster-wide access) to tell the operator how to authenticate with your provider. I recommend using a service account connected to a cloud identity rather than storing credentials in the cluster directly (this example uses IRSA):
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

Then define `ExternalSecret` resources to specify which secrets to fetch and what to call them in the cluster. The operator keeps them in sync, so if a value changes in your secret manager it gets updated automatically:
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
  namespace: default
spec:
  # SecretStore to use
  secretStoreRef:
    name: aws-secret-store  
    kind: SecretStore
  target:
    # Name of the Secret to create in Kubernetes
    name: db-credentials-secret  
  data:
  - secretKey: dbuser  # Key in the generated Kubernetes Secret
    remoteRef:
      key: /production/database  # Secret name in AWS Secrets Manager
      property: username  # Property within the secret
  - secretKey: dbpass  # Key in the generated Kubernetes Secret
    remoteRef:
      key: /production/database  # Secret name in AWS Secrets Manager
      property: password  # Property within the secret
```

When applied, the operator creates a `Secret` named `db-credentials-secret` in the cluster:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials-secret
  namespace: default
type: Opaque
data:
  dbuser: dXNlcm5hbWU=  # base64("the value of 'username' from /production/database)
  dbpass: cGFzc3dvcmQ=  # base64("the value of 'password' from /production/database)
```

The templating feature is where it gets really useful. Rather than storing large structured secrets in your provider, you can store lightweight JSON blobs and have External Secrets render them into full config files with secrets injected inline. I use this pattern a lot for applications that read config from a single file, for example given a secret in AWS Secrets Manager like:

```
/app-name/service-name/db-credentials: {"db_username": "user", "db_password": "pass", "db_host": "localhost", "db_port": 5432}
```

We could set up an ExternalSecret template in our Helm chart like this:
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

The generated `Secret` contains a fully rendered `application.properties` file with secrets injected. The raw values in your secret manager are never stored in Git or the Helm templates.

A couple of gotchas worth knowing. If binary data is already base64-encoded before going into your secret manager, External Secrets will encode it again when creating the Kubernetes `Secret`, since all `Secret` values are base64-encoded by default. That ends up double-encoded. Fix it by setting `decodingStrategy: Base64` on the relevant `remoteRef`:
```yaml
  data:
  - secretKey: my-binary
    remoteRef:
      key: /app-name/service-name/binary-secret
      decodingStrategy: Base64
```

And if you're using the templating feature inside a Helm chart, Helm will try to evaluate the `{{ }}` placeholders during rendering. Escape them to prevent that:
```
db.user={{ `{{ .db_username }}` }}
```




## Also Worth a Look

### Vals-Operator
[Vals-Operator](https://github.com/digitalis-io/vals-operator) is similar to External Secrets; it syncs secrets from external providers into Kubernetes `Secret` objects and supports file templating. The one thing that stands out is the `rollout` field, which triggers a rolling update on a specified deployment when a secret value changes. It's a neat feature that External Secrets doesn't have natively. It's less widely adopted than External Secrets, so the ecosystem and documentation aren't as mature, but worth knowing about.

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

### Helm Secrets
[Helm Secrets](https://github.com/jkroepke/helm-secrets) is a Helm plugin that decrypts values files at deploy time, using SOPS, GPG, or `age`. It can also pull values directly from external providers. The idea is that you can store encrypted values alongside your Helm charts and have them decrypted automatically during deployment.

In practice I find it adds more complexity than it saves. Decryption is tied to wherever Helm runs, which makes it awkward to reason about in a GitOps pipeline. If you're already using SOPS or an external provider, managing secrets outside of Helm is simpler than routing them through it.

## So, Which One Should I Use?
All of these tools solve the same core problem in different ways, and the right choice depends on your team and environment.

If you're a small team or startup, SOPS with FluxCD and `age` keys is a great starting point. It's simple to set up, keeps secrets in Git where everything else already lives, and you can upgrade to KMS later when the team grows.

For most other teams, External Secrets is my default recommendation. If you're already using a cloud secret manager, it slots in cleanly and plays well with any GitOps tooling you're running.

If you're in a regulated environment where secrets can't touch the Kubernetes API at all, the Secrets Store CSI Driver is the right call. The blast radius is as small as it gets.

Sealed Secrets is worth knowing about, particularly if you're building in public or don't have access to external services, but the workflow friction and the key loss risk put me off recommending it as a default.

Git-Crypt still works and has its place, but if you're starting fresh there are better options.

Just please don't put plaintext secrets in Git.
