+++
title = "Our Works"
template = "works.html"

[[extra.projects]]
id = "k8s-migration"
title = "Enterprise Kubernetes Cloud Migration"
tags = ["cloud", "kubernetes", "aws"]
summary = "Architected a dual-network AWS infrastructure to isolate development environments, using Transit Gateway and Kubernetes to enhance security and reduce deployment times."
featured = true
description = """
**The Challenge**: A multinational enterprise required a secure, isolated development ecosystem to stage changes safely. The system needed detailed connectivity to corporate networks for remote work-from-home access without compromising internal security.

**The Solution**: We architected, planned, and built a dual-network AWS infrastructure, creating 13 distinct development environments. We bridged these isolated networks with corporate domain systems via Transit Gateway and virtual appliances. To minimize operational costs, we utilized a shared Kubernetes cluster. We also integrated an authentication provider for secure access and reconfigured CI/CD pipelines, significantly improving deployment efficiency.
"""
year = "2024"
duration = "3 months"
customer = "Multinational Enterprise"
technologies_text = "AWS, Terraform, Transit Gateway, Kubernetes, Helm"
icons = ["aws.svg", "tf.svg", "kubernetes.svg", "helm.svg"]

[[extra.projects]]
id = "blockchain-thirdweb"
title = "Web3 Infrastructure Modernization"
tags = ["blockchain", "web3"]
summary = "Migrated Unity blockchain integration to Thirdweb, employing social logins and enabling support for Android and iOS mobile builds."
description = """
**The Challenge**: Migrating an existing Nethereum-based blockchain integration to a more versatile platform to support mobile builds and social logins.

**The Solution**: We refactored the integration to use the Thirdweb platform. This migration enabled support for Android and iOS builds and introduced social login features (Apple ID, Google), significantly improving accessibility for non-crypto native users.
"""
year = "2024"
duration = "2 months"
customer = "Game Studio (Netherlands)"
technologies_text = "Unity, Nethereum, Thirdweb, Hardhat"
icons = ["ethereum.svg", "unity.svg"]

[[extra.projects]]
id = "blockchain-matchmaking"
title = "On-Chain Matchmaking Logic"
tags = ["blockchain", "web3"]
summary = "Implemented a secure, skill-based matchmaking system on-chain using Solidity, featuring dynamic ELO ranking and a PvE fallback mode."
description = """
**The Challenge**: Creating a secure, skill-based matchmaking system completely on-chain to match players with similar skill levels for a Unity-based card game.

**The Solution**: We developed a matchmaking system using Solidity smart contracts. It assigned ELO rankings and included a dynamic leaderboard. To prevent long wait times, we implemented a time-based fallback mechanism that loosened matching rules, and a PvE mode for periods of low player activity.
"""
year = "2024"
duration = "1 month"
customer = "Game Studio (Netherlands)"
technologies_text = "Unity, Solidity, Hardhat"
icons = ["ethereum.svg"]

[[extra.projects]]
id = "blockchain-integration"
title = "Web3 Game Integration"
tags = ["blockchain", "web3"]
summary = "Integrated Ethereum blockchain interactions into a Unity WebGL game, pioneering a custom protocol for in-browser transaction signing via MetaMask."
description = """
**The Challenge**: Integrating blockchain interactions into a Unity WebGL game at a time when library support for in-browser Unity-blockchain communication was limited.

**The Solution**: We pioneered a custom protocol and Unity jslib to execute RPCs through browser-based wallets like MetaMask. This allowed the game to listen for blockchain events and pull transaction data directly. It was a groundbreaking integration for its time, setting a precedent for future Unity-browser blockchain projects.
"""
year = "2024"
duration = "6 weeks"
customer = "Game Studio (Netherlands)"
technologies_text = "Unity, WebGL, Nethereum, MetaMask"
icons = ["ethereum.svg", "unity.svg"]

