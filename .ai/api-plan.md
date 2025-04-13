# REST API Plan

## 1. Resources
- **Users** - Corresponds to `auth.users` table (managed by Supabase Auth)
- **Flashcards** - Corresponds to `flashcards` table (stores all accepted flashcards, including AI-generated ones)
- **Flashcard Reviews** - Corresponds to `flashcard_reviews` table

## 2. Endpoints

### Authentication

#### Register User
- **Method**: POST
- **URL**: `/api/auth/register`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "email": "string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 409 Conflict (Email already exists)

#### Login
- **Method**: POST
- **URL**: `/api/auth/login`
- **Description**: Authenticate a user and receive a session token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "string"
    },
    "session": {
      "access_token": "string",
      "refresh_token": "string",
      "expires_at": "timestamp"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### Logout
- **Method**: POST
- **URL**: `/api/auth/logout`
- **Description**: Invalidate the current user session
- **Response**: No content
- **Success Codes**: 204 No Content
- **Error Codes**: 401 Unauthorized

#### Change Password
- **Method**: PUT
- **URL**: `/api/auth/password`
- **Description**: Update the user's password
- **Request Body**:
  ```json
  {
    "current_password": "string",
    "new_password": "string"
  }
  ```
- **Response**: No content
- **Success Codes**: 204 No Content
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### Delete Account
- **Method**: DELETE
- **URL**: `/api/auth/account`
- **Description**: Delete the user account and all associated data
- **Request Body**:
  ```json
  {
    "password": "string"
  }
  ```
- **Response**: No content
- **Success Codes**: 204 No Content
- **Error Codes**: 400 Bad Request, 401 Unauthorized

### Flashcards

#### Generate Flashcards from Text
- **Method**: POST
- **URL**: `/api/flashcards/generate`
- **Description**: Generate flashcards using AI based on provided text, returned to client for review
- **Request Body**:
  ```json
  {
    "source_text": "string", // Limited to 10,000 characters
    "target_language": "string", // ISO language code for translations (e.g. "pl", "en", "es")
    "generation_type": "string", // Optional: "vocabulary", "phrases", "definitions"
    "difficulty_level": "string", // Optional: "beginner", "intermediate", "advanced"
    "limit": "integer" // Optional: max number of flashcards to generate
  }
  ```
- **Response**:
  ```json
  {
    "detected_source_language": "string", // Detected language of source text
    "flashcards": [
      {
        "temp_id": "string",
        "front_content": "string",
        "back_content": "string",
        "context": "string", // Optional: context where the term appears
        "difficulty": "string" // Optional: difficulty assessment
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 413 Payload Too Large (if text > 10,000 chars)

#### Save Accepted Flashcards
- **Method**: POST
- **URL**: `/api/flashcards/accept`
- **Description**: Save user-selected flashcards to their permanent collection
- **Request Body**:
  ```json
  {
    "flashcards": [
      {
        "front_content": "string",
        "back_content": "string",
        "is_ai_generated": true
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "accepted_count": "integer",
    "flashcards": [
      {
        "id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "is_ai_generated": true,
        "created_at": "timestamp"
      }
    ]
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### Create Flashcard
- **Method**: POST
- **URL**: `/api/flashcards`
- **Description**: Create a new flashcard manually
- **Request Body**:
  ```json
  {
    "front_content": "string", // Limited to 500 characters
    "back_content": "string"   // Limited to 200 characters
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "is_ai_generated": false,
    "created_at": "timestamp",
    "correct_answers_count": 0
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### Get All Flashcards
- **Method**: GET
- **URL**: `/api/flashcards`
- **Description**: Get all flashcards for the authenticated user
- **Query Parameters**:
  - `page`: number (default: 1)
  - `per_page`: number (default: 20, max: 100)
  - `sort_by`: string (options: "created_at", "correct_answers_count")
  - `sort_dir`: string (options: "asc", "desc")
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "front_content": "string",
        "back_content": "string",
        "is_ai_generated": "boolean",
        "created_at": "timestamp",
        "correct_answers_count": "integer"
      }
    ],
    "pagination": {
      "total": "integer",
      "pages": "integer",
      "current_page": "integer",
      "per_page": "integer"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Get Flashcard
- **Method**: GET
- **URL**: `/api/flashcards/{id}`
- **Description**: Get a specific flashcard by ID
- **Response**:
  ```json
  {
    "id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "is_ai_generated": "boolean",
    "created_at": "timestamp",
    "correct_answers_count": "integer"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### Update Flashcard
- **Method**: PUT
- **URL**: `/api/flashcards/{id}`
- **Description**: Update an existing flashcard
- **Request Body**:
  ```json
  {
    "front_content": "string", // Limited to 500 characters
    "back_content": "string"   // Limited to 200 characters
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "is_ai_generated": "boolean",
    "created_at": "timestamp",
    "correct_answers_count": "integer"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### Delete Flashcard
- **Method**: DELETE
- **URL**: `/api/flashcards/{id}`
- **Description**: Delete a flashcard
- **Response**: No content
- **Success Codes**: 204 No Content
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### Batch Delete Flashcards
- **Method**: DELETE
- **URL**: `/api/flashcards`
- **Description**: Delete multiple flashcards
- **Request Body**:
  ```json
  {
    "flashcard_ids": ["uuid", "uuid", "uuid"]
  }
  ```
- **Response**: No content
- **Success Codes**: 204 No Content
- **Error Codes**: 400 Bad Request, 401 Unauthorized

### Learning Sessions

#### Start Learning Session
- **Method**: POST
- **URL**: `/api/learning/sessions`
- **Description**: Start a new learning session and get flashcards due for review
- **Request Body**:
  ```json
  {
    "limit": "integer" // Optional, default: 20
  }
  ```
- **Response**:
  ```json
  {
    "session_id": "uuid",
    "flashcards": [
      {
        "id": "uuid",
        "front_content": "string"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Get Flashcard for Review
- **Method**: GET
- **URL**: `/api/flashcards/{id}/review`
- **Description**: Get the full flashcard content including the back content for self-checking
- **Response**:
  ```json
  {
    "id": "uuid",
    "front_content": "string",
    "back_content": "string",
    "is_ai_generated": "boolean"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### Review Flashcard
- **Method**: POST
- **URL**: `/api/flashcards/{id}/review`
- **Description**: Submit a review for a flashcard after studying
- **Request Body**:
  ```json
  {
    "difficulty_rating": "string", // "nie_pamietam", "trudne", "srednie", "latwe"
    "is_correct": "boolean",
    "session_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "next_review_date": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### End Learning Session
- **Method**: PUT
- **URL**: `/api/learning/sessions/{session_id}`
- **Description**: End a learning session and get summary statistics
- **Response**:
  ```json
  {
    "session_summary": {
      "flashcards_reviewed": "integer",
      "correct_answers": "integer",
      "incorrect_answers": "integer",
      "completion_percentage": "number",
      "duration_seconds": "integer"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### Get Due Flashcards Count
- **Method**: GET
- **URL**: `/api/learning/due-count`
- **Description**: Get the count of flashcards due for review
- **Response**:
  ```json
  {
    "due_today": "integer",
    "due_next_week": {
      "total": "integer",
      "by_day": [
        {
          "date": "string", // YYYY-MM-DD format
          "count": "integer"
        }
      ]
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

## 3. Authentication and Authorization

The API will use Supabase Auth for user authentication and authorization. This provides:

1. **Authentication Mechanism**:
   - JWT-based authentication
   - User registration and login via email/password
   - Session management with refresh tokens

2. **Implementation Details**:
   - All API requests (except for registration and login) require a valid JWT token in the Authorization header
   - Format: `Authorization: Bearer {jwt_token}`
   - The token is obtained during login and contains the user ID
   - Tokens expire after a configurable period (default 1 hour)
   - Refresh tokens allow obtaining new access tokens without re-login

3. **Authorization**:
   - Row Level Security (RLS) policies in Supabase enforce that users can only access their own data
   - The API will validate that users only access resources they own
   - The user's ID from the JWT is used to filter data in all requests

## 4. Validation and Business Logic

### Validation Rules

#### User Validation
- Email must be a valid email format
- Password must be at least 8 characters long
- Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character

#### Flashcard Validation
- Front content is required and limited to 500 characters
- Back content is required and limited to 200 characters
- Source text for AI generation is limited to 10,000 characters

#### Flashcard Review Validation
- Difficulty rating must be one of: "nie_pamietam", "trudne", "srednie", "latwe"
- is_correct must be a boolean

### Business Logic Implementation

1. **AI Flashcard Generation**:
   - The API will integrate with an AI provider (via OpenRouter.ai) to generate flashcards from text
   - Generated flashcards are returned directly to the client application for user review
   - The client application presents the generated flashcards to the user for review
   - The user selects which flashcards to accept and keep in their collection
   - Selected flashcards are saved to the `flashcards` table with is_ai_generated = true
   - The generation process will extract key concepts and create appropriate question-answer pairs
   - A maximum of 20 flashcards will be generated per request to maintain quality

2. **Spaced Repetition Algorithm**:
   - The next_review_date for each flashcard is calculated based on user performance
   - For "nie_pamietam" ratings, the flashcard is scheduled for review the next day
   - For "trudne" ratings, the interval is at least 2 days
   - For "srednie" ratings, the interval is at least 4 days or 1.5x the previous interval
   - For "latwe" ratings, the interval is at least 7 days or 2x the previous interval
   - The algorithm is implemented using the calculate_next_review_date database function

3. **Learning Session Management**:
   - Sessions track a user's progress through a set of flashcards
   - Flashcards are presented in order of priority (due first, then new)
   - The client application shows only the front_content initially
   - The user attempts to recall the answer, then uses the `/api/flashcards/{id}/review` GET endpoint to see the back_content
   - The user self-assesses their performance and submits a review with a difficulty rating and correctness status
   - Session statistics are calculated at the end of each session
   - Incomplete sessions can be resumed later

4. **Data Access Control**:
   - All data access is filtered by the user_id derived from the JWT token
   - Database RLS policies enforce that users can only access their own data
   - Endpoints validate resource ownership before allowing operations 

5. **Flashcard Review and Acceptance Flow**:
   - AI generates flashcards based on user-provided text
   - The generated flashcards are returned to the client application for user review
   - The user reviews each flashcard and decides which ones to keep
   - Only flashcards explicitly accepted by the user are saved to the flashcards table
   - Accepted flashcards become part of the user's permanent collection 