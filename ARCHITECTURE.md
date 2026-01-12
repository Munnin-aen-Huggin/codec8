# CodeDoc AI - Technical Architecture

## System Overview

```mermaid
flowchart TB
    subgraph Client["Frontend (SvelteKit)"]
        LP[Landing Page]
        DB[Dashboard]
        RD[Repo Detail]

        subgraph Components
            HC[Header]
            RC[RepoCard]
            DE[DocEditor]
            DT[DocTabs]
            TO[Toast]
        end

        subgraph Stores
            AS[auth.ts]
            RS[repos.ts]
            TS[toast.ts]
        end
    end

    subgraph Server["Server (SvelteKit API)"]
        subgraph Auth["Auth Routes"]
            AL["/auth/login"]
            AC["/auth/callback"]
            AO["/auth/logout"]
        end

        subgraph API["API Routes"]
            AR["/api/repos"]
            AD["/api/docs"]
            AST["/api/stripe"]
        end

        subgraph ServerLib["Server Modules"]
            GH[github.ts]
            CL[claude.ts]
            ST[stripe.ts]
            SB[supabase.ts]
        end
    end

    subgraph External["External Services"]
        GHA[GitHub API]
        CLA[Claude API]
        STA[Stripe API]
        SBA[(Supabase DB)]
    end

    LP --> AS
    DB --> RS
    RD --> DE

    AS --> AL
    RS --> AR
    DE --> AD

    AL --> GHA
    AC --> GHA
    AR --> GH
    AD --> CL
    AST --> ST

    GH --> GHA
    CL --> CLA
    ST --> STA
    SB --> SBA
```

---

## Component Hierarchy

```mermaid
flowchart TD
    subgraph Root["+layout.svelte"]
        Header
        Toast[Toast Container]
        Slot[Page Content]
    end

    subgraph Pages
        Landing["+page.svelte<br/>(Landing)"]
        Dashboard["dashboard/+page.svelte"]
        RepoDetail["dashboard/[repoId]/+page.svelte"]
        Success["checkout/success/+page.svelte"]
    end

    subgraph DashboardComponents[Dashboard Components]
        RepoCard
        Skeleton
        RepoCardSkeleton
    end

    subgraph RepoDetailComponents[Repo Detail Components]
        DocTabs
        DocEditor
        GenerateButton[Generate Button]
    end

    Root --> Pages
    Dashboard --> DashboardComponents
    RepoDetail --> RepoDetailComponents

    Header --> |"Navigation"| Landing
    Header --> |"Navigation"| Dashboard
    RepoCard --> |"Click"| RepoDetail
```

---

## Data Flow Architecture

```mermaid
flowchart LR
    subgraph User Actions
        UA1[Sign In]
        UA2[Connect Repo]
        UA3[Generate Docs]
        UA4[Edit Doc]
        UA5[Upgrade Plan]
    end

    subgraph Frontend Stores
        AuthStore[auth.ts<br/>User State]
        RepoStore[repos.ts<br/>Repository State]
        ToastStore[toast.ts<br/>Notifications]
    end

    subgraph API Layer
        AuthAPI[Auth Routes]
        RepoAPI[Repo Routes]
        DocsAPI[Docs Routes]
        StripeAPI[Stripe Routes]
    end

    subgraph Server Modules
        GitHub[github.ts]
        Claude[claude.ts]
        Stripe[stripe.ts]
        Supabase[supabase.ts]
    end

    UA1 --> AuthStore --> AuthAPI --> Supabase
    UA2 --> RepoStore --> RepoAPI --> GitHub
    UA3 --> DocsAPI --> Claude
    UA4 --> DocsAPI --> Supabase
    UA5 --> StripeAPI --> Stripe

    AuthAPI --> |Fetch User| GitHub
    RepoAPI --> |Fetch Repos| GitHub
    DocsAPI --> |Save Docs| Supabase
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant L as /auth/login
    participant GH as GitHub OAuth
    participant C as /auth/callback
    participant DB as Supabase
    participant D as Dashboard

    U->>F: Click "Sign In"
    F->>L: GET /auth/login
    L->>L: Generate CSRF state
    L->>GH: Redirect to GitHub OAuth
    GH->>U: Show authorization page
    U->>GH: Authorize app
    GH->>C: Redirect with code + state
    C->>C: Validate CSRF state
    C->>GH: Exchange code for token
    GH-->>C: Access token
    C->>GH: Fetch user data
    GH-->>C: User profile
    C->>DB: Upsert profile
    DB-->>C: Profile saved
    C->>C: Set session cookie
    C->>D: Redirect to dashboard
```

---