[[extra.projects]]
id = "cloud-rebuild"
title = "Critical Infrastructure Recovery & Modernization"
tags = ["cloud", "kubernetes", "server"]
summary = "Rapidly rebuilt a crashed cloud infrastructure from scratch in two weeks, migrating from Docker/EC2 to Kubernetes and restoring over 30 services with zero data loss."
description = """
**The Challenge**: A critical incident rendered decade-old cloud infrastructure offline. The client needed an immediate recovery of the entire service layer with zero data loss, while simultaneously desiring a modernization of the stack.

**The Solution**: We executed a high-pressure rapid recovery operation, rebuilding the core systems in just two weeks. We migrated the stack from legacy Docker on EC2 to a modern Kubernetes architecture. We restored approximately 30~40 application services, along with monitoring and logging tools (OpenSearch, Grafana, Prometheus). We also integrated OpenID Connect for secure authentication and provided extensive training to the client's team on the new infrastructure.
"""
year = "2024"
duration = "2 months"
customer = "Multinational Enterprise"
technologies_text = "AWS, Terraform, Kubernetes, Helm, OpenID Connect, OpenSearch, Grafana, Prometheus, Fluentbit"
icons = ["aws.svg", "tf.svg", "kubernetes.svg", "helm.svg"]

[[extra.projects]]
id = "online-game-platform"
title = "Full-Stack Gaming Platform"
tags = ["game-dev", "backend", "server"]
summary = "Built a comprehensive metaverse platform with a low-memory backend and Svelte frontend, handling content creation and user-generated data."
description = """
**The Challenge**: Building a metaverse platform enabling users to easily create their own 3D virtual spaces with full multiplayer. The system needed to manage user-generated content (worlds, items, avatars, custom models, sound clips) and ensure seamless, secure integration between the game client and platform.

**The Solution**: We built a complete platform with a Spring-based backend and a Svelte web UI. We implemented a robust API server that the game client authenticates against, handling integration, content caching, and asset management. Users manage their custom content via the web UI, while our API server acts as the backbone, optimized to handle large volumes of data and secure interactions.
"""
year = "2023"
duration = "14 months"
customer = "Game Studio (Japan)"
technologies_text = "Kotlin, Spring, Svelte"
icons = ["kotlin.svg"]

[[extra.projects]]
id = "ai-plant-system"
title = "Ecosystem Simulation AI"
tags = ["game-dev", "ai"]
summary = "Developed an advanced AI system for nurturing in-game flora, featuring cheat-proof server-side logic and accurate terrain navigation."
description = """
**The Challenge**: Developing an advanced AI system for nurturing in-game flora (trees, flowers) that operates realistically within a dynamic game world while being resilient to player exploitation and cheating.

**The Solution**: We created AI workers that navigate a custom terrain engine to generate and cultivate elements. We restricted the evaluation of AI logic to a controlled server-side environment to ensure the system remained cheat-proof. The resulting framework was versatile and adaptive, allowing for the easy introduction of new worker types and in-game objects.
"""
year = "2023"
duration = "10 months"
customer = "Game Studio (Japan)"
technologies_text = "C#, Unity, Custom Terrain Engine, Navmesh, Kotlin"
icons = ["unity.svg", "kotlin.svg"]

[[extra.projects]]
id = "online-game-infra"
title = "Global Game Server Orchestration"
tags = ["cloud", "game-dev", "kubernetes"]
summary = "Designed and deployed GCP cloud infrastructure for an online game, utilizing Terraform, Helm, and custom Kubernetes operators for game server management."
description = """
**The Challenge**: Managing stateful game servers on GCP (GKE) that require public hostports, deeper internal matchmaking integration, and cost-effective auto-scaling that avoids disconnecting active players.

**The Solution**: We developed a custom Kubernetes operator to open hostports and integrate directly with internal matchmaking. To optimize costs and experience, we introduced custom auto-scaling metrics. Pod disruption budgets were tied to player counts to prevent unwanted disconnections, while matchmaking metrics (e.g., waiting players vs. available slots) determined whether to spin up a new server or reuse an existing one.
"""
year = "2022"
duration = "5 months"
customer = "Game Studio (Japan)"
technologies_text = "GCP, Kubernetes, GitLab, Terraform, Prometheus, Grafana, Helm"
icons = ["gcp.svg", "tf.svg", "kubernetes.svg", "helm.svg"]

