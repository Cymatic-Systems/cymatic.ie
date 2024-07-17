+++
title = "OUR WORKS"
template = "works.html"
+++

Below is a selection of notable projects where we architected and developed solutions for our clients. These examples illustrate our expertise in cloud infrastructure, blockchain integration, game development, and secure system design, showcasing our commitment to modernising systems and delivering innovative, sustainable solutions.

## [Cloud Migration to Kubernetes](@/works.md#k8s-migration) {#k8s-migration}
Our team was engaged to migrate a client's development environments to Kubernetes, enabling them to stage changes before pushing to production. This migration had several key requirements, including connectivity to their corporate network and secure access for their development teams, including remote work-from-home access.

We architected, planned, and built a new network in AWS specifically for the development environments, and an additional isolated network for connectivity to their corporate domain systems. To ensure seamless and secure integration, we connected the new networks to their corporate systems using Transit Gateway and a virtual appliance running in EC2. This setup minimised any risk to internal systems from connecting developer machines, and enabled traffic to be filtered by network ACLs as needed.

Security was a major consideration throughout the process. We integrated an authentication provider to provide existing users with secure access to shared debugging tools. The deployment included infrastructure for a total of 13 development environments, utilising a shared Kubernetes cluster to reduce running costs, and also including the deployment of several Windows VMs and database servers.

We also reconfigured the CI and deployment pipelines to align with the new environments, resulting in a notable improvement in deployment efficiency and a reduction in overall deployment time.

**Duration**: 3 months  
**Customer**: Multinational Enterprise  
**Technologies**: AWS, Terraform, Transit Gateway, Kubernetes, Helm

![](/img/aws.svg) • ![](/img/tf.svg) • ![](/img/kubernetes.svg) • ![](/img/helm.svg)

## [Cloud Infrastructure Rebuild](@/works.md#cloud-rebuild) {#cloud-rebuild}
After an incident rendered decade-old cloud infrastructure offline, we were tasked with rebuilding the services layer on top of a new network. Given the critical nature of the situation, a swift and efficient response was paramount.

We planned and executed a rapid recovery, simultaneously migrating from Docker on EC2 to Kubernetes with the client's agreement to ensure a more modern and robust infrastructure. To facilitate a seamless transition, we adapted existing deployment tools to use the new platform, eliminating the need for workflow changes. 

Within just two weeks, core systems, including approximately 30~40 application services, operators, monitoring, and logging tools, were operational and handling production traffic. The remaining non-essential services were brought online shortly thereafter, including renewing the monitoring and alerting systems to include Kubernetes metrics. We also integrated OpenID Connect authentication on Kubernetes, enabling the use of existing user authentication systems.

To ensure the customer's development and DevOps teams were well-prepared for the new infrastructure, we collaborated closely with their engineers for Kubernetes upskilling, conducted multiple training sessions with the teams, and prepared extensive documentation on the Kubernetes setup, troubleshooting, and operational guides.

**Duration**: 2 months  
**Customer**: Multinational Enterprise  
**Technologies**: AWS, Terraform, Kubernetes, Helm, OpenID Connect, OpenSearch, Grafana, Prometheus, Fluentbit

![](/img/aws.svg) • ![](/img/tf.svg) • ![](/img/kubernetes.svg) • ![](/img/helm.svg)

## [Real-time Synchronised Terrain Engine in Unity](@/works.md#terrain-engine) {#terrain-engine}
This project involved the development of a highly performant terrain engine with real-time synchronisation capabilities for multiplayer environments. Over a period of six months, we worked on researching and prototyping several terrain mesh generation algorithms, eventually implementing a mesh generation algorithm backed by constructive solid geometry.

The implementation of the terrain engine also included graphics shader programming to display various terrain textures and an in-game map editor that allowed users to modify terrain with real-time feedback. Maintaining high performance was crucial to ensuring smooth real-time terrain modifications. Real-time multiplayer synchronisation was also added, allowing all players to see real-time updates to the terrain.

Finally, we prototyped the addition of a water system to the terrain engine, using several different algorithms. After reviewing the prototypes with the client, we implemented the water system that provided the best visual appeal, integrating it into the existing game systems.