## Documentation Generation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant RD as Repo Detail
    participant API as /api/docs/generate
    participant P as parser.ts
    participant GH as GitHub API
    participant C as claude.ts
    participant CL as Claude API
    participant DB as Supabase

    U->>RD: Click "Generate Docs"
    RD->>API: POST {repoId, types[]}
    API->>DB: Get user profile + token
    API->>P: fetchRepoContext()
    P->>GH: Fetch repo tree
    P->>GH: Fetch key files
    GH-->>P: File contents
    P-->>API: RepoContext
    API->>C: generateMultipleDocs()

    loop For each doc type
        C->>C: Build prompt
        C->>CL: Generate content
        CL-->>C: Markdown content
    end

    C-->>API: Generated docs
    API->>DB: Save documentation
    DB-->>API: Docs saved
    API-->>RD: Success response
    RD->>RD: Update UI
```

---

## Payment Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as /api/stripe/checkout
    participant S as Stripe
    participant WH as /api/stripe/webhook
    participant DB as Supabase
    participant SC as Success Page

    U->>F: Click "Upgrade"
    F->>API: POST {tier, successUrl}
    API->>S: Create checkout session
    S-->>API: Session URL
    API-->>F: Redirect URL
    F->>S: Redirect to Stripe
    U->>S: Complete payment
    S->>WH: Webhook event
    WH->>WH: Verify signature
    WH->>DB: Update user plan
    WH->>DB: Create license key
    DB-->>WH: Saved
    S->>SC: Redirect to success
    SC->>DB: Fetch license key
    SC->>U: Display confirmation
```

---

## Database Schema

```mermaid
erDiagram
    profiles ||--o{ repositories : owns
    profiles ||--o{ licenses : has
    repositories ||--o{ documentation : contains

    profiles {
        uuid id PK
        text email
        text github_username
        text github_token
        text plan
        timestamptz created_at
    }

    repositories {
        uuid id PK
        uuid user_id FK
        bigint github_repo_id
        text name
        text full_name
        boolean private
        text default_branch
        text description
        text language
        timestamptz last_synced
    }

    documentation {
        uuid id PK
        uuid repo_id FK
        text type
        text content
        integer version
        timestamptz generated_at
    }

    licenses {
        uuid id PK
        uuid user_id FK
        text license_key UK
        text tier
        text stripe_payment_id
        timestamptz activated_at
    }

    email_signups {
        uuid id PK
        text email UK
        timestamptz created_at
    }
```

---

## API Endpoints Map

```mermaid
flowchart TD
    subgraph Authentication
        A1["GET /auth/login"]
        A2["GET /auth/callback"]
        A3["POST /auth/logout"]
    end

    subgraph Repositories
        R1["GET /api/repos"]
        R2["POST /api/repos"]
        R3["GET /api/repos/:id"]
        R4["DELETE /api/repos/:id"]
    end

    subgraph Documentation
        D1["POST /api/docs/generate"]
        D2["GET /api/docs/:id"]
        D3["PUT /api/docs/:id"]
        D4["DELETE /api/docs/:id"]
    end

    subgraph Payments
        P1["POST /api/stripe/checkout"]
        P2["POST /api/stripe/webhook"]
    end

    subgraph Other
        O1["POST /api/subscribe"]
    end

    A1 --> |"Initiate OAuth"| GitHub
    A2 --> |"Token Exchange"| GitHub

    R1 --> |"Fetch Repos"| GitHub
    R2 --> |"Save Repo"| Supabase

    D1 --> |"Generate"| Claude
    D1 --> |"Save"| Supabase

    P1 --> |"Create Session"| Stripe
    P2 --> |"Update Plan"| Supabase
```

---

## Store State Management

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated

    state auth.ts {
        Unauthenticated --> Loading: Login initiated
        Loading --> Authenticated: Session valid
        Loading --> Unauthenticated: Session invalid
        Authenticated --> Unauthenticated: Logout
    }

    state repos.ts {
        Empty --> LoadingRepos: Fetch repos
        LoadingRepos --> HasRepos: Repos loaded
        LoadingRepos --> Error: Fetch failed
        HasRepos --> LoadingRepos: Refresh
    }

    state toast.ts {
        NoToasts --> HasToasts: Add toast
        HasToasts --> NoToasts: Dismiss all
        HasToasts --> HasToasts: Add/Remove toast
    }