[[extra.projects]]
id = "unity-video-chat"
title = "Scalable WebRTC Video/Voice Platform"
tags = ["game-dev", "video"]
summary = "Developed a scalable WebRTC video chat system in Unity, evolving from P2P to an SFU architecture to support massive concurrency and broadcasting."
featured = true
description = """
**The Challenge**: Building a reliable video/voice chat solution in Unity that seamlessly integrates with the game world, showing video above avatars and using positional audio, while scaling from P2P to broadcasting.

**The Solution**: We implemented a custom signal protocol to switch dynamically between P2P (video chat) and SFU (streaming) modes. We integrated this fully into the game client, displaying player video directly above their in-game avatars and utilizing in-game positional audio for voice. To scale, we integrated a Selective Forwarding Unit (SFU) to handle thousands of media streams with minimal latency.
"""
year = "2022"
duration = "6 months"
customer = "Game Studio (Japan)"
technologies_text = "C#, Unity, WebRTC, Coturn"
icons = ["unity.svg", "webrtc.svg"]

[[extra.projects]]
id = "terrain-engine"
title = "High-Performance Voxel Terrain Engine"
tags = ["game-dev", "graphics"]
summary = "Engineered a performant terrain engine with CSG mesh generation and real-time multiplayer synchronisation, including a water system prototype."
featured = true
description = """
**The Challenge**: Developing a highly performant terrain engine with real-time multiplayer synchronisation, capable of supporting live terrain modifications and advanced geometry creation.

**The Solution**: We engineered a custom voxel-based mesh generation algorithm backed by Constructive Solid Geometry (CSG). We built in-game map editing tools for real-time collaboration, plus a separate map editor for creating more advanced geometry. All changes are synchronized instantly across multiplayer clients and persisted through play sessions, enabling a persistent, collaborative world.
"""
year = "2022"
duration = "6 months"
customer = "Game Studio (Japan)"
technologies_text = "C#, Unity, Unity Shader Graph"
icons = ["unity.svg"]

[[extra.projects]]
id = "past-experience"
title = "Founding Team Deep Tech Roots"
summary = "Our founding team brings a wealth of expertise in cloud, IoT, AI, research, and game development from previous roles at major tech companies."
description = """
Before forming our company, we engineered core systems for major tech giants and successful startups. We have:

*   **Cloud Architecture**: Architected a SaaS solution for dedicated game server clusters, designing the cloud infrastructure and cluster management from the ground up.
*   **Game Networking**: Built core networking technology that has been used in high-profile titles by major game publishers.
*   **High-Volume Data**: Led critical migrations to **Apache Kafka** to enable parallel processing for massive volumes of IoT device events.
*   **Blockchain Security**: Successfully identified vulnerabilities in multiple blockchain protocols through bug bounties on **Immunefi**.
*   **ML Research**: Developed prototype LSTM networks for audio-based classification and co-authored research on classification techniques.

These diverse experiences have equipped us with a comprehensive skill set, enabling us to tackle complex challenges.
"""
year = "< 2021"
duration = "Lifetime"
customer = "Various"
technologies_text = "IoT, AI, Kernel Dev, Research"
icons = []

+++

Below is a selection of notable projects where we architected and developed solutions for our clients. These examples illustrate our expertise in cloud infrastructure, blockchain integration, game development, and secure system design, showcasing our commitment to modernising systems and delivering innovative, sustainable solutions.
