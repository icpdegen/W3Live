# W3Live - Web3 Livestreaming Event Platform

## Overview
W3Live is a livestreaming event platform that allows organizers to create and manage events while enabling attendees to view and participate in these events through shareable URLs.

## User Roles
- **Organizers**: Authenticate via Internet Identity to create, edit, and manage events
- **Attendees**: Access events through URLs without authentication requirements

## Event Types
- **Public Events**: Open to all users and discoverable
- **Private Events**: Accessible only via unique, shareable URLs

## Event Status
- **Draft Events**: Saved but not published, only visible to the organizer who created them
- **Published Events**: Live events accessible to attendees via URLs

## Profile Management
Organizers can optionally set up their profile with a username. The profile setup includes:
- Username selection and validation
- Profile information storage linked to Internet Identity
- Username can be set or modified from the Organizer Dashboard

## Event Management
Organizers can create and edit events with the following content:
- Hero graphic image
- Video player placeholder graphic image  
- Event title and description
- HLS stream URL for livestreaming
- Multiple MP4 videos, each with:
  - Video title
  - Poster image
  - MP4 URL (for external videos) OR uploaded MP4 file
- Event status (draft or published)

Events can be saved as drafts during creation or editing, allowing organizers to work on events over time before publishing them.

Each event is associated with its creator's user profile, ensuring organizers can only create, edit, and manage their own events.

## Video Content
Events support multiple video formats:
- **External MP4 Videos**: Added via URL with title and poster image
- **Uploaded MP4 Videos**: Direct file uploads with title and poster image

Both video types are displayed and managed identically within events.

## Livestreaming
- Support HLS protocol for live streams
- Use hls.js player in the frontend for stream playback
- Livestreams are optional per event

## Event Pages
Each published event has a dedicated details page that displays:
- All event information and metadata in the main content area
- Event details section positioned above the video content
- Video content with poster images displayed below the event details
- Active livestream when available with live stream controls integrated in the main content area below the event details
- Direct URL access for both public and private events
- Comments section showing all comments for the event with total count and date/timestamp display
- Likes and emoji reactions section showing total likes count and all emoji reaction counts for the event

The event details page uses a single-column layout with all content presented in the main area without a sidebar. The event details section appears first, followed by the live stream controls and video content integrated together in the main content flow.

Draft events are only accessible to their creators through the organizer interface.

## Event Listings and Navigation
Event cards on the Events page are fully clickable, allowing users to navigate to event details by clicking anywhere on the card, not just specific buttons. This provides an intuitive user experience where the entire event card acts as a clickable area to access the event.

## Independent Likes and Emoji Reactions System
A comprehensive engagement system that allows users to express their appreciation for events through two independent interaction types:
- Only authenticated users can like events and add emoji reactions
- **Likes System**: Each authenticated user can like an event only once, with the ability to toggle their like on/off independently of their emoji reaction
- **Emoji Reactions System**: Each authenticated user can select one emoji reaction per event from a predefined list of emojis, independently of their like status
- Users can perform both actions (like AND emoji reaction) on the same event simultaneously without one replacing the other
- Users can change their emoji reaction selection for an event at any time without affecting their like status
- Users can toggle their like status without affecting their emoji reaction selection
- Total likes count is displayed on both event details pages and event listings
- All emoji reaction counts are displayed on both event details pages and event listings, showing the count for each emoji type
- All users (authenticated and unauthenticated) can view the total likes count and emoji reaction counts for any published event
- The likes and emoji reactions data is stored separately and independently in the backend with unique identifiers for each user-event combination
- The system prevents duplicate likes from the same user and ensures only one emoji reaction per user per event, while allowing both to coexist
- Likes and emoji reactions are displayed prominently on event pages and in event listings to encourage engagement
- The predefined emoji list includes common reaction emojis such as heart, thumbs up, fire, clap, and laugh

## Comments System
A robust commenting system with guaranteed unique comment storage and event validation:
- Only authenticated users can post comments on any published event
- Comments can only be created for valid, existing events - the backend validates that the eventId exists before accepting any comment
- Each comment is stored with a unique identifier using the format `comment:<eventId>:<timestamp>:<randomId>` to ensure no comment overwrites another
- The backend uses a unique metadata key system that prevents any comment data from being overwritten
- All comments are stored as individual, distinct entries in the backend data map
- All users (authenticated and unauthenticated) can view all comments on any published event
- Comments are displayed on the event details page as a complete list showing every individual comment that has been posted
- Comments display the username of the authenticated user who posted them along with accurate date and timestamp
- Comments are ordered chronologically from newest to oldest, with the most recent comment appearing at the top of the list
- The total comment count accurately reflects the actual number of individual comment entries stored
- The frontend fetches the complete list of all comment entries for each event and displays them properly
- The UI updates to show new comments either in real-time or when the page is refreshed
- All comment entries remain permanently accessible and visible to everyone
- The backend storage system guarantees that adding new comments always creates new entries with unique identifiers rather than replacing existing data
- Comment posting is prevented for invalid event IDs (such as 0 or non-existent events) with clear error messages displayed to users

