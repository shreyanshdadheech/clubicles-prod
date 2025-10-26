# Clubicles System Architecture & Flowcharts

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [User Onboarding Flows](#user-onboarding-flows)
3. [Booking & Payment Flow](#booking--payment-flow)
4. [VIBGYOR Tracking System](#vibgyor-tracking-system)
5. [Admin Approval Workflows](#admin-approval-workflows)
6. [QR Code Redemption Flow](#qr-code-redemption-flow)
7. [Database Entity Relationships](#database-entity-relationships)

---

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A[Next.js Frontend]
        B[Mobile Browser]
        C[Desktop Browser]
    end
    
    subgraph "API Layer"
        D[Next.js API Routes]
        E[Server Actions]
        F[Middleware Auth]
    end
    
    subgraph "Database Layer"
        G[Supabase PostgreSQL]
        H[Row Level Security]
        I[Database Triggers]
    end
    
    subgraph "External Services"
        J[Razorpay Payments]
        K[Supabase Auth]
        L[Supabase Storage]
        M[Email Service]
    end
    
    A --> D
    B --> D
    C --> D
    
    D --> F
    E --> F
    F --> G
    
    G --> H
    G --> I
    
    D --> J
    D --> K
    D --> L
    D --> M
    
    style A fill:#e1f5fe
    style G fill:#f3e5f5
    style J fill:#fff3e0
```

---

## User Onboarding Flows

### Individual User Registration

```mermaid
graph TD
    A[User visits /signup] --> B{Select User Type}
    B --> C[Individual Selected]
    C --> D[Fill Personal Info Form]
    D --> E[Select VIBGYOR Category]
    E --> F[Submit Registration]
    F --> G[Supabase Auth Creates User]
    G --> H{Auth Success?}
    H -->|Yes| I[Create User Record]
    H -->|No| J[Show Error Message]
    I --> K[Send Verification Email]
    K --> L[User Verifies Email]
    L --> M[Redirect to Dashboard]
    J --> D
    
    style C fill:#e8f5e8
    style M fill:#e8f5e8
    style J fill:#ffebee
```

### Space Owner Registration

```mermaid
graph TD
    A[Owner visits /signup] --> B{Select User Type}
    B --> C[Space Owner Selected]
    C --> D[Fill Personal Info]
    D --> E[Fill Business Info]
    E --> F[Upload Documents]
    F --> G[Set Payment Info]
    G --> H[Submit Application]
    H --> I[Create Auth User]
    I --> J{Auth Success?}
    J -->|Yes| K[Create Owner Record]
    J -->|No| L[Show Error]
    K --> M[Create Business Info]
    M --> N[Status: Pending Approval]
    N --> O[Admin Notification]
    O --> P[Wait for Approval]
    P --> Q{Approved?}
    Q -->|Yes| R[Owner Dashboard Access]
    Q -->|No| S[Rejection Email]
    L --> E
    
    style C fill:#fff3e0
    style R fill:#e8f5e8
    style S fill:#ffebee
```

---

## Booking & Payment Flow

```mermaid
graph TD
    A[User Searches Spaces] --> B[Select Space & Date]
    B --> C[Check Availability]
    C --> D{Seats Available?}
    D -->|No| E[Show Alternative Times]
    D -->|Yes| F[Configure Booking]
    F --> G[Calculate Pricing]
    G --> H[Show Pricing Breakdown]
    H --> I[User Confirms]
    I --> J[Create Razorpay Order]
    J --> K[Open Payment Gateway]
    K --> L{Payment Success?}
    L -->|No| M[Payment Failed]
    L -->|Yes| N[Verify Payment]
    N --> O[Update Booking Status]
    O --> P[Trigger VIBGYOR Update]
    P --> Q[Generate QR Code]
    Q --> R[Send Confirmation Email]
    R --> S[Update Space Analytics]
    M --> T[Retry Payment Option]
    T --> K
    
    style A fill:#e1f5fe
    style S fill:#e8f5e8
    style M fill:#ffebee
```

### Payment Processing Detail

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Backend API
    participant R as Razorpay
    participant DB as Database
    
    U->>F: Confirms booking
    F->>API: POST /api/payment/create-order
    API->>DB: Create booking (pending)
    API->>R: Create Razorpay order
    R-->>API: Order details
    API-->>F: Order response
    F->>R: Open payment modal
    R->>U: Payment interface
    U->>R: Complete payment
    R->>API: Webhook notification
    API->>R: Verify payment signature
    API->>DB: Update booking status
    API->>DB: Trigger VIBGYOR update
    API->>U: Send confirmation email
    API-->>F: Payment success
    F-->>U: Show success page
```

---

## VIBGYOR Tracking System

```mermaid
graph TD
    A[User Completes Booking] --> B[Payment Successful]
    B --> C[Database Trigger Fires]
    C --> D[Get User's Professional Role]
    D --> E[Get Space ID]
    E --> F[Update Space VIBGYOR Counters]
    F --> G{Professional Role?}
    G -->|VIOLET| H[Increment Violet Count]
    G -->|INDIGO| I[Increment Indigo Count]
    G -->|BLUE| J[Increment Blue Count]
    G -->|GREEN| K[Increment Green Count]
    G -->|YELLOW| L[Increment Yellow Count]
    G -->|ORANGE| M[Increment Orange Count]
    G -->|RED| N[Increment Red Count]
    G -->|GREY| O[Increment Grey Count]
    G -->|WHITE| P[Increment White Count]
    G -->|BLACK| Q[Increment Black Count]
    
    H --> R[Update Space Analytics]
    I --> R
    J --> R
    K --> R
    L --> R
    M --> R
    N --> R
    O --> R
    P --> R
    Q --> R
    
    R --> S[Refresh Dashboard]
    
    style A fill:#e1f5fe
    style S fill:#e8f5e8
```

### VIBGYOR Database Trigger

```mermaid
graph LR
    A[INSERT/UPDATE on bookings] --> B[Trigger Function]
    B --> C{Status = 'confirmed'?}
    C -->|Yes| D[Extract roles array]
    C -->|No| E[Skip update]
    D --> F[Update spaces table]
    F --> G[Increment matching color counters]
    G --> H[Return NEW record]
    
    style A fill:#fff3e0
    style H fill:#e8f5e8
    style E fill:#f5f5f5
```

---

## Admin Approval Workflows

### Business Verification Flow

```mermaid
graph TD
    A[Space Owner Registers] --> B[Pending Status]
    B --> C[Admin Notification]
    C --> D[Admin Reviews Application]
    D --> E[Check Documents]
    E --> F{Documents Valid?}
    F -->|Yes| G[Verify Business Info]
    F -->|No| H[Request More Documents]
    G --> I{All Info Correct?}
    I -->|Yes| J[Approve Application]
    I -->|No| K[Reject with Reason]
    J --> L[Update Owner Status]
    L --> M[Send Approval Email]
    M --> N[Owner Gets Dashboard Access]
    K --> O[Send Rejection Email]
    K --> P[Update Status to Rejected]
    H --> Q[Send Document Request]
    Q --> R[Owner Resubmits]
    R --> D
    
    style N fill:#e8f5e8
    style O fill:#ffebee
    style Q fill:#fff3e0
```

### Tax Configuration Management

```mermaid
graph TD
    A[Admin Creates Tax Config] --> B[Define Tax Parameters]
    B --> C[Set Percentage Rate]
    C --> D[Choose Applies To]
    D --> E{Applies To?}
    E -->|booking| F[Customer Tax]
    E -->|owner_payout| G[Owner Deduction]
    E -->|both| H[Both Applied]
    F --> I[Active for All Bookings]
    G --> J[Applied to Owner Revenue]
    H --> K[Comprehensive Tax]
    I --> L[Update All Pricing]
    J --> L
    K --> L
    L --> M[Notify Space Owners]
    
    style A fill:#e1f5fe
    style M fill:#e8f5e8
```

---

## QR Code Redemption Flow

```mermaid
graph TD
    A[Customer Arrives at Space] --> B[Shows QR Code to Owner]
    B --> C[Owner Scans QR Code]
    C --> D[Decode QR Data]
    D --> E[Extract Redemption Code]
    E --> F[Verify with Database]
    F --> G{Valid Code?}
    G -->|No| H[Show Error Message]
    G -->|Yes| I[Check Redemption Status]
    I --> J{Already Redeemed?}
    J -->|Yes| K[Show Already Used Error]
    J -->|No| L[Mark as Redeemed]
    L --> M[Update Booking Status]
    M --> N[Record Redeemed By Owner]
    N --> O[Send Confirmation]
    O --> P[Customer Check-in Success]
    
    H --> Q[Manual Code Entry Option]
    K --> Q
    Q --> R[Owner Enters Code Manually]
    R --> F
    
    style P fill:#e8f5e8
    style H fill:#ffebee
    style K fill:#ffebee
```

### QR Code Generation Process

```mermaid
graph LR
    A[Successful Payment] --> B[Generate Redemption Code]
    B --> C[Create QR Data Object]
    C --> D[Encrypt Security Hash]
    D --> E[Generate QR Code Image]
    E --> F[Store QR Data in Database]
    F --> G[Include in Confirmation Email]
    
    style A fill:#fff3e0
    style G fill:#e8f5e8
```

---

## Database Entity Relationships

```mermaid
erDiagram
    AUTH_USERS ||--|| USERS : has
    AUTH_USERS ||--|| SPACE_OWNERS : has
    AUTH_USERS ||--|| ADMINS : has
    
    SPACE_OWNERS ||--|| SPACE_OWNER_BUSINESS_INFO : has
    SPACE_OWNER_BUSINESS_INFO ||--o{ SPACES : owns
    SPACE_OWNERS ||--o| SPACE_OWNER_SUBSCRIPTIONS : has
    SPACE_OWNERS ||--o| SPACE_OWNER_PAYMENT_INFO : has
    
    USERS ||--o{ BOOKINGS : makes
    SPACES ||--o{ BOOKINGS : receives
    BOOKINGS ||--o| BOOKING_PAYMENTS : has
    BOOKINGS ||--o{ BOOKING_TAXES : has
    BOOKINGS ||--o| REVIEWS : generates
    
    ADMINS ||--o{ TAX_CONFIGURATIONS : creates
    TAX_CONFIGURATIONS ||--o{ BOOKING_TAXES : applied_in
    
    SPACE_OWNERS ||--o{ SPACE_OWNER_PAYMENTS : receives
    ADMINS ||--o{ SPACE_OWNER_PAYMENTS : processes
    
    USERS ||--o{ SUPPORT_TICKETS : creates
    ADMINS ||--o{ SUPPORT_TICKETS : handles
    
    USERS {
        uuid id PK
        uuid auth_id FK
        varchar email
        varchar first_name
        varchar last_name
        varchar city
        professional_role professional_role
        timestamptz created_at
    }
    
    SPACE_OWNERS {
        uuid id PK
        uuid auth_id FK
        varchar email
        varchar first_name
        varchar last_name
        premium_plan premium_plan
        text approval_status
        timestamptz created_at
    }
    
    SPACES {
        uuid id PK
        uuid business_id FK
        varchar name
        text description
        integer total_seats
        numeric price_per_hour
        numeric price_per_day
        integer violet
        integer indigo
        integer blue
        integer green
        integer yellow
        integer orange
        integer red
        integer grey
        integer white
        integer black
    }
    
    BOOKINGS {
        uuid id PK
        uuid user_id FK
        uuid space_id FK
        date date
        time start_time
        time end_time
        integer seats_booked
        numeric total_amount
        booking_status status
        varchar redemption_code
        text qr_code_data
        boolean is_redeemed
        professional_role[] roles
    }
```

---

## Authentication & Authorization Flow

```mermaid
graph TD
    A[User Accesses Protected Route] --> B[Middleware Checks Auth]
    B --> C{Valid Session?}
    C -->|No| D[Redirect to Sign In]
    C -->|Yes| E[Get User Role]
    E --> F{Check Route Access}
    F -->|Individual Route| G{User Type = Individual?}
    F -->|Owner Route| H{User Type = Owner?}
    F -->|Admin Route| I{User Type = Admin?}
    F -->|Public Route| J[Allow Access]
    
    G -->|Yes| K[Load User Context]
    G -->|No| L[403 Forbidden]
    H -->|Yes| M[Load Owner Context]
    H -->|No| L
    I -->|Yes| N[Load Admin Context]
    I -->|No| L
    
    K --> O[Apply RLS Policies]
    M --> P[Apply Owner RLS]
    N --> Q[Use Service Role]
    
    O --> R[Render Page]
    P --> R
    Q --> R
    
    style J fill:#e8f5e8
    style R fill:#e8f5e8
    style L fill:#ffebee
    style D fill:#fff3e0
```

---

## Search & Discovery Architecture

```mermaid
graph TD
    A[User Types Query] --> B[Frontend Autocomplete]
    B --> C[Debounced API Call]
    C --> D[/api/search endpoint]
    D --> E[Parse Search Parameters]
    E --> F{Search Type?}
    F -->|Space Name| G[Search Spaces Table]
    F -->|City| H[Search Cities with Spaces]
    F -->|Combined| I[Full Text Search]
    
    G --> J[Apply Filters]
    H --> J
    I --> J
    
    J --> K[VIBGYOR Filter]
    K --> L[Availability Check]
    L --> M[Sort Results]
    M --> N[Return Paginated Results]
    
    N --> O[Frontend Displays]
    O --> P[User Selects Space]
    P --> Q[Navigate to Booking]
    
    style A fill:#e1f5fe
    style Q fill:#e8f5e8
```

### Search Query Processing

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as Search API
    participant DB as Database
    
    U->>F: Types search query
    F->>API: GET /api/search?q=...
    API->>DB: Query spaces with filters
    DB-->>API: Matching spaces
    API->>DB: Get VIBGYOR data
    DB-->>API: Professional distribution
    API->>DB: Check availability
    DB-->>API: Seat availability
    API-->>F: Search results
    F-->>U: Display suggestions
    U->>F: Selects space
    F->>F: Navigate to booking
```

---

## Revenue Distribution System

```mermaid
graph TD
    A[Customer Payment] --> B[Total Amount Received]
    B --> C[Calculate Breakdown]
    C --> D[Base Amount]
    C --> E[Tax Amount]
    C --> F[Platform Commission]
    
    D --> G[Owner's Base Revenue]
    E --> H[Government Tax]
    F --> I[Platform Earnings]
    
    G --> J[Owner Balance Account]
    I --> K[Platform Revenue Account]
    H --> L[Tax Compliance Records]
    
    J --> M{Payout Threshold Met?}
    M -->|Yes| N[Schedule Payout]
    M -->|No| O[Accumulate Balance]
    
    N --> P[Admin Payout Processing]
    P --> Q[Bank Transfer]
    Q --> R[Update Owner Balance]
    R --> S[Send Payout Confirmation]
    
    style B fill:#e1f5fe
    style S fill:#e8f5e8
    style K fill:#fff3e0
```

This comprehensive flowchart documentation covers all major system flows in the Clubicles platform, from user onboarding to payment processing to the unique VIBGYOR tracking system.