```

---

## File Structure Overview

```mermaid
flowchart TD
    subgraph src
        subgraph routes
            R1["+page.svelte (Landing)"]
            R2["+layout.svelte"]
            R3["+layout.server.ts"]

            subgraph auth
                AU1["login/+server.ts"]
                AU2["callback/+server.ts"]
                AU3["logout/+server.ts"]
            end

            subgraph dashboard
                DA1["+page.svelte"]
                DA2["+page.server.ts"]
                subgraph repoId["[repoId]"]
                    RI1["+page.svelte"]
                    RI2["+page.server.ts"]
                end
            end

            subgraph api
                subgraph repos
                    AP1["+server.ts"]
                    AP2["[id]/+server.ts"]
                end
                subgraph docs
                    DO1["generate/+server.ts"]
                    DO2["[id]/+server.ts"]
                end
                subgraph stripe
                    ST1["checkout/+server.ts"]
                    ST2["webhook/+server.ts"]
                end
            end
        end

        subgraph lib
            subgraph components
                C1["Header.svelte"]
                C2["RepoCard.svelte"]
                C3["DocEditor.svelte"]
                C4["DocTabs.svelte"]
                C5["Toast.svelte"]
                C6["Skeleton.svelte"]
            end

            subgraph stores
                S1["auth.ts"]
                S2["repos.ts"]
                S3["toast.ts"]
            end

            subgraph server
                SV1["supabase.ts"]
                SV2["github.ts"]
                SV3["claude.ts"]
                SV4["stripe.ts"]
            end

            subgraph utils
                U1["parser.ts"]
                U2["prompts.ts"]
                U3["license.ts"]
            end

            T1["types.ts"]
        end
    end
```

---

## Technology Stack

```mermaid
flowchart TB
    subgraph Frontend
        SK[SvelteKit 2.0]
        TS[TypeScript]
        TW[Tailwind CSS]
        SS[Svelte Stores]
    end

    subgraph Backend
        SKS[SvelteKit Server]
        NJ[Node.js]
    end

    subgraph Database
        SB[Supabase]
        PG[(PostgreSQL)]
        RLS[Row Level Security]
    end

    subgraph External APIs
        GH[GitHub API]
        CL[Claude API]
        ST[Stripe API]
    end

    subgraph Hosting
        VL[Vercel]
        EF[Edge Functions]
    end

    Frontend --> Backend
    Backend --> Database
    Backend --> External APIs
    VL --> Frontend
    VL --> Backend
    SB --> PG
```

---

## Security Architecture

```mermaid
flowchart TD
    subgraph User
        U[Browser]
    end

    subgraph Security Layers
        CSRF[CSRF Protection]
        JWT[Session Cookies]
        RLS[Row Level Security]
        ENC[Token Encryption]
    end

    subgraph Protected Resources
        API[API Endpoints]
        DB[(Database)]
        GHT[GitHub Token]
    end

    U --> |"State param"| CSRF
    CSRF --> |"httpOnly cookie"| JWT
    JWT --> |"User context"| API
    API --> |"Policy check"| RLS
    RLS --> DB

    ENC --> |"Encrypted storage"| GHT
```

---

## Deployment Architecture

```mermaid
flowchart LR
    subgraph Development
        LC[Local Dev]
        GIT[GitHub Repo]
    end

    subgraph Vercel
        PR[Preview Deploy]
        PROD[Production]
    end

    subgraph Services
        SB[Supabase Cloud]
        ST[Stripe]
        GH[GitHub OAuth]
        AN[Anthropic Claude]
    end

    LC --> |"git push"| GIT
    GIT --> |"PR"| PR
    GIT --> |"main branch"| PROD

    PROD --> SB
    PROD --> ST
    PROD --> GH
    PROD --> AN
```

---

## Key Metrics & Limits

| Service | Limit | Notes |
|---------|-------|-------|
| GitHub API | 5,000 req/hr | Per OAuth token |
| Claude API | Varies | Per account tier |
| Stripe | Unlimited | Standard rate limits |
| Supabase | 500MB DB | Free tier |
| Vercel | 100GB bandwidth | Free tier |

---

## Plan-Based Feature Matrix

```mermaid
flowchart TD
    subgraph Free
        F1[1 Repository]
        F2[All Doc Types]
        F3[Manual Export]
    end

    subgraph LTD["Lifetime Deal ($99)"]
        L1[Unlimited Repos]
        L2[All Doc Types]
        L3[GitHub PR Creation]
        L4[Priority Support]
    end

    subgraph Pro["Pro Setup ($497)"]
        P1[Everything in LTD]
        P2[30-min Onboarding]
        P3[Custom Templates]
    end

    subgraph DFY["Done-For-You ($2,500+)"]
        D1[Everything in Pro]
        D2[Full Documentation]
        D3[Dedicated Support]
    end

    Free --> LTD --> Pro --> DFY
```