## Comment Moderation
The comment posting workflow includes automated content moderation:
- Before submitting any comment, the comment text is automatically sent to Google's Perspective API for content analysis
- The Perspective API evaluates the comment for inappropriate or risky content
- If the API flags the comment as inappropriate or risky, the submission is blocked and a warning message is displayed to the user
- Users can edit their comment text and retry submission after receiving a moderation warning
- Only comments that pass Perspective API moderation are allowed to be submitted to the backend
- The moderation check occurs entirely in the frontend before any backend interaction
- Users receive clear feedback about why their comment was blocked and can modify their content accordingly
- The Perspective API key is securely loaded from environment variables or configuration files and is not exposed in the public codebase

## User Registration
- Any authenticated user is automatically registered and approved as a user on their first interaction with the system
- This automatic registration enables immediate comment posting and engagement features without manual approval processes

## Guaranteed Event and Comment Persistence System
The backend implements an absolutely bulletproof data persistence system that ensures all events and comments are permanently saved, never disappear, and persist reliably across all sessions and system operations:

### Unbreakable Event Storage Architecture
- Each event is assigned a cryptographically secure, globally unique event ID that cannot be duplicated or reused under any circumstances
- Events are stored using atomic write operations in stable storage with multiple redundancy layers and comprehensive backup systems
- Event storage uses write-once, read-many semantics where each event occupies a permanent, immutable storage location
- The backend maintains multiple independent indexes and cross-references to ensure events can always be retrieved through multiple pathways
- Event creation operations include comprehensive validation, error recovery, and automatic retry mechanisms to guarantee successful storage
- All event data persists permanently across canister upgrades, restarts, system maintenance, and any other operational changes

### Bulletproof Comment Storage System
- Comments use a unique metadata key format `comment:<eventId>:<timestamp>:<randomId>` that mathematically guarantees no two comments can ever share the same storage location
- Each comment is stored as a completely separate, independent entry with its own unique storage slot that cannot be overwritten
- Comment storage operations use atomic transactions with full rollback capabilities to prevent partial writes or data corruption
- The backend validates event existence before accepting any comment and provides comprehensive error handling for invalid operations
- All comments remain permanently accessible and visible across all sessions with guaranteed retrieval mechanisms

### Session-Independent Data Persistence
- All events and comments are stored exclusively in stable storage that survives all possible system operations and changes
- Data retrieval operations implement fail-safe logic that defaults to including data rather than excluding it when status is uncertain
- The backend maintains continuous integrity monitoring with automated self-healing capabilities to detect and resolve any storage anomalies
- Event and comment counters are persistently maintained and verified to ensure accurate data representation across all sessions
- The system includes comprehensive disaster recovery procedures and automated backup verification to guarantee complete data protection

### Multi-Layer Data Protection
- Event and comment storage operations are logged with complete audit trails including timestamps, checksums, and integrity verification
- The backend implements redundant storage mechanisms with multiple backup systems and automated consistency checks
- Data retrieval includes comprehensive error handling, automatic retry mechanisms, and fallback procedures to ensure data is always accessible
- The system maintains real-time monitoring of data integrity with automated alerting and recovery for any detected issues
- All storage operations are thoroughly tested with stress testing, concurrent access testing, and failure scenario simulation

## Data Storage
Backend stores all data in stable storage with guaranteed persistence and reliability:
- Organizer profiles with optional usernames linked to Internet Identity using permanent storage with comprehensive backup systems
- Event metadata with globally unique event IDs, titles, descriptions, HLS stream URLs stored using the bulletproof event storage system with guaranteed persistence and verified reliability
- Event ownership linking each event to its creator's profile using unique event ID system with redundant mapping and comprehensive verification
- Event status (draft or published) with fail-safe storage mechanisms and automated consistency checks
- Video information with titles, poster image paths, and either MP4 URLs or uploaded MP4 file paths linked to unique event IDs with comprehensive data validation
- User authentication data for organizers with secure storage and comprehensive backup mechanisms
- Image file paths for hero graphics, video placeholders, and poster images associated with unique event IDs with automated integrity verification
- Event privacy settings and unique URLs for private events using the unique event ID system with secure access controls
- Uploaded MP4 video files linked to unique event IDs with comprehensive file management and backup systems
- Comment storage using unique metadata keys with guaranteed unique storage locations that cannot be overwritten under any circumstances
- User registration data for automatic approval of authenticated users with secure profile management
- Likes data with unique user-event combinations stored separately to prevent duplicate likes and enable independent operation
- Emoji reactions data with unique user-event combinations stored separately from likes data with independent storage mechanisms
- Comprehensive audit logs, transaction histories, and data integrity verification systems for all storage operations
- Automated backup systems, data replication, and disaster recovery mechanisms for all critical data
- Continuous monitoring systems with real-time integrity verification and automated recovery capabilities