**Duration**: 6 months  
**Customer**: Game Studio based in Japan  
**Technologies**: C#, Unity, Unity Shader Graph

![](/img/unity.svg)

## [Video Chat System in Unity](@/works.md#unity-video-chat) {#unity-video-chat}
We developed a cutting-edge video chat system in Unity, leveraging WebRTC technology. Over the course of six months, our team went through an extensive research and prototyping phase to build a reliable video chat solution that met the client's requirements for utilising the users’ webcams and microphones for real-time communication, and finally ended up with an innovative platform that could handle both video chat sessions and live streaming at scale.

Our initial implementation consisted of a P2P video chat system utilising WebRTC, with audio and video tied to the in-game player objects of each player. To ensure consistent and reliable connection negotiation between clients, we integrated and deployed coturn, an industry-standard STUN and TURN server. Given the constraints of client-side bandwidth, we evaluated various audio and video codecs and bitrates in order to optimise the system and manage the number of concurrent P2P connections effectively.

To scale the system and boost performance, we integrated a Selective Forwarding Unit (SFU), which allowed us to efficiently manage thousands of media streams and enabled the client to handle a larger number of simultaneous media streams while minimising network load.

Advanced capabilities provided by the SFU server enabled us to implement a high-performance streaming mode, which would allow individual users to broadcast their audio and video to tens of thousands of viewers with minimal latency. This involved deploying large-scale distributed systems as well as implementing sophisticated load balancing strategies at the application layer, ensuring both high scalability and reliability.

To ensure the system’s robustness, we developed custom bots for rigorous testing of the audio/video streaming capabilities. These tests helped us to assess load capacity, operational costs, and the maximum number of sessions per server, enabling us to fine-tune the load-balancing and auto-scaling strategies for peak performance.

**Duration**: 6 months  
**Customer**: Game Studio based in Japan  
**Technologies**: C#, Unity, WebRTC, Coturn

![](/img/unity.svg) • ![](/img/webrtc.svg)

## [AI System for In-Game Plant Nurturing](@/works.md#ai-plant-system) {#ai-plant-system}
In this project, our team was engaged to develop an advanced AI system for nurturing and managing in-game flora, such as trees, flowers, and other natural elements. This system involved creating AI workers responsible for generating and cultivating these elements within a dynamic game world.

The AI workers were designed to operate seamlessly within the game environment, displaying realistic behaviours and navigating through a custom terrain engine. This integration ensured that the AI entities performed their tasks consistently and within the constraints of the game’s physical landscape.

A key challenge was ensuring the system’s resilience against exploitation, as players could collect in-game objects created by the AI to earn rewards. To address this, we restricted the evaluation of the AI logic to a controlled environment to ensure the system remained secure and cheat-proof.

In the end, we developed a versatile and adaptive AI framework with the capability of easily introducing new worker types, actions, and in-game objects. This design made the system highly extensible and well-prepared for future updates.

**Duration**: 10 months  
**Customer**: Game Studio based in Japan  
**Technologies**: C#, Unity, Custom Terrain Engine, Navmesh, Kotlin

![](/img/unity.svg) • ![](/img/kotlin.svg)

## [Cloud Infrastructure for Online Game](@/works.md#online-game-infra) {#online-game-infra}
This project involved designing, deploying, and maintaining cloud infrastructure for an online multiplayer game on Google Cloud Platform (GCP). Cloud infrastructure resources were managed with Terraform for consistency and reproducibility, and service deployments were deployed using Helm, ensuring smooth operations across multiple environments including testing, staging, and production.

As a part of this, we designed a consistent release versioning and artifact storage system for all software components in the project, complete with build pipelines and documentation on best practices for branching and release numbering. Some of the key components deployed included stateful game servers, chat servers, API servers, a web frontend, and several databases.

To support the game server’s requirements, we developed several custom Kubernetes operators and deployed them as part of the clusters. These custom operators were necessary to effectively manage externally accessible game servers, with server selection handled by a separate matchmaking system rather than traditional load balancing. Additionally, auto-scaling for the stateful game server was included, requiring custom management to ensure seamless operation for players.

A monitoring and alerting suite was set up using Prometheus and Grafana to track system metrics and KPIs, along with centralised logging for effective operations, debugging and incident management.