## Backend Architecture
The backend canister is organized with clear separation between different functional areas:
- **Bulletproof Event Management Module**: Handles all event-related operations with the guaranteed persistence system, unique event ID generation, and comprehensive data protection mechanisms
- **Unbreakable Comment Management Module**: Manages all comment-related functionality with guaranteed unique storage and comprehensive data integrity systems
- **User Management Module**: Handles user profiles, authentication, and registration with secure data management and backup systems
- **File Storage Module**: Manages image and video file operations with comprehensive backup and integrity verification systems
- **Engagement Module**: Manages likes and emoji reactions functionality with separate data structures and guaranteed independent storage
- **Data Integrity Module**: Provides continuous monitoring, automated consistency checks, audit trail maintenance, and comprehensive recovery capabilities across all modules

Each module maintains its own data structures and storage mechanisms while operating within the same canister, ensuring logical independence, maintainability, and absolute data protection with verified reliability.

## Backend Operations
- Create and update organizer profiles with secure data management and comprehensive backup systems
- Validate username availability with comprehensive uniqueness verification and error handling
- Generate cryptographically secure globally unique event IDs for each new event with mathematical collision prevention and comprehensive uniqueness verification
- Create new events with draft or published status using the bulletproof event storage system that guarantees unique, permanent storage with atomic transaction processing and verified data integrity
- Edit existing events and change their status using atomic update operations with comprehensive transaction logging and data integrity verification
- Query events for organizers using the guaranteed persistence system with robust error recovery and comprehensive data validation
- Query single event by unique ID using the bulletproof retrieval system with fail-safe logic and automated recovery procedures
- Support public event discovery using the guaranteed persistence system with enhanced filtering reliability and comprehensive event accessibility
- Support private event access via unique URLs using the secure event ID system with comprehensive access controls
- Integration with file storage system for image management and MP4 video file storage with automated backup and integrity verification
- Comment creation and retrieval operations with comprehensive event validation and guaranteed unique storage systems
- Event validation for all operations using the unique event ID system with multiple verification steps and comprehensive error handling
- Automatically register and approve authenticated users with secure profile creation and comprehensive data management
- Like and emoji reaction management operations using the unique event ID system with guaranteed data integrity and independent storage
- Retrieval operations for engagement data with comprehensive error handling and verified data access mechanisms
- Implement continuous storage monitoring with real-time integrity verification and automated recovery capabilities
- Maintain comprehensive audit trails, transaction logging, and automated recovery capabilities for all operations
- Provide verified data listing operations that guarantee access to all stored data without any risk of missing entries
- Implement comprehensive disaster recovery, automated backup verification, and absolute data protection capabilities

## Authentication
- Internet Identity integration for organizer login with secure session management
- No mandatory profile setup after authentication
- Authentication required for event creation and editing with comprehensive ownership verification
- Event ownership verification for all edit operations using unique event IDs and secure access controls
- No authentication required for attendees accessing published events via URLs
- Authentication required for posting comments, liking events, and adding emoji reactions with secure user verification
- No authentication required for viewing comments, likes counts, and emoji reaction counts
- Automatic user registration and approval for authenticated users with secure profile management

## Frontend Features
- Event creation and editing interface for organizers with draft/publish options and comprehensive MP4 file upload capability
- Organizer Dashboard displaying all created events using the guaranteed persistence system with comprehensive error handling and verified access to all user events
- Event details pages with single-column layout presenting all content with comprehensive data display and error handling
- Public Events page showing all published public events using the bulletproof storage system with reliable display and comprehensive error handling
- Fully clickable event cards on the Events page with navigation using unique event IDs and comprehensive error handling
- Image upload functionality with comprehensive error handling, validation, and backup systems
- MP4 video file upload functionality with robust file management, validation, and integrity verification
- Video player integration with HLS support and comprehensive error handling mechanisms
- Comments section on event details pages with comment posting form and guaranteed complete comment list display
- Comment display system with comprehensive error handling and verified data access mechanisms
- Comment validation and moderation integration with comprehensive error handling and user feedback
- Independent likes and emoji reactions functionality using unique event IDs with verified data integrity and reliable operation
- Display of engagement data with comprehensive error handling and guaranteed data access
- Global BigInt serialization polyfill for consistent data handling across all operations
- User notifications with specific error categorization and comprehensive feedback systems
- Responsive design using React, TypeScript, and Tailwind CSS with comprehensive error handling
- Advanced error handling for all operations with automatic retry mechanisms, fallback procedures, and verified data access
- Reliable data listing and display functionality using the guaranteed persistence system with verified access to all stored data
- Data navigation and management using unique identifiers with comprehensive error handling and verified reliability
- Enhanced user interface features with clear feedback, comprehensive error messages, and verified system reliability