**Duration**: 5 months  
**Customer**: Game Studio based in Japan  
**Technologies**: GCP, Kubernetes, GitLab, Terraform, Prometheus, Grafana, Helm

![](/img/gcp.svg) • ![](/img/tf.svg) • ![](/img/kubernetes.svg) • ![](/img/helm.svg)

## [Online Game Platform and Frontend](@/works.md#online-game-platform) {#online-game-platform}
We built a platform from the ground up with an integrated API server and web frontend. The backend was developed to manage key functionalities such as content creation and customisation, including the storage and retrieval of user-generated data. To ensure efficient performance, we optimised the system to operate effectively under low memory constraints, handling large data volumes as needed.

A significant challenge was integrating user-generated content while ensuring system stability. We had to address performance issues related to managing large volumes of data and implement robust security measures for user authentication and data protection.

The platform included a Single Page Application (SPA) with Firebase integration for secure user authentication, providing a streamlined user experience and reliable access control. The architecture was designed to manage scalability and performance, supporting a growing user base and varying load conditions effectively.

**Duration**: 14 months  
**Customer**: Game Studio based in Japan  
**Technologies**: Kotlin, Spring, Svelte

![](/img/kotlin.svg)

## [Unity WebGL Blockchain Integration](@/works.md#blockchain-integration) {#blockchain-integration}
Our team successfully integrated blockchain interactions into a WebGL-based card game created in Unity, enabling the game to interact seamlessly with blockchain technology.

Using the Unity-based Ethereum interaction library Nethereum, we enabled the game to listen for blockchain events and pull transaction data directly from the blockchain. To facilitate communication between the game and blockchain, we developed a custom protocol and Unity jslib that executed RPCs through browser-based wallets such as MetaMask. This setup allowed players to interact with the blockchain in real-time, directly from their browsers.

This project was groundbreaking as it was one of the earliest examples of Unity-blockchain integration, particularly within the browser. The integration not only showcased the potential for blockchain technology in gaming but also set a precedent for future projects in this domain.

**Duration**: 6 weeks  
**Customer**: Game Studio based in the Netherlands  
**Technologies**: Unity, WebGL, Nethereum, MetaMask

![](/img/ethereum.svg) • ![](/img/unity.svg)

## [Matchmaking Smart Contract](@/works.md#blockchain-matchmaking) {#blockchain-matchmaking}
This project involved developing a secure matchmaking system using Solidity for a Unity-based card game, integrating it with the existing Unity game code and battle contracts. The matchmaking system assigned an ELO ranking to each player to match them with opponents of similar skill levels, and enhanced the competitive experience with a dynamic leaderboard. To avoid long wait times, we implemented a time-based fallback that loosened the skill-based matchmaking rules, and included a PvE mode that allowed players to enjoy the game during periods of low player activity.

**Duration**: 1 month  
**Customer**: Game Studio based in the Netherlands  
**Technologies**: Unity, Solidity, Hardhat

![](/img/ethereum.svg)

## [Unity Thirdweb Integration](@/works.md#blockchain-thirdweb) {#blockchain-thirdweb}
We enhanced a Unity-based card game by migrating its blockchain integration from Nethereum to the Thirdweb platform. This transition provided a more streamlined and versatile blockchain setup.

By using Thirdweb, we enabled social login features (Apple ID, Google, etc.), and extended support for Android and iOS builds. This upgrade also offered greater compatibility with various Web3 wallet providers, improving in-game transaction flexibility and security.

**Duration**: 2 months  
**Customer**: Game Studio based in the Netherlands  
**Technologies**: Unity, Nethereum, Thirdweb, Hardhat

![](/img/ethereum.svg) • ![](/img/unity.svg)

## [Past Experience](@/works.md#past-experience) {#past-experience}
Before forming our company, our team members collectively amassed a wealth of expertise in various fields. Our background includes leading projects in cloud, IoT, AI, research, and game development, laying a strong foundation for our innovative solutions. We have architected cybersecurity frameworks for major tech companies, developed indie games, contributed to low-level systems programming, and engineered communication technologies alongside robust server-side APIs. These diverse experiences have equipped us with a comprehensive skill set, enabling us to tackle complex challenges and deliver exceptional results for our clients.